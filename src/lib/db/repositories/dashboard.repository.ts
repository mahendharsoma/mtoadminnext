import { BaseRepository } from "@/lib/db/repositories/base.repository";
import { TABLES } from "@/lib/constants";
import type {
  CondemnationReportRow,
  DashboardStats,
  IssuedStockReportRow,
  StockReportRow,
  VehicleOverallServiceReportRow,
} from "@/lib/types";
import type { RowDataPacket } from "mysql2/promise";
import { vehicleRepository } from "./vehicle.repository";
import { jobCardRepository } from "./job-card.repository";
import { inventoryRepository } from "./inventory.repository";
import { mechanicsRepository } from "./mechanics.repository";
import { psRepository } from "./ps.repository";
import { lubricantRepository } from "./inspection.repository";

export class DashboardRepository extends BaseRepository {
  async getStats(): Promise<DashboardStats> {
    const [
      totalVehicles,
      approvedJobCards,
      closedJobCards,
      activeJobCards,
      receivedVouchers,
      totalStockQuantity,
      mechanics,
      psCount,
    ] = await Promise.all([
      vehicleRepository.countVehicles(),
      jobCardRepository.countByStatus("Approve"),
      jobCardRepository.countByStatus("Close"),
      jobCardRepository.countByStatus("Active"),
      inventoryRepository.countVouchers(),
      inventoryRepository.getTotalAvailableQuantity(),
      mechanicsRepository.findAll(),
      psRepository.countPs(),
    ]);

    return {
      totalVehicles,
      approvedJobCards,
      closedJobCards,
      activeJobCards,
      receivedVouchers,
      totalStockQuantity,
      totalMechanics: mechanics.length,
      psCount,
    };
  }
}

export class ReportsRepository extends BaseRepository {
  async getRvDcReport(): Promise<RowDataPacket[]> {
    return this.selectAll(
      `SELECT rv.held_date AS report_date,
              rv.note_file_no,
              rv.received_voucher AS rv_dc_number,
              bi.received_from,
              mt.make_type AS make_name,
              vv.variant_name,
              iname.item_name,
              bi.total_quantity AS sanctioned_qty,
              COALESCE(SUM(it.received_quantity), 0) AS received_qty,
              GROUP_CONCAT(
                CONCAT(
                  DATE_FORMAT(it.received_date, '%Y-%m-%d'),
                  ' - ',
                  it.received_quantity,
                  ' QTY'
                )
                ORDER BY it.received_date SEPARATOR ', '
              ) AS received_date_qty,
              (bi.total_quantity - COALESCE(SUM(it.received_quantity), 0)) AS pending_qty,
              CASE
                WHEN (bi.total_quantity - COALESCE(SUM(it.received_quantity), 0)) <= 0 THEN 'Close'
                ELSE 'Open'
              END AS item_status
       FROM ${TABLES.RECEIVED_VOUCHERS} rv
       JOIN ${TABLES.BULK_ITEMS} bi ON bi.received_voucher_id = rv.received_voucher_id
       LEFT JOIN ${TABLES.VEHICLE_MAKE_TYPE} mt ON mt.make_type_id = bi.make_type_id
       LEFT JOIN ${TABLES.VEHICLE_VARIANT} vv ON vv.variant_id = bi.variant_id
       LEFT JOIN ${TABLES.ITEM_NAME} iname ON iname.item_name_id = bi.item_name_id
       LEFT JOIN ${TABLES.ITEM_TRANSACTION} it ON it.bulk_items_id = bi.bulk_items_id
       GROUP BY bi.bulk_items_id
       ORDER BY rv.held_date DESC, bi.bulk_items_id DESC`
    );
  }

