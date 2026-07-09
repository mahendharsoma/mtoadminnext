import { BaseRepository } from "@/lib/db/repositories/base.repository";
import { TABLES } from "@/lib/constants";
import fs from "node:fs/promises";
import path from "node:path";
import type {
  VehicleType,
  InspectionTitle,
  Inspection,
  LubricantType,
  LubricantGrade,
  Lubricant,
  LubricantReceiveVoucher,
  LubricantVoucherItem,
  LubricantVoucherContainer,
} from "@/lib/types";
import type { PoolConnection, ResultSetHeader, RowDataPacket } from "mysql2/promise";

export class InspectionRepository extends BaseRepository {
  async getAllVehicleTypes(): Promise<VehicleType[]> {
    return this.selectAll<VehicleType>(
      `SELECT * FROM ${TABLES.VEHICLE_TYPES} ORDER BY vehicle_type_name`
    );
  }

  async createVehicleType(data: Record<string, unknown>): Promise<number> {
    return this.insertRecord(
      `INSERT INTO ${TABLES.VEHICLE_TYPES} (vehicle_type_name, created_by, created_on)
       VALUES (?, ?, ?)`,
      this.buildParams([data.vehicle_type_name, data.created_by, data.created_on])
    );
  }

  async updateVehicleType(id: number, data: Record<string, unknown>): Promise<void> {
    const fields = Object.keys(data).map((k) => `${k} = ?`).join(", ");
    await this.executeUpdate(
      `UPDATE ${TABLES.VEHICLE_TYPES} SET ${fields} WHERE vehicle_type_id = ?`,
      this.buildParams([...Object.values(data), id])
    );
  }

  async deleteVehicleType(id: number): Promise<void> {
    await this.executeDelete(`DELETE FROM ${TABLES.VEHICLE_TYPES} WHERE vehicle_type_id = ?`, [id]);
  }

  async getInspectionTitles(vehicleTypeId: number): Promise<InspectionTitle[]> {
    return this.selectAll<InspectionTitle>(
      `SELECT it.*, vt.vehicle_type_name FROM ${TABLES.INSPECTION_TITLES} it
       JOIN ${TABLES.VEHICLE_TYPES} vt ON vt.vehicle_type_id = it.vehicle_type_id
       WHERE it.vehicle_type_id = ? ORDER BY it.inspection_title`,
      [vehicleTypeId]
    );
  }

  async createInspectionTitle(data: Record<string, unknown>): Promise<number> {
    return this.insertRecord(
      `INSERT INTO ${TABLES.INSPECTION_TITLES}
       (vehicle_type_id, inspection_title, created_by, created_on)
       VALUES (?, ?, ?, ?)`,
      this.buildParams([
        data.vehicle_type_id,
        data.inspection_title,
        data.created_by,
        data.created_on,
      ])
    );
  }

  async updateInspectionTitle(id: number, data: Record<string, unknown>): Promise<void> {
    const fields = Object.keys(data).map((k) => `${k} = ?`).join(", ");
    await this.executeUpdate(
      `UPDATE ${TABLES.INSPECTION_TITLES} SET ${fields} WHERE inspection_title_id = ?`,
      this.buildParams([...Object.values(data), id])
    );
  }

  async deleteInspectionTitle(id: number): Promise<void> {
    await this.executeDelete(
      `DELETE FROM ${TABLES.INSPECTION_TITLES} WHERE inspection_title_id = ?`,
      [id]
    );
  }

  async getInspectionsByVehicle(vehicleId: number): Promise<Inspection[]> {
    return this.selectAll<Inspection>(
      `SELECT i.inspection_id,
              i.job_card_id,
              i.vehicle_id,
              i.inspected_by,
              i.inspected_on,
              i.general_number,
              i.comment,
              v.registration_no
       FROM ${TABLES.INSPECTIONS} i
       LEFT JOIN ${TABLES.VEHICLES} v ON v.vehicle_id = i.vehicle_id
       WHERE i.vehicle_id = ?
       ORDER BY i.inspection_id DESC`,
      [vehicleId]
    );
  }

