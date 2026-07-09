import { BaseRepository } from "@/lib/db/repositories/base.repository";
import { TABLES } from "@/lib/constants";
import type { CountRow } from "@/lib/db/types";
import type { PoliceStation, Officer, Driver } from "@/lib/types";
import type { RowDataPacket as RP } from "mysql2/promise";

interface AllotmentRow extends RP {
  officer_vehicle_mapping_id: number;
  vehicle_id: number;
  officer_id: number;
  registration_no: string;
  officer_name: string;
  ps_name: string;
  from_date: string;
  to_date: string | null;
  status: string;
}

export class PsRepository extends BaseRepository {
  async getAllPs(): Promise<PoliceStation[]> {
    return this.selectAll<PoliceStation>(
      `SELECT * FROM ${TABLES.POLICE_STATION} ORDER BY ps_name`
    );
  }

  async getPsById(id: number): Promise<PoliceStation | null> {
    return this.selectOne<PoliceStation>(
      `SELECT * FROM ${TABLES.POLICE_STATION} WHERE ps_id = ?`,
      [id]
    );
  }

  async createPs(data: {
    ps_name: string;
    ps_phone: string;
    address: string;
    status: string;
    created_by: number;
    created_on: string;
  }): Promise<number> {
    return this.insertRecord(
      `INSERT INTO ${TABLES.POLICE_STATION} (ps_name, address, ps_phone, status, created_by, created_on)
       VALUES (?, ?, ?, ?, ?, ?)`,
      this.buildParams([
        data.ps_name,
        data.address,
        data.ps_phone,
        data.status,
        data.created_by,
        data.created_on,
      ])
    );
  }

  async updatePs(id: number, data: Record<string, unknown>): Promise<void> {
    const fields = Object.keys(data).map((k) => `${k} = ?`).join(", ");
    await this.executeUpdate(
      `UPDATE ${TABLES.POLICE_STATION} SET ${fields} WHERE ps_id = ?`,
      this.buildParams([...Object.values(data), id])
    );
  }

  async deletePs(id: number): Promise<void> {
    await this.executeDelete(`DELETE FROM ${TABLES.POLICE_STATION} WHERE ps_id = ?`, [id]);
  }

  async countPs(): Promise<number> {
    const row = await this.selectOne<CountRow>(
      `SELECT COUNT(*) as count FROM ${TABLES.POLICE_STATION}`
    );
    return row?.count ?? 0;
  }

  // Officers
  async getAllOfficers(): Promise<Officer[]> {
    return this.selectAll<Officer>(
      `SELECT o.* FROM ${TABLES.OFFICERS} o ORDER BY o.officer_id DESC`
    );
  }

  async employeeIdExists(employeeId: string, excludeId?: number): Promise<boolean> {
    const sql = excludeId
      ? `SELECT officer_id FROM ${TABLES.OFFICERS}
         WHERE LOWER(TRIM(officer_rank)) = LOWER(TRIM(?)) AND officer_id != ?`
      : `SELECT officer_id FROM ${TABLES.OFFICERS}
         WHERE LOWER(TRIM(officer_rank)) = LOWER(TRIM(?))`;
    const params = excludeId ? [employeeId, excludeId] : [employeeId];
    return (await this.selectOne<Officer>(sql, params)) !== null;
  }

  async createOfficer(data: {
    officer_name: string;
    officer_mobile: string;
    officer_rank: string;
    status: string;
    created_by: number;
    created_on: string;
  }): Promise<number> {
    return this.insertRecord(
      `INSERT INTO ${TABLES.OFFICERS}
       (officer_name, officer_mobile, officer_rank, status, created_by, created_on)
       VALUES (?, ?, ?, ?, ?, ?)`,
      this.buildParams([
        data.officer_name,
        data.officer_mobile,
        data.officer_rank,
        data.status,
        data.created_by,
        data.created_on,
      ])
    );
  }