  async getDailyJobCardReport(
    fromDate: string,
    toDate: string,
    serviceTypeId?: number
  ): Promise<RowDataPacket[]> {
    const jc = TABLES.JOB_CARD;
    const v = TABLES.VEHICLES;
    const ps = TABLES.POLICE_STATION;
    const mt = TABLES.VEHICLE_MAKE_TYPE;
    const vv = TABLES.VEHICLE_VARIANT;
    const o = TABLES.OFFICERS;
    const m = TABLES.MECHANICS;
    const jcm = TABLES.JOB_CARD_MECHANIC_MAPPING;
    const vai = TABLES.VEHICLE_ALLOCATED_ITEMS;
    const iname = TABLES.ITEM_NAME;
    const ii = TABLES.ITEM_INVENTORY;

    const params: (string | number)[] = [fromDate, toDate];
    let serviceFilter = "";

    if (serviceTypeId) {
      serviceFilter = ` AND jc.service_type_id = ?`;
      params.push(serviceTypeId);
    }

    return this.selectAll(
      `SELECT jc.*,
              jc.status AS job_card_status,
              veh.ps_id,
              veh.registration_no,
              ps.ps_name,
              mt.make_type AS make_type_name,
              vv.variant_name,
              officer_alias.officer_name,
              officer_alias.officer_rank,
              driver_alias.officer_name AS driver_name,
              driver_alias.officer_rank AS driver_rank,
              GROUP_CONCAT(DISTINCT mech.mechanic_name SEPARATOR ',<br>') AS mechanic_names,
              GROUP_CONCAT(
                DISTINCT CONCAT(
                  allocated_items.item_name,
                  ' (Qty: ', allocated_items.item_quantity,
                  ', Price: ', FORMAT(allocated_items.item_price, 2),
                  ', Total: ', FORMAT(allocated_items.total_item_price, 2), ')'
                ) SEPARATOR ',<br>'
              ) AS allocated_items_details,
              IFNULL(SUM(DISTINCT allocated_items.total_item_price), 0) AS job_card_total_price
       FROM ${jc} jc
       LEFT JOIN (
         SELECT vai.job_card_id,
                iname.item_name,
                COUNT(*) AS item_quantity,
                MAX(ii.item_price) AS item_price,
                (COUNT(*) * MAX(ii.item_price)) AS total_item_price
         FROM ${vai} vai
         LEFT JOIN ${iname} iname ON iname.item_name_id = vai.item_name_id
         LEFT JOIN ${ii} ii ON ii.item_inventory_id = vai.item_inventory_id
         GROUP BY vai.job_card_id, vai.item_name_id
       ) AS allocated_items ON allocated_items.job_card_id = jc.job_card_id
       JOIN ${v} veh ON veh.vehicle_id = jc.vehicle_id
       JOIN ${ps} ps ON ps.ps_id = veh.ps_id
       JOIN ${mt} mt ON mt.make_type_id = jc.make_type_id
       JOIN ${vv} vv ON vv.variant_id = jc.variant_id
       LEFT JOIN ${o} officer_alias ON officer_alias.officer_id = jc.officer_id
       LEFT JOIN ${o} driver_alias ON driver_alias.officer_id = jc.driver_id
       LEFT JOIN ${jcm} jcm ON jcm.job_card_id = jc.job_card_id
       LEFT JOIN ${m} mech ON mech.mechanic_id = jcm.mechanic_id
       WHERE jc.date_in >= ? AND jc.date_in <= ?${serviceFilter}
       GROUP BY jc.job_card_id, veh.ps_id, veh.registration_no, ps.ps_name, mt.make_type, vv.variant_name,
                officer_alias.officer_name, officer_alias.officer_rank,
                driver_alias.officer_name, driver_alias.officer_rank
       ORDER BY jc.created_on DESC`,
      params
    );
  }

  async getStockReport(): Promise<StockReportRow[]> {
    return this.selectAll<StockReportRow>(
      `SELECT
         i.inventory_id,
         i.make_type_id,
         i.variant_id,
         i.item_name_id,
         i.is_common,
         m.make_type AS make_type,
         vv.variant_name,
         iname.item_name,
         COALESCE(CAST(bi.total_quantity AS SIGNED), i.total_quantity, 0) AS total_sanctioned_quantity,
         GREATEST(
           COALESCE(CAST(bi.total_quantity AS SIGNED), i.total_quantity, 0) -
           COALESCE(txn.received_quantity, 0),
           0
         ) AS pending_quantity,
         COALESCE(txn.received_quantity, 0) AS received_quantity,
         i.available_quantity
       FROM ${TABLES.INVENTORY} i
       LEFT JOIN ${TABLES.BULK_ITEMS} bi ON bi.bulk_items_id = i.bulk_items_id
       LEFT JOIN (
         SELECT bulk_items_id, SUM(received_quantity) AS received_quantity
         FROM ${TABLES.ITEM_TRANSACTION}
         GROUP BY bulk_items_id
       ) txn ON txn.bulk_items_id = i.bulk_items_id
       LEFT JOIN ${TABLES.VEHICLE_MAKE_TYPE} m ON m.make_type_id = i.make_type_id
       LEFT JOIN ${TABLES.VEHICLE_VARIANT} vv ON vv.variant_id = i.variant_id
       LEFT JOIN ${TABLES.ITEM_NAME} iname ON iname.item_name_id = i.item_name_id
       ORDER BY iname.item_name`
    );
  }