  async getInspectionsByMonth(month: number, year: number): Promise<Inspection[]> {
    return this.selectAll<Inspection>(
      `SELECT i.inspection_id,
              i.job_card_id,
              i.vehicle_id,
              i.inspected_by,
              i.inspected_on,
              i.general_number,
              i.comment,
              v.registration_no
       FROM ${TABLES.INSPECTIONS} i
       LEFT JOIN ${TABLES.VEHICLES} v ON v.vehicle_id = i.vehicle_id
       WHERE MONTH(i.inspected_on) = ? AND YEAR(i.inspected_on) = ?
       ORDER BY i.inspection_id DESC`,
      [month, year]
    );
  }
}

export class LubricantRepository extends BaseRepository {
  private readonly containerTransactionsTable = "lubricant_container_transactions";

  async getAllTypes(): Promise<LubricantType[]> {
    return this.selectAll<LubricantType>(
      `SELECT * FROM ${TABLES.LUBRICANT_TYPE} ORDER BY lubricant_type_name`
    );
  }

  async typeExists(name: string, excludeId?: number): Promise<boolean> {
    const sql = excludeId
      ? `SELECT lubricant_type_id
         FROM ${TABLES.LUBRICANT_TYPE}
         WHERE LOWER(TRIM(lubricant_type_name)) = LOWER(TRIM(?))
           AND lubricant_type_id != ?`
      : `SELECT lubricant_type_id
         FROM ${TABLES.LUBRICANT_TYPE}
         WHERE LOWER(TRIM(lubricant_type_name)) = LOWER(TRIM(?))`;
    const params = excludeId ? [name, excludeId] : [name];
    return (await this.selectOne<LubricantType>(sql, params)) !== null;
  }

  async createType(data: Record<string, unknown>): Promise<number> {
    return this.insertRecord(
      `INSERT INTO ${TABLES.LUBRICANT_TYPE} (lubricant_type_name, created_by, created_on)
       VALUES (?, ?, ?)`,
      this.buildParams([data.lubricant_type_name, data.created_by, data.created_on])
    );
  }

  async updateType(id: number, data: Record<string, unknown>): Promise<void> {
    const fields = Object.keys(data).map((k) => `${k} = ?`).join(", ");
    await this.executeUpdate(
      `UPDATE ${TABLES.LUBRICANT_TYPE} SET ${fields} WHERE lubricant_type_id = ?`,
      this.buildParams([...Object.values(data), id])
    );
  }

  async deleteType(id: number): Promise<void> {
    await this.executeDelete(`DELETE FROM ${TABLES.LUBRICANT_TYPE} WHERE lubricant_type_id = ?`, [id]);
  }

  async getAllGrades(): Promise<LubricantGrade[]> {
    return this.selectAll<LubricantGrade>(
      `SELECT lubricant_grade_id, lubricant_grade AS lubricant_grade_name, created_by, created_on, updated_by, updated_on
       FROM ${TABLES.LUBRICANT_GRADES} ORDER BY lubricant_grade`
    );
  }

  async createGrade(data: Record<string, unknown>): Promise<number> {
    return this.insertRecord(
      `INSERT INTO ${TABLES.LUBRICANT_GRADES} (lubricant_grade, created_by, created_on)
       VALUES (?, ?, ?)`,
      this.buildParams([data.lubricant_grade_name, data.created_by, data.created_on])
    );
  }

  async gradeExists(name: string, excludeId?: number): Promise<boolean> {
    const sql = excludeId
      ? `SELECT lubricant_grade_id
         FROM ${TABLES.LUBRICANT_GRADES}
         WHERE LOWER(TRIM(lubricant_grade)) = LOWER(TRIM(?))
           AND lubricant_grade_id != ?`
      : `SELECT lubricant_grade_id
         FROM ${TABLES.LUBRICANT_GRADES}
         WHERE LOWER(TRIM(lubricant_grade)) = LOWER(TRIM(?))`;
    const params = excludeId ? [name, excludeId] : [name];
    return (await this.selectOne<LubricantGrade>(sql, params)) !== null;
  }

