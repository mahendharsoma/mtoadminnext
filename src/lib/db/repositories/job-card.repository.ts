import { BaseRepository } from "@/lib/db/repositories/base.repository";
import { TABLES } from "@/lib/constants";
import type { CountRow } from "@/lib/db/types";
import type {
  JobCard,
  JobCardAssignedItem,
  JobCardOil,
  JobCardSparePart,
  Inspection,
  Mechanic,
} from "@/lib/types";
import type { RowDataPacket } from "mysql2/promise";

const JOB_CARD_SELECT = `
  SELECT jc.*,
    jc.status AS job_card_status,
    jc.date_in AS date_time_in,
    jc.closing_date AS date_time_out,
    v.registration_no,
    v.make_type_id AS vehicle_make_type_id,
    v.variant_id AS vehicle_variant_id,
    o.officer_name,
    o.officer_rank,
    o.officer_mobile,
    driver.officer_name AS driver_name,
    driver.officer_rank AS driver_rank,
    mt.make_type AS make_type,
    vv.variant_name,
    GROUP_CONCAT(DISTINCT m.mechanic_name ORDER BY m.mechanic_name SEPARATOR ', ') AS mechanic_names,
    GROUP_CONCAT(DISTINCT m.mechanic_id ORDER BY m.mechanic_id SEPARATOR ', ') AS mechanic_ids
  FROM ${TABLES.JOB_CARD} jc
  LEFT JOIN ${TABLES.VEHICLES} v ON v.vehicle_id = jc.vehicle_id
  LEFT JOIN ${TABLES.VEHICLE_MAKE_TYPE} mt ON mt.make_type_id = v.make_type_id
  LEFT JOIN ${TABLES.VEHICLE_VARIANT} vv ON vv.variant_id = v.variant_id
  LEFT JOIN ${TABLES.OFFICERS} o ON o.officer_id = jc.officer_id
  LEFT JOIN ${TABLES.OFFICERS} driver ON driver.officer_id = jc.driver_id
  LEFT JOIN ${TABLES.JOB_CARD_MECHANIC_MAPPING} jcm ON jcm.job_card_id = jc.job_card_id
  LEFT JOIN ${TABLES.MECHANICS} m ON m.mechanic_id = jcm.mechanic_id
`;

const JOB_CARD_GROUP = " GROUP BY jc.job_card_id";

const JOB_CARD_COLUMN_MAP: Record<string, string> = {
  job_card_status: "status",
  date_time_in: "date_in",
  date_time_out: "closing_date",
  job_type: "job_type_id",
  service_type: "service_type_id",
};

export type JobCardItemInput = {
  item_id: number;
  quantity: number;
  is_common: number;
};

export class JobCardRepository extends BaseRepository {
  async getAllJobCards(): Promise<JobCard[]> {
    return super.selectAll<JobCard>(
      `${JOB_CARD_SELECT}${JOB_CARD_GROUP} ORDER BY jc.job_card_id DESC`
    );
  }

  async getByStatus(status: string): Promise<JobCard[]> {
    return super.selectAll<JobCard>(
      `${JOB_CARD_SELECT} WHERE jc.status = ?${JOB_CARD_GROUP} ORDER BY jc.job_card_id DESC`,
      [status]
    );
  }

  async getById(id: number): Promise<JobCard | null> {
    return this.selectOne<JobCard>(
      `${JOB_CARD_SELECT} WHERE jc.job_card_id = ?${JOB_CARD_GROUP}`,
      [id]
    );
  }

  async countByStatus(status: string): Promise<number> {
    const row = await this.selectOne<CountRow>(
      `SELECT COUNT(*) as count FROM ${TABLES.JOB_CARD} WHERE status = ?`,
      [status]
    );
    return row?.count ?? 0;
  }

  async updateJobCard(id: number, data: Record<string, unknown>): Promise<void> {
    const mapped: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      mapped[JOB_CARD_COLUMN_MAP[key] ?? key] = value;
    }