  async getIssuedStockReport(
    fromDate: string,
    toDate: string,
    variantId?: number,
    itemNameId?: number
  ): Promise<IssuedStockReportRow[]> {
    const params: Array<string | number> = [fromDate, toDate];
    let filters = "";

    if (variantId) {
      filters += ` AND vai.variant_id = ?`;
      params.push(variantId);
    }
    if (itemNameId) {
      filters += ` AND vai.item_name_id = ?`;
      params.push(itemNameId);
    }

    return this.selectAll<IssuedStockReportRow>(
      `SELECT DATE(vai.created_on) AS issued_date,
              MAX(vai.created_on) AS created_on,
              vai.make_type_id,
              vai.variant_id,
              vai.item_name_id,
              mt.make_type,
              vv.variant_name,
              iname.item_name,
              jc.vehicle_id,
              v.registration_no,
              MAX(ii.is_common) AS is_common,
              COUNT(*) AS total_issued_stock
       FROM ${TABLES.VEHICLE_ALLOCATED_ITEMS} vai
       JOIN ${TABLES.VEHICLE_MAKE_TYPE} mt ON mt.make_type_id = vai.make_type_id
       JOIN ${TABLES.VEHICLE_VARIANT} vv ON vv.variant_id = vai.variant_id
       JOIN ${TABLES.ITEM_NAME} iname ON iname.item_name_id = vai.item_name_id
       JOIN ${TABLES.JOB_CARD} jc ON jc.job_card_id = vai.job_card_id
       JOIN ${TABLES.VEHICLES} v ON v.vehicle_id = jc.vehicle_id
       JOIN ${TABLES.ITEM_INVENTORY} ii ON ii.item_inventory_id = vai.item_inventory_id
       WHERE DATE(vai.created_on) >= ?
         AND DATE(vai.created_on) <= ?${filters}
       GROUP BY DATE(vai.created_on),
                jc.vehicle_id,
                v.registration_no,
                vai.make_type_id,
                vai.variant_id,
                vai.item_name_id,
                mt.make_type,
                vv.variant_name,
                iname.item_name
       ORDER BY iname.item_name ASC, DATE(vai.created_on) ASC`,
      params
    );
  }

  async getCondemnationReport(condemnedStatus = "Received"): Promise<CondemnationReportRow[]> {
    const c = TABLES.CONDEMNATION;
    const jc = TABLES.JOB_CARD;
    const v = TABLES.VEHICLES;
    const mt = TABLES.VEHICLE_MAKE_TYPE;
    const vv = TABLES.VEHICLE_VARIANT;
    const iname = TABLES.ITEM_NAME;
    const ii = TABLES.ITEM_INVENTORY;
    const bi = TABLES.BULK_ITEMS;
    const rv = TABLES.RECEIVED_VOUCHERS;

    return this.selectAll<CondemnationReportRow>(
      `SELECT c.*,
              jc.vehicle_id, jc.job_type_id, jc.service_type_id, jc.it_no, jc.remarks, jc.outside_work_shop, jc.outside_parts,
              v.registration_no,
              mt.make_type,
              vv.variant_name,
              iname.item_name,
              ii.bulk_items_id,
              bi.received_voucher_id,
              rv.received_voucher,
              rv.held_date,
              IFNULL(COUNT(c.item_name_id), 0) AS item_quantity
       FROM ${c} c
       JOIN ${jc} jc ON jc.job_card_id = c.job_card_id
       JOIN ${v} v ON v.vehicle_id = jc.vehicle_id
       JOIN ${mt} mt ON mt.make_type_id = c.make_type_id
       JOIN ${vv} vv ON vv.variant_id = c.variant_id
       JOIN ${iname} iname ON iname.item_name_id = c.item_name_id
       JOIN ${ii} ii ON ii.item_inventory_id = c.item_inventory_id
       JOIN ${bi} bi ON bi.bulk_items_id = ii.bulk_items_id
       JOIN ${rv} rv ON rv.received_voucher_id = bi.received_voucher_id
       WHERE c.status = ?
       GROUP BY c.job_card_id, c.make_type_id, c.variant_id, c.item_name_id
       ORDER BY c.condemnation_id DESC`,
      [condemnedStatus]
    );
  }

  async getOfficerVehicleAllotmentReport(): Promise<RowDataPacket[]> {
    const v = TABLES.VEHICLES;
    const mt = TABLES.VEHICLE_MAKE_TYPE;
    const vv = TABLES.VEHICLE_VARIANT;
    const ovm = TABLES.OFFICER_VEHICLE_MAPPING;
    const dvm = TABLES.DRIVER_VEHICLE_MAPPING;
    const o = TABLES.OFFICERS;
    const ps = TABLES.POLICE_STATION;

    return this.selectAll(
      `SELECT v.vehicle_id, v.registration_no, v.model_year,
              mt.make_type, vv.variant_name,
              ovm.officer_id, ps.ps_name,
              officer.officer_name,
              GROUP_CONCAT(DISTINCT driver.officer_name ORDER BY driver.officer_name SEPARATOR ', ') AS driver_names
       FROM ${v} v
       LEFT JOIN ${mt} mt ON mt.make_type_id = v.make_type_id
       LEFT JOIN ${vv} vv ON vv.variant_id = v.variant_id
       LEFT JOIN ${ovm} ovm ON ovm.vehicle_id = v.vehicle_id
       LEFT JOIN ${dvm} dvm ON dvm.vehicle_id = v.vehicle_id
       LEFT JOIN ${o} officer ON officer.officer_id = ovm.officer_id
       LEFT JOIN ${o} driver ON driver.officer_id = dvm.driver_id
       LEFT JOIN ${ps} ps ON ps.ps_id = v.ps_id
       GROUP BY v.vehicle_id, v.registration_no, v.model_year, mt.make_type, vv.variant_name,
                ovm.officer_id, ps.ps_name, officer.officer_name
       ORDER BY v.vehicle_id DESC`
    );
  }