  async updateOfficer(id: number, data: Record<string, unknown>): Promise<void> {
    const fields = Object.keys(data).map((k) => `${k} = ?`).join(", ");
    await this.executeUpdate(
      `UPDATE ${TABLES.OFFICERS} SET ${fields} WHERE officer_id = ?`,
      this.buildParams([...Object.values(data), id])
    );
  }

  async deleteOfficer(id: number): Promise<void> {
    await this.executeDelete(`DELETE FROM ${TABLES.OFFICERS} WHERE officer_id = ?`, [id]);
  }

  // Drivers
  async getAllDrivers(psId?: number): Promise<Driver[]> {
    const sql = psId
      ? `SELECT d.*, ps.ps_name FROM ${TABLES.DRIVERS} d
         LEFT JOIN ${TABLES.POLICE_STATION} ps ON ps.ps_id = d.ps_id
         WHERE d.ps_id = ? ORDER BY d.driver_id DESC`
      : `SELECT d.*, ps.ps_name FROM ${TABLES.DRIVERS} d
         LEFT JOIN ${TABLES.POLICE_STATION} ps ON ps.ps_id = d.ps_id
         ORDER BY d.driver_id DESC`;
    return this.selectAll<Driver>(sql, psId ? [psId] : []);
  }

  async createDriver(data: Record<string, unknown>): Promise<number> {
    return this.insertRecord(
      `INSERT INTO ${TABLES.DRIVERS}
       (ps_id, driver_name, general_number, status, created_by, created_on)
       VALUES (?, ?, ?, ?, ?, ?)`,
      this.buildParams([
        data.ps_id,
        data.driver_name,
        data.general_number,
        data.status ?? "Active",
        data.created_by,
        data.created_on,
      ])
    );
  }

  async updateDriver(id: number, data: Record<string, unknown>): Promise<void> {
    const fields = Object.keys(data).map((k) => `${k} = ?`).join(", ");
    await this.executeUpdate(
      `UPDATE ${TABLES.DRIVERS} SET ${fields} WHERE driver_id = ?`,
      this.buildParams([...Object.values(data), id])
    );
  }

  async deleteDriver(id: number): Promise<void> {
    await this.executeDelete(`DELETE FROM ${TABLES.DRIVERS} WHERE driver_id = ?`, [id]);
  }

  // Allotments
  async getActiveAllotments(): Promise<AllotmentRow[]> {
    return this.selectAll<AllotmentRow>(
      `SELECT ovm.*, v.registration_no, o.officer_name, ps.ps_name
       FROM ${TABLES.OFFICER_VEHICLE_MAPPING} ovm
       JOIN ${TABLES.VEHICLES} v ON v.vehicle_id = ovm.vehicle_id
       JOIN ${TABLES.OFFICERS} o ON o.officer_id = ovm.officer_id
       JOIN ${TABLES.POLICE_STATION} ps ON ps.ps_id = o.ps_id
       WHERE ovm.status = 'Active'
       ORDER BY ovm.officer_vehicle_mapping_id DESC`
    );
  }

  async createOfficerVehicleAllotment(data: Record<string, unknown>): Promise<number> {
    return this.insertRecord(
      `INSERT INTO ${TABLES.OFFICER_VEHICLE_MAPPING}
       (vehicle_id, officer_id, from_date, to_date, status, created_by, created_on)
       VALUES (?, ?, ?, ?, 'Active', ?, ?)`,
      this.buildParams([
        data.vehicle_id,
        data.officer_id,
        data.from_date,
        data.to_date ?? null,
        data.created_by,
        data.created_on,
      ])
    );
  }

  async createDriverVehicleAllotment(data: Record<string, unknown>): Promise<number> {
    return this.insertRecord(
      `INSERT INTO ${TABLES.DRIVER_VEHICLE_MAPPING}
       (vehicle_id, driver_id, officer_id, from_date, to_date, status, created_by, created_on)
       VALUES (?, ?, ?, ?, ?, 'Active', ?, ?)`,
      this.buildParams([
        data.vehicle_id,
        data.driver_id,
        data.officer_id,
        data.from_date,
        data.to_date ?? null,
        data.created_by,
        data.created_on,
      ])
    );
  }
}

export const psRepository = new PsRepository();
