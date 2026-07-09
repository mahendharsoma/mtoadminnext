import { BaseRepository } from "@/lib/db/repositories/base.repository";
import { TABLES } from "@/lib/constants";
import type { Mechanic } from "@/lib/types";

export class MechanicsRepository extends BaseRepository {
  async findAll(): Promise<Mechanic[]> {
    return this.selectAll<Mechanic>(
      `SELECT * FROM ${TABLES.MECHANICS} ORDER BY mechanic_id DESC`
    );
  }

  async findById(id: number): Promise<Mechanic | null> {
    return this.selectOne<Mechanic>(
      `SELECT * FROM ${TABLES.MECHANICS} WHERE mechanic_id = ?`,
      [id]
    );
  }

  async generalNumberExists(
    number: string,
    excludeId?: number
  ): Promise<boolean> {
    const sql = excludeId
      ? `SELECT mechanic_id FROM ${TABLES.MECHANICS} WHERE general_number = ? AND mechanic_id != ?`
      : `SELECT mechanic_id FROM ${TABLES.MECHANICS} WHERE general_number = ?`;
    const params = excludeId ? [number, excludeId] : [number];
    return (await this.selectOne<Mechanic>(sql, params)) !== null;
  }

  async insert(data: {
    mechanic_name: string;
    general_number: string;
    mechanic_phone: string;
    status: string;
    created_by: number;
    created_on: string;
  }): Promise<number> {
    return super.insertRecord(
      `INSERT INTO ${TABLES.MECHANICS} (mechanic_name, general_number, mechanic_phone, status, created_by, created_on)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        data.mechanic_name,
        data.general_number,
        data.mechanic_phone,
        data.status,
        data.created_by,
        data.created_on,
      ]
    );
  }

  async update(
    id: number,
    data: Record<string, unknown>
  ): Promise<void> {
    const fields = Object.keys(data)
      .map((k) => `${k} = ?`)
      .join(", ");
    await super.executeUpdate(
      `UPDATE ${TABLES.MECHANICS} SET ${fields} WHERE mechanic_id = ?`,
      this.buildParams([...Object.values(data), id])
    );
  }

  async delete(id: number): Promise<void> {
    await this.executeDelete(
      `DELETE FROM ${TABLES.MECHANICS} WHERE mechanic_id = ?`,
      [id]
    );
  }
}

export const mechanicsRepository = new MechanicsRepository();