  async updateGrade(id: number, data: Record<string, unknown>): Promise<void> {
    const fields = Object.keys(data).map((k) => `${k} = ?`).join(", ");
    await this.executeUpdate(
      `UPDATE ${TABLES.LUBRICANT_GRADES} SET ${fields} WHERE lubricant_grade_id = ?`,
      this.buildParams([...Object.values(data), id])
    );
  }

  async deleteGrade(id: number): Promise<void> {
    await this.executeDelete(
      `DELETE FROM ${TABLES.LUBRICANT_GRADES} WHERE lubricant_grade_id = ?`,
      [id]
    );
  }

  async getAllLubricants(): Promise<Lubricant[]> {
    return this.selectAll<Lubricant>(
      `SELECT l.*, lt.lubricant_type_name, lg.lubricant_grade AS lubricant_grade_name
       FROM ${TABLES.LUBRICANTS} l
       JOIN ${TABLES.LUBRICANT_TYPE} lt ON lt.lubricant_type_id = l.lubricant_type_id
       JOIN ${TABLES.LUBRICANT_GRADES} lg ON lg.lubricant_grade_id = l.lubricant_grade_id
       ORDER BY l.lubricant_id DESC`
    );
  }

  async createLubricant(data: Record<string, unknown>): Promise<number> {
    return this.insertRecord(
      `INSERT INTO ${TABLES.LUBRICANTS}
       (lubricant_type_id, lubricant_grade_id, lubricant_name, created_by, created_on)
       VALUES (?, ?, ?, ?, ?)`,
      this.buildParams([
        data.lubricant_type_id,
        data.lubricant_grade_id,
        data.lubricant_name,
        data.created_by,
        data.created_on,
      ])
    );
  }

  async lubricantNameExists(name: string, excludeId?: number): Promise<boolean> {
    const sql = excludeId
      ? `SELECT lubricant_id
         FROM ${TABLES.LUBRICANTS}
         WHERE LOWER(TRIM(lubricant_name)) = LOWER(TRIM(?))
           AND lubricant_id != ?`
      : `SELECT lubricant_id
         FROM ${TABLES.LUBRICANTS}
         WHERE LOWER(TRIM(lubricant_name)) = LOWER(TRIM(?))`;
    const params = excludeId ? [name, excludeId] : [name];
    return (await this.selectOne<Lubricant>(sql, params)) !== null;
  }

  async updateLubricant(id: number, data: Record<string, unknown>): Promise<void> {
    const fields = Object.keys(data).map((k) => `${k} = ?`).join(", ");
    await this.executeUpdate(
      `UPDATE ${TABLES.LUBRICANTS} SET ${fields} WHERE lubricant_id = ?`,
      this.buildParams([...Object.values(data), id])
    );
  }

  async deleteLubricant(id: number): Promise<void> {
    await this.executeDelete(`DELETE FROM ${TABLES.LUBRICANTS} WHERE lubricant_id = ?`, [id]);
  }

  async getLubricantInventory(): Promise<RowDataPacket[]> {
    return this.selectAll(
      `SELECT li.*, l.lubricant_name, lt.lubricant_type_name, lg.lubricant_grade AS lubricant_grade_name
       FROM ${TABLES.LUBRICANT_INVENTORY} li
       JOIN ${TABLES.LUBRICANTS} l ON l.lubricant_id = li.lubricant_id
       JOIN ${TABLES.LUBRICANT_TYPE} lt ON lt.lubricant_type_id = l.lubricant_type_id
       JOIN ${TABLES.LUBRICANT_GRADES} lg ON lg.lubricant_grade_id = l.lubricant_grade_id
       ORDER BY l.lubricant_name`
    );
  }