    const fields = Object.keys(mapped).map((k) => `${k} = ?`).join(", ");
    await this.executeUpdate(
      `UPDATE ${TABLES.JOB_CARD} SET ${fields} WHERE job_card_id = ?`,
      this.buildParams([...Object.values(mapped), id])
    );
  }

  async getActiveMechanics(): Promise<Mechanic[]> {
    return this.selectAll<Mechanic>(
      `SELECT * FROM ${TABLES.MECHANICS} WHERE status = 'Active' ORDER BY mechanic_name`
    );
  }

  async getSparePartsForJobCard(jobCardId: number): Promise<JobCardSparePart[]> {
    return this.selectAll<JobCardSparePart>(
      `SELECT
              MAX(inv.make_type_id) AS make_type_id,
              MAX(inv.variant_id) AS variant_id,
              inv.item_name_id,
              SUM(inv.available_quantity) AS available_quantity,
              inv.is_common,
              iname.item_name
       FROM ${TABLES.JOB_CARD} jc
       LEFT JOIN ${TABLES.INVENTORY} inv ON (
         (inv.is_common = 0 AND inv.make_type_id = jc.make_type_id AND inv.variant_id = jc.variant_id)
         OR (inv.is_common = 1 AND inv.make_type_id = 0 AND inv.variant_id = 0)
       )
       LEFT JOIN ${TABLES.ITEM_NAME} iname ON iname.item_name_id = inv.item_name_id
       WHERE jc.job_card_id = ? AND inv.item_name_id IS NOT NULL
       GROUP BY inv.item_name_id, inv.is_common, iname.item_name
       ORDER BY iname.item_name`,
      [jobCardId]
    );
  }

  async getAssignedItems(jobCardId: number): Promise<JobCardAssignedItem[]> {
    return this.selectAll<JobCardAssignedItem>(
      `SELECT jci.*, iname.item_name
       FROM ${TABLES.JOB_CARD_ITEMS} jci
       LEFT JOIN ${TABLES.ITEM_NAME} iname ON iname.item_name_id = jci.item_name_id
       WHERE jci.job_card_id = ?
       ORDER BY jci.job_card_item_id`,
      [jobCardId]
    );
  }

  async getJobCardItems(jobCardId: number): Promise<RowDataPacket[]> {
    return this.selectAll(
      `SELECT jci.*, iname.item_name
       FROM ${TABLES.JOB_CARD_ITEMS} jci
       LEFT JOIN ${TABLES.ITEM_NAME} iname ON iname.item_name_id = jci.item_name_id
       WHERE jci.job_card_id = ?`,
      [jobCardId]
    );
  }

  async getJobCardMechanics(jobCardId: number): Promise<RowDataPacket[]> {
    return this.selectAll(
      `SELECT jcm.*, m.mechanic_name
       FROM ${TABLES.JOB_CARD_MECHANIC_MAPPING} jcm
       JOIN ${TABLES.MECHANICS} m ON m.mechanic_id = jcm.mechanic_id
       WHERE jcm.job_card_id = ?`,
      [jobCardId]
    );
  }

  async getInspectionByJobCardId(jobCardId: number): Promise<Inspection | null> {
    return this.selectOne<Inspection>(
      `SELECT * FROM ${TABLES.INSPECTIONS} WHERE job_card_id = ? LIMIT 1`,
      [jobCardId]
    );
  }

  async getJobCardOils(jobCardId: number): Promise<JobCardOil[]> {
    return this.selectAll<JobCardOil>(
      `SELECT jco.*,
              l.lubricant_name,
              lt.lubricant_type_name,
              lg.lubricant_grade,
              li.available_liters
       FROM ${TABLES.JOB_CARD_OILS} jco
       LEFT JOIN ${TABLES.LUBRICANTS} l ON l.lubricant_id = jco.lubricant_id
       LEFT JOIN ${TABLES.LUBRICANT_TYPE} lt ON lt.lubricant_type_id = l.lubricant_type_id
       LEFT JOIN ${TABLES.LUBRICANT_GRADES} lg ON lg.lubricant_grade_id = l.lubricant_grade_id
       LEFT JOIN ${TABLES.LUBRICANT_INVENTORY} li ON li.lubricant_id = jco.lubricant_id
       WHERE jco.job_card_id = ?
       ORDER BY jco.job_card_oil_id ASC`,
      [jobCardId]
    );
  }

  async deleteJobCardMechanics(jobCardId: number): Promise<void> {
    await this.executeDelete(
      `DELETE FROM ${TABLES.JOB_CARD_MECHANIC_MAPPING} WHERE job_card_id = ?`,
      [jobCardId]
    );
  }

  async insertJobCardMechanicMap(data: Record<string, unknown>): Promise<void> {
    await this.insertRecord(
      `INSERT INTO ${TABLES.JOB_CARD_MECHANIC_MAPPING}
       (job_card_id, mechanic_id, created_by, created_on)
       VALUES (?, ?, ?, ?)`,
      this.buildParams([data.job_card_id, data.mechanic_id, data.created_by, data.created_on])
    );
  }

  async deleteJobCardItems(jobCardId: number): Promise<void> {
    await this.executeDelete(
      `DELETE FROM ${TABLES.JOB_CARD_ITEMS} WHERE job_card_id = ?`,
      [jobCardId]
    );
  }

  async insertJobCardItem(data: Record<string, unknown>): Promise<void> {
    await this.insertRecord(
      `INSERT INTO ${TABLES.JOB_CARD_ITEMS}
       (job_card_id, item_name_id, item_quantity, is_common, created_by, created_on)
       VALUES (?, ?, ?, ?, ?, ?)`,
      this.buildParams([
        data.job_card_id,
        data.item_name_id,
        data.item_quantity,
        data.is_common ?? 0,
        data.created_by,
        data.created_on,
      ])
    );
  }

  async replaceJobCardItems(
    jobCardId: number,
    items: JobCardItemInput[],
    userId: number,
    now: string
  ): Promise<void> {
    await this.withTransaction(async (connection) => {
      await connection.execute(
        `DELETE FROM ${TABLES.JOB_CARD_ITEMS} WHERE job_card_id = ?`,
        [jobCardId]
      );
      for (const item of items) {
        await connection.execute(
          `INSERT INTO ${TABLES.JOB_CARD_ITEMS}
           (job_card_id, item_name_id, item_quantity, is_common, created_by, created_on)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [jobCardId, item.item_id, item.quantity, item.is_common, userId, now]
        );
      }
    });
  }

  async addJobCardOil(
    jobCardId: number,
    lubricantId: number,
    requiredQuantity: number,
    userId: number,
    now: string
  ): Promise<"duplicate" | true> {
    const existing = await this.selectOne<RowDataPacket>(
      `SELECT job_card_oil_id FROM ${TABLES.JOB_CARD_OILS}
       WHERE job_card_id = ? AND lubricant_id = ?`,
      [jobCardId, lubricantId]
    );
    if (existing) return "duplicate";

    await this.insertRecord(
      `INSERT INTO ${TABLES.JOB_CARD_OILS}
       (job_card_id, lubricant_id, required_quantity, status, created_by, created_on)
       VALUES (?, ?, ?, 'Pending', ?, ?)`,
      [jobCardId, lubricantId, requiredQuantity, userId, now]
    );
    return true;
  }

  async approveJobCardOil(
    jobCardOilId: number,
    userId: number,
    now: string
  ): Promise<"insufficient_inventory" | true> {
    return this.withTransaction(async (connection) => {
      const [oilRows] = await connection.execute<RowDataPacket[]>(
        `SELECT * FROM ${TABLES.JOB_CARD_OILS} WHERE job_card_oil_id = ?`,
        [jobCardOilId]
      );
      const oil = oilRows[0];
      if (!oil || String(oil.status).toLowerCase() === "approved") return true;

      const [invRows] = await connection.execute<RowDataPacket[]>(
        `SELECT * FROM ${TABLES.LUBRICANT_INVENTORY} WHERE lubricant_id = ? LIMIT 1`,
        [oil.lubricant_id]
      );
      const inventory = invRows[0];
      const available = Number(inventory?.available_liters ?? 0);
      const required = Number(oil.required_quantity);
      if (available < required) return "insufficient_inventory";

      await connection.execute(
        `UPDATE ${TABLES.JOB_CARD_OILS}
         SET status = 'Approved', updated_by = ?, updated_on = ?
         WHERE job_card_oil_id = ?`,
        [userId, now, jobCardOilId]
      );

      if (inventory) {
        const newAllocated = Number(inventory.total_allocated_liters ?? 0) + required;
        const newAvailable = Number(inventory.available_liters ?? 0) - required;
        await connection.execute(
          `UPDATE ${TABLES.LUBRICANT_INVENTORY}
           SET total_allocated_liters = ?, available_liters = ?, updated_by = ?, updated_on = ?
           WHERE lubricant_inventory_id = ?`,
          [newAllocated, newAvailable, userId, now, inventory.lubricant_inventory_id]
        );
      }

      return true;
    });
  }

  async updateJobCardOilQuantity(
    jobCardOilId: number,
    newQuantity: number,
    userId: number,
    now: string
  ): Promise<"invalid_quantity" | "insufficient_inventory" | true> {
    if (newQuantity <= 0) return "invalid_quantity";

    return this.withTransaction(async (connection) => {
      const [oilRows] = await connection.execute<RowDataPacket[]>(
        `SELECT * FROM ${TABLES.JOB_CARD_OILS} WHERE job_card_oil_id = ?`,
        [jobCardOilId]
      );
      const oil = oilRows[0];
      if (!oil) return true;

      const oldQuantity = Number(oil.required_quantity);
      const isApproved = String(oil.status).toLowerCase() === "approved";
      const delta = newQuantity - oldQuantity;

      if (isApproved && delta > 0) {
        const [invRows] = await connection.execute<RowDataPacket[]>(
          `SELECT * FROM ${TABLES.LUBRICANT_INVENTORY} WHERE lubricant_id = ? LIMIT 1`,
          [oil.lubricant_id]
        );
        const inventory = invRows[0];
        const available = Number(inventory?.available_liters ?? 0);
        if (available < delta) return "insufficient_inventory";
      }

      await connection.execute(
        `UPDATE ${TABLES.JOB_CARD_OILS}
         SET required_quantity = ?, updated_by = ?, updated_on = ?
         WHERE job_card_oil_id = ?`,
        [newQuantity, userId, now, jobCardOilId]
      );

      if (isApproved && delta !== 0) {
        const [invRows] = await connection.execute<RowDataPacket[]>(
          `SELECT * FROM ${TABLES.LUBRICANT_INVENTORY} WHERE lubricant_id = ? LIMIT 1`,
          [oil.lubricant_id]
        );
        const inventory = invRows[0];
        if (inventory) {
          const newAllocated = Number(inventory.total_allocated_liters ?? 0) + delta;
          const newAvailable = Number(inventory.available_liters ?? 0) - delta;
          await connection.execute(
            `UPDATE ${TABLES.LUBRICANT_INVENTORY}
             SET total_allocated_liters = ?, available_liters = ?, updated_by = ?, updated_on = ?
             WHERE lubricant_inventory_id = ?`,
            [newAllocated, newAvailable, userId, now, inventory.lubricant_inventory_id]
          );
        }
      }

      return true;
    });
  }

  async deleteJobCardOil(jobCardOilId: number, userId: number, now: string): Promise<void> {
    await this.withTransaction(async (connection) => {
      const [oilRows] = await connection.execute<RowDataPacket[]>(
        `SELECT * FROM ${TABLES.JOB_CARD_OILS} WHERE job_card_oil_id = ?`,
        [jobCardOilId]
      );
      const oil = oilRows[0];
      if (!oil) return;

      if (String(oil.status).toLowerCase() === "approved") {
        const [invRows] = await connection.execute<RowDataPacket[]>(
          `SELECT * FROM ${TABLES.LUBRICANT_INVENTORY} WHERE lubricant_id = ? LIMIT 1`,
          [oil.lubricant_id]
        );
        const inventory = invRows[0];
        if (inventory) {
          const qty = Number(oil.required_quantity);
          const newAllocated = Math.max(0, Number(inventory.total_allocated_liters ?? 0) - qty);
          const newAvailable = Number(inventory.available_liters ?? 0) + qty;
          await connection.execute(
            `UPDATE ${TABLES.LUBRICANT_INVENTORY}
             SET total_allocated_liters = ?, available_liters = ?, updated_by = ?, updated_on = ?
             WHERE lubricant_inventory_id = ?`,
            [newAllocated, newAvailable, userId, now, inventory.lubricant_inventory_id]
          );
        }
      }

      await connection.execute(
        `DELETE FROM ${TABLES.JOB_CARD_OILS} WHERE job_card_oil_id = ?`,
        [jobCardOilId]
      );
    });
  }
}

export const jobCardRepository = new JobCardRepository();