  async getVehicleFuelReport(month: number, year: number): Promise<RowDataPacket[]> {
    return this.selectAll(
      `SELECT vf.vehicle_fuel_id,
              vf.vehicle_id,
              vf.filling_date,
              vf.previous_reading,
              vf.current_reading,
              vf.liters,
              vf.mileage,
              v.registration_no
       FROM ${TABLES.VEHICLE_FUEL} vf
       JOIN ${TABLES.VEHICLES} v ON v.vehicle_id = vf.vehicle_id
       WHERE MONTH(vf.filling_date) = ? AND YEAR(vf.filling_date) = ?
       ORDER BY vf.filling_date ASC, vf.vehicle_fuel_id ASC`,
      [month, year]
    );
  }

  async getInspectionTitleReport(month: number, year: number): Promise<RowDataPacket[]> {
    return this.selectAll(
      `SELECT itm.inspection_title_mapping_id,
              i.inspection_id,
              i.job_card_id,
              i.inspected_on,
              v.registration_no,
              vt.vehicle_type_name,
              tit.inspection_title,
              itm.remark,
              i.inspected_by
       FROM ${TABLES.INSPECTION_TITLE_MAPPING} itm
       JOIN ${TABLES.INSPECTIONS} i ON i.inspection_id = itm.inspection_id
       JOIN ${TABLES.INSPECTION_TITLES} tit ON tit.inspection_title_id = itm.inspection_title_id
       LEFT JOIN ${TABLES.VEHICLE_TYPES} vt ON vt.vehicle_type_id = itm.vehicle_type_id
       LEFT JOIN ${TABLES.VEHICLES} v ON v.vehicle_id = i.vehicle_id
       WHERE MONTH(i.inspected_on) = ? AND YEAR(i.inspected_on) = ?
       ORDER BY i.inspected_on DESC, itm.inspection_title_mapping_id DESC`,
      [month, year]
    );
  }

  async getJobCardsByVehicleId(vehicleId: number): Promise<VehicleOverallServiceReportRow[]> {
    return this.selectAll<VehicleOverallServiceReportRow>(
      `SELECT jc.*,
              jc.status AS job_card_status,
              v.registration_no,
              mt.make_type,
              vv.variant_name,
              ps.ps_name,
              GROUP_CONCAT(
                DISTINCT CONCAT(
                  iname.item_name,
                  IF(ii.item_price IS NULL OR ii.item_price = '', '', CONCAT(' (', FORMAT(ii.item_price, 2), ')'))
                )
                ORDER BY iname.item_name
                SEPARATOR ', '
              ) AS issued_items
       FROM ${TABLES.JOB_CARD} jc
       LEFT JOIN ${TABLES.VEHICLES} v ON v.vehicle_id = jc.vehicle_id
       LEFT JOIN ${TABLES.VEHICLE_MAKE_TYPE} mt ON mt.make_type_id = jc.make_type_id
       LEFT JOIN ${TABLES.VEHICLE_VARIANT} vv ON vv.variant_id = jc.variant_id
       LEFT JOIN ${TABLES.POLICE_STATION} ps ON ps.ps_id = v.ps_id
       LEFT JOIN ${TABLES.VEHICLE_ALLOCATED_ITEMS} vai ON vai.job_card_id = jc.job_card_id
       LEFT JOIN ${TABLES.ITEM_INVENTORY} ii ON ii.item_inventory_id = vai.item_inventory_id
       LEFT JOIN ${TABLES.ITEM_NAME} iname ON iname.item_name_id = ii.item_name_id
       WHERE jc.vehicle_id = ?
         AND jc.status = 'Close'
       GROUP BY jc.job_card_id
       ORDER BY jc.job_card_id DESC`,
      [vehicleId]
    );
  }

  async getLubricantInventoryReport(): Promise<RowDataPacket[]> {
    return lubricantRepository.getLubricantInventory();
  }
}

export const dashboardRepository = new DashboardRepository();
export const reportsRepository = new ReportsRepository();