  async getLubricantVouchers(): Promise<LubricantReceiveVoucher[]> {
    return this.selectAll<LubricantReceiveVoucher>(
      `SELECT * FROM ${TABLES.LUBRICANT_RECEIVE_VOUCHER} ORDER BY lubricant_receive_voucher_id DESC`
    );
  }

  async getLubricantVouchersByDateRange(fromDate: string, toDate: string): Promise<LubricantReceiveVoucher[]> {
    return this.selectAll<LubricantReceiveVoucher>(
      `SELECT *
       FROM ${TABLES.LUBRICANT_RECEIVE_VOUCHER}
       WHERE DATE(created_on) >= ? AND DATE(created_on) <= ?
       ORDER BY lubricant_receive_voucher_id DESC`,
      [fromDate, toDate]
    );
  }

  async voucherNoExists(voucherNo: string, excludeId?: number): Promise<boolean> {
    const sql = excludeId
      ? `SELECT lubricant_receive_voucher_id
         FROM ${TABLES.LUBRICANT_RECEIVE_VOUCHER}
         WHERE LOWER(TRIM(voucher_no)) = LOWER(TRIM(?))
           AND lubricant_receive_voucher_id != ?`
      : `SELECT lubricant_receive_voucher_id
         FROM ${TABLES.LUBRICANT_RECEIVE_VOUCHER}
         WHERE LOWER(TRIM(voucher_no)) = LOWER(TRIM(?))`;
    const params = excludeId ? [voucherNo, excludeId] : [voucherNo];
    return (await this.selectOne<RowDataPacket>(sql, params)) !== null;
  }

  async createLubricantVoucher(data: Record<string, unknown>): Promise<number> {
    return this.insertRecord(
      `INSERT INTO ${TABLES.LUBRICANT_RECEIVE_VOUCHER}
       (note_file_no, voucher_no, voucher_date, vendor_name, created_by, created_on)
       VALUES (?, ?, ?, ?, ?, ?)`,
      this.buildParams([
        data.note_file_no,
        data.voucher_no,
        data.voucher_date,
        data.vendor_name ?? "",
        data.created_by,
        data.created_on,
      ])
    );
  }

  async updateLubricantVoucher(id: number, data: Record<string, unknown>): Promise<void> {
    const fields = Object.keys(data).map((k) => `${k} = ?`).join(", ");
    await this.executeUpdate(
      `UPDATE ${TABLES.LUBRICANT_RECEIVE_VOUCHER} SET ${fields} WHERE lubricant_receive_voucher_id = ?`,
      this.buildParams([...Object.values(data), id])
    );
  }

  async getLubricantVoucherById(id: number): Promise<LubricantReceiveVoucher | null> {
    return this.selectOne<LubricantReceiveVoucher>(
      `SELECT * FROM ${TABLES.LUBRICANT_RECEIVE_VOUCHER} WHERE lubricant_receive_voucher_id = ?`,
      [id]
    );
  }

  async getParentVoucherItemsWithTotals(voucherId: number): Promise<LubricantVoucherItem[]> {
    return this.selectAll<LubricantVoucherItem>(
      `SELECT i.*, l.lubricant_name, lt.lubricant_type_name, lg.lubricant_grade AS lubricant_grade_name,
              COALESCE(r.total_received, 0) AS total_received_liters,
              (i.ordered_quantity - COALESCE(r.total_received, 0)) AS balance_liters
       FROM ${TABLES.LUBRICANT_RECEIVE_VOUCHER_ITEMS} i
       LEFT JOIN ${TABLES.LUBRICANTS} l ON l.lubricant_id = i.lubricant_id
       LEFT JOIN ${TABLES.LUBRICANT_TYPE} lt ON lt.lubricant_type_id = l.lubricant_type_id
       LEFT JOIN ${TABLES.LUBRICANT_GRADES} lg ON lg.lubricant_grade_id = l.lubricant_grade_id
       LEFT JOIN (
         SELECT parent_receive_item_id, COALESCE(SUM(quantity_liters), 0) AS total_received
         FROM ${TABLES.LUBRICANT_RECEIVE_VOUCHER_ITEMS}
         WHERE parent_receive_item_id IS NOT NULL
         GROUP BY parent_receive_item_id
       ) r ON r.parent_receive_item_id = i.receive_item_id
       WHERE i.lubricant_receive_voucher_id = ?
         AND i.parent_receive_item_id IS NULL
       ORDER BY i.receive_item_id ASC`,
      [voucherId]
    );
  }

  async getContainersByVoucherId(voucherId: number): Promise<LubricantVoucherContainer[]> {
    return this.selectAll<LubricantVoucherContainer>(
      `SELECT c.*, l.lubricant_name, lt.lubricant_type_name, lg.lubricant_grade AS lubricant_grade_name
       FROM ${TABLES.LUBRICANT_CONTAINERS} c
       LEFT JOIN ${TABLES.LUBRICANTS} l ON l.lubricant_id = c.lubricant_id
       LEFT JOIN ${TABLES.LUBRICANT_TYPE} lt ON lt.lubricant_type_id = l.lubricant_type_id
       LEFT JOIN ${TABLES.LUBRICANT_GRADES} lg ON lg.lubricant_grade_id = l.lubricant_grade_id
       WHERE c.voucher_id = ?
       ORDER BY c.lubricant_container_id ASC`,
      [voucherId]
    );
  }

  async insertVoucherItems(
    voucherId: number,
    items: Array<Record<string, unknown>>,
    userId: number,
    now: string
  ): Promise<void> {
    await this.withTransaction(async (connection) => {
      for (const item of items) {
        const lubricantId = Number(item.lubricant_id);
        const orderedQty = Number(item.quantity_liters);
        const pricePerLiter = Number(item.price_per_liter ?? 0);
        const cgstPercent = Number(item.cgst_percent ?? 0);
        const sgstPercent = Number(item.sgst_percent ?? 0);
        const igstPercent = Number(item.igst_percent ?? 0);
        if (!lubricantId || orderedQty <= 0 || Number.isNaN(pricePerLiter)) {
          throw new Error("INVALID_ITEM_DATA");
        }

        const amount = Number((orderedQty * pricePerLiter).toFixed(2));
        const cgstAmount = Number(((amount * cgstPercent) / 100).toFixed(2));
        const sgstAmount = Number(((amount * sgstPercent) / 100).toFixed(2));
        const igstAmount = Number(((amount * igstPercent) / 100).toFixed(2));
        const totalAmount = Number((amount + cgstAmount + sgstAmount + igstAmount).toFixed(2));

        await connection.execute(
          `INSERT INTO ${TABLES.LUBRICANT_RECEIVE_VOUCHER_ITEMS}
           (lubricant_receive_voucher_id, lubricant_id, quantity_liters, ordered_quantity, price_per_liter,
            amount, cgst_percent, cgst_amount, sgst_percent, sgst_amount, igst_percent, igst_amount,
            total_amount, created_by, created_on)
           VALUES (?, ?, 0, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            voucherId,
            lubricantId,
            orderedQty,
            pricePerLiter,
            amount,
            cgstPercent,
            cgstAmount,
            sgstPercent,
            sgstAmount,
            igstPercent,
            igstAmount,
            totalAmount,
            userId,
            now,
          ]
        );
      }
    });
  }

  async receivePartialQuantity(params: {
    parentReceiveItemId: number;
    receiveQuantity: number;
    litersPerContainer: number;
    userId: number;
    now: string;
  }): Promise<"ok" | "invalid_quantity" | "invalid_container_capacity" | "not_parent_item" | "exceeds_ordered_quantity"> {
    const { parentReceiveItemId, receiveQuantity, litersPerContainer, userId, now } = params;
    if (receiveQuantity <= 0) return "invalid_quantity";
    if (litersPerContainer <= 0) return "invalid_container_capacity";

    const parent = await this.selectOne<RowDataPacket>(
      `SELECT * FROM ${TABLES.LUBRICANT_RECEIVE_VOUCHER_ITEMS} WHERE receive_item_id = ?`,
      [parentReceiveItemId]
    );
    if (!parent || parent.parent_receive_item_id) return "not_parent_item";

    const receivedRows = await this.selectOne<RowDataPacket>(
      `SELECT COALESCE(SUM(quantity_liters), 0) AS total_received
       FROM ${TABLES.LUBRICANT_RECEIVE_VOUCHER_ITEMS}
       WHERE parent_receive_item_id = ?`,
      [parentReceiveItemId]
    );
    const totalReceived = Number(receivedRows?.total_received ?? 0);
    const orderedQuantity = Number(parent.ordered_quantity ?? 0);
    if (totalReceived + receiveQuantity > orderedQuantity) return "exceeds_ordered_quantity";

    await this.withTransaction(async (connection) => {
      const [insertChildResult] = await connection.execute<ResultSetHeader>(
        `INSERT INTO ${TABLES.LUBRICANT_RECEIVE_VOUCHER_ITEMS}
         (lubricant_receive_voucher_id, parent_receive_item_id, lubricant_id, quantity_liters, ordered_quantity,
          price_per_liter, amount, cgst_percent, cgst_amount, sgst_percent, sgst_amount, igst_percent, igst_amount,
          total_amount, liters_per_container, created_by, created_on)
         VALUES (?, ?, ?, ?, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, ?, ?, ?)`,
        [
          parent.lubricant_receive_voucher_id,
          parentReceiveItemId,
          parent.lubricant_id,
          receiveQuantity,
          litersPerContainer,
          userId,
          now,
        ]
      );
      const childReceiveItemId = insertChildResult.insertId;

      await this.generateContainers(
        connection,
        Number(parent.lubricant_receive_voucher_id),
        childReceiveItemId,
        Number(parent.lubricant_id),
        receiveQuantity,
        litersPerContainer,
        userId,
        now
      );

      await this.updateLubricantInventory(
        connection,
        Number(parent.lubricant_id),
        receiveQuantity,
        userId,
        now
      );
    });

    return "ok";
  }

  async deleteVoucherItem(receiveItemId: number, userId: number, now: string): Promise<void> {
    await this.withTransaction(async (connection) => {
      const item = await this.getItemById(connection, receiveItemId);
      if (!item) throw new Error("ITEM_NOT_FOUND");

      if (!item.parent_receive_item_id) {
        const [children] = await connection.execute<RowDataPacket[]>(
          `SELECT * FROM ${TABLES.LUBRICANT_RECEIVE_VOUCHER_ITEMS} WHERE parent_receive_item_id = ?`,
          [receiveItemId]
        );
        for (const child of children) {
          await this.deleteSingleItemWithInventory(connection, Number(child.receive_item_id), child, userId, now);
        }
      } else {
        await this.reverseItemInventory(connection, item, userId, now);
      }

      await this.deleteContainersAndTransactions(connection, receiveItemId);
      await connection.execute(
        `DELETE FROM ${TABLES.LUBRICANT_RECEIVE_VOUCHER_ITEMS} WHERE receive_item_id = ?`,
        [receiveItemId]
      );
    });
  }

  async deleteVoucher(voucherId: number, userId: number, now: string): Promise<void> {
    await this.withTransaction(async (connection) => {
      const [items] = await connection.execute<RowDataPacket[]>(
        `SELECT * FROM ${TABLES.LUBRICANT_RECEIVE_VOUCHER_ITEMS} WHERE lubricant_receive_voucher_id = ?`,
        [voucherId]
      );
      for (const item of items) {
        await this.reverseItemInventory(connection, item, userId, now);
      }

      await connection.execute(
        `DELETE FROM ${this.containerTransactionsTable} WHERE lubricant_receive_voucher_id = ?`,
        [voucherId]
      );
      await connection.execute(`DELETE FROM ${TABLES.LUBRICANT_CONTAINERS} WHERE voucher_id = ?`, [voucherId]);
      await connection.execute(
        `DELETE FROM ${TABLES.LUBRICANT_RECEIVE_VOUCHER_ITEMS} WHERE lubricant_receive_voucher_id = ?`,
        [voucherId]
      );
      await connection.execute(
        `DELETE FROM ${TABLES.LUBRICANT_RECEIVE_VOUCHER} WHERE lubricant_receive_voucher_id = ?`,
        [voucherId]
      );
    });
  }

  private async getItemById(connection: PoolConnection, receiveItemId: number): Promise<RowDataPacket | null> {
    const [rows] = await connection.execute<RowDataPacket[]>(
      `SELECT * FROM ${TABLES.LUBRICANT_RECEIVE_VOUCHER_ITEMS} WHERE receive_item_id = ?`,
      [receiveItemId]
    );
    return rows[0] ?? null;
  }

  private async deleteSingleItemWithInventory(
    connection: PoolConnection,
    receiveItemId: number,
    itemRow: RowDataPacket,
    userId: number,
    now: string
  ): Promise<void> {
    await this.reverseItemInventory(connection, itemRow, userId, now);
    await this.deleteContainersAndTransactions(connection, receiveItemId);
    await connection.execute(
      `DELETE FROM ${TABLES.LUBRICANT_RECEIVE_VOUCHER_ITEMS} WHERE receive_item_id = ?`,
      [receiveItemId]
    );
  }

  private async deleteContainersAndTransactions(connection: PoolConnection, receiveItemId: number): Promise<void> {
    await connection.execute(
      `DELETE FROM ${this.containerTransactionsTable} WHERE receive_item_id = ?`,
      [receiveItemId]
    );
    await connection.execute(`DELETE FROM ${TABLES.LUBRICANT_CONTAINERS} WHERE voucher_item_id = ?`, [
      receiveItemId,
    ]);
  }

  private async generateContainers(
    connection: PoolConnection,
    voucherId: number,
    receiveItemId: number,
    lubricantId: number,
    quantityLiters: number,
    litersPerContainer: number,
    userId: number,
    now: string
  ): Promise<void> {
    let remaining = quantityLiters;
    const containerCount = Math.ceil(quantityLiters / litersPerContainer);

    for (let index = 0; index < containerCount; index += 1) {
      const capacity = remaining >= litersPerContainer ? litersPerContainer : remaining;
      const [insertContainerResult] = await connection.execute<ResultSetHeader>(
        `INSERT INTO ${TABLES.LUBRICANT_CONTAINERS}
         (voucher_item_id, voucher_id, lubricant_id, barcode, container_capacity, available_liters, status, created_by, created_on)
         VALUES (?, ?, ?, ?, ?, ?, 'available', ?, ?)`,
        [receiveItemId, voucherId, lubricantId, `TEMP_${Date.now()}_${index}`, capacity, capacity, userId, now]
      );
      const containerId = insertContainerResult.insertId;
      const barcode = this.generateSequentialBarcode(containerId);
      const barcodeImagePath = await this.generateBarcodeImage(barcode);

      await connection.execute(
        `UPDATE ${TABLES.LUBRICANT_CONTAINERS}
         SET barcode = ?, barcode_image_path = ?
         WHERE lubricant_container_id = ?`,
        [barcode, barcodeImagePath, containerId]
      );
      await connection.execute(
        `INSERT INTO ${this.containerTransactionsTable}
         (lubricant_container_id, lubricant_receive_voucher_id, receive_item_id, lubricant_id, vehicle_id, job_card_id,
          quantity, balance, transaction_type, created_by, created_on)
         VALUES (?, ?, ?, ?, NULL, NULL, ?, ?, 'RECEIVED', ?, ?)`,
        [containerId, voucherId, receiveItemId, lubricantId, capacity, capacity, userId, now]
      );
      remaining -= capacity;
    }
  }

  private async updateLubricantInventory(
    connection: PoolConnection,
    lubricantId: number,
    quantityLiters: number,
    userId: number,
    now: string
  ): Promise<void> {
    const [rows] = await connection.execute<RowDataPacket[]>(
      `SELECT * FROM ${TABLES.LUBRICANT_INVENTORY} WHERE lubricant_id = ? LIMIT 1`,
      [lubricantId]
    );
    const existing = rows[0];

    if (!existing) {
      await connection.execute(
        `INSERT INTO ${TABLES.LUBRICANT_INVENTORY}
         (lubricant_id, total_received_liters, total_allocated_liters, available_liters, created_by, created_on)
         VALUES (?, ?, 0, ?, ?, ?)`,
        [lubricantId, quantityLiters, quantityLiters, userId, now]
      );
      return;
    }

    await connection.execute(
      `UPDATE ${TABLES.LUBRICANT_INVENTORY}
       SET total_received_liters = ?,
           available_liters = ?,
           updated_by = ?,
           updated_on = ?
       WHERE lubricant_inventory_id = ?`,
      [
        Math.max(0, Number(existing.total_received_liters ?? 0) + quantityLiters),
        Math.max(0, Number(existing.available_liters ?? 0) + quantityLiters),
        userId,
        now,
        existing.lubricant_inventory_id,
      ]
    );
  }

  private async reverseItemInventory(
    connection: PoolConnection,
    itemRow: RowDataPacket,
    userId: number,
    now: string
  ): Promise<void> {
    const qty = Number(itemRow.quantity_liters ?? 0);
    if (qty <= 0) return;

    const [rows] = await connection.execute<RowDataPacket[]>(
      `SELECT * FROM ${TABLES.LUBRICANT_INVENTORY} WHERE lubricant_id = ? LIMIT 1`,
      [itemRow.lubricant_id]
    );
    const existing = rows[0];
    if (!existing) return;

    await connection.execute(
      `UPDATE ${TABLES.LUBRICANT_INVENTORY}
       SET total_received_liters = ?,
           available_liters = ?,
           updated_by = ?,
           updated_on = ?
       WHERE lubricant_inventory_id = ?`,
      [
        Math.max(0, Number(existing.total_received_liters ?? 0) - qty),
        Math.max(0, Number(existing.available_liters ?? 0) - qty),
        userId,
        now,
        existing.lubricant_inventory_id,
      ]
    );
  }

  private generateSequentialBarcode(pk: number): string {
    const maxNumber = 9999;
    const number = ((pk - 1) % maxNumber) + 1;
    const numberStr = String(number).padStart(4, "0");
    const letterIndex = Math.floor((pk - 1) / maxNumber);
    return `${this.numberToLetters(letterIndex)}${numberStr}`;
  }

  private numberToLetters(num: number): string {
    let letters = "";
    let n = num;
    while (n >= 0) {
      const remainder = n % 26;
      letters = String.fromCharCode(65 + remainder) + letters;
      n = Math.floor(n / 26) - 1;
    }
    return letters;
  }

  private async generateBarcodeImage(barcode: string): Promise<string> {
    const bwipjs = await import("bwip-js");
    const pngBuffer = await bwipjs.toBuffer({
      bcid: "code128",
      text: barcode,
      scale: 3,
      height: 12,
      includetext: true,
      textxalign: "center",
      paddingwidth: 8,
      paddingheight: 8,
    });

    const barcodeDir = path.join(process.cwd(), "public", "barcodes");
    await fs.mkdir(barcodeDir, { recursive: true });
    const filename = `${barcode}.png`;
    const filepath = path.join(barcodeDir, filename);
    await fs.writeFile(filepath, pngBuffer);
    return `barcodes/${filename}`;
  }
}

export const inspectionRepository = new InspectionRepository();
export const lubricantRepository = new LubricantRepository();
