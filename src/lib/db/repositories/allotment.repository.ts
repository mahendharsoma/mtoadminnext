import { BaseRepository } from "@/lib/db/repositories/base.repository";
import { TABLES } from "@/lib/constants";
import type { Officer } from "@/lib/types";
import type { RowDataPacket } from "mysql2/promise";

export interface OfficerVehicleMapping extends RowDataPacket {
  officer_vehicle_mapping_id: number;
  officer_id: number;
  vehicle_id: number;
  from_date: string;
  to_date: string | null;
  status: string;
  officer_name?: string;
  officer_mobile?: string;
  officer_rank?: string;
  registration_no?: string;
}

export interface DriverVehicleMapping extends RowDataPacket {
  driver_vehicle_mapping_id: number;
  vehicle_id: number;
  driver_id: number;
  from_date: string;
  to_date: string | null;
  status: string;
  driver_name?: string;
  officer_mobile?: string;
}

export class AllotmentRepository extends BaseRepository {
  async getActiveOfficers(): Promise<Officer[]> {
    return this.selectAll<Officer>(
      `SELECT * FROM ${TABLES.OFFICERS} WHERE status = 'Active' ORDER BY officer_name`
    );
  }

  async getVehicleAllocatedOfficer(vehicleId: number): Promise<OfficerVehicleMapping | null> {
    return this.selectOne<OfficerVehicleMapping>(
      `SELECT ovm.*, o.officer_name, o.officer_mobile, o.officer_rank, v.registration_no
       FROM ${TABLES.OFFICER_VEHICLE_MAPPING} ovm
       JOIN ${TABLES.OFFICERS} o ON o.officer_id = ovm.officer_id
       JOIN ${TABLES.VEHICLES} v ON v.vehicle_id = ovm.vehicle_id
       WHERE ovm.vehicle_id = ?
         AND ovm.status = 'Active'
         AND (ovm.to_date IS NULL OR ovm.to_date = '' OR ovm.to_date >= CURDATE())
       ORDER BY ovm.officer_vehicle_mapping_id DESC
       LIMIT 1`,
      [vehicleId]
    );
  }

  async getOfficerVehicleMappingById(id: number): Promise<OfficerVehicleMapping | null> {
    return this.selectOne<OfficerVehicleMapping>(
      `SELECT * FROM ${TABLES.OFFICER_VEHICLE_MAPPING} WHERE officer_vehicle_mapping_id = ?`,
      [id]
    );
  }

  async insertVehicleAllotment(data: {
    officer_id: number;
    vehicle_id: number;
    from_date: string;
    created_by: number;
    created_on: string;
  }): Promise<number> {
    return this.insertRecord(
      `INSERT INTO ${TABLES.OFFICER_VEHICLE_MAPPING}
       (officer_id, vehicle_id, from_date, to_date, status, created_by, created_on)
       VALUES (?, ?, ?, NULL, 'Active', ?, ?)`,
      this.buildParams([
        data.officer_id,
        data.vehicle_id,
        data.from_date,
        data.created_by,
        data.created_on,
      ])
    );
  }

  async updateOfficerVehicleMapping(id: number, data: Record<string, unknown>): Promise<void> {
    const fields = Object.keys(data).map((k) => `${k} = ?`).join(", ");
    await this.executeUpdate(
      `UPDATE ${TABLES.OFFICER_VEHICLE_MAPPING} SET ${fields} WHERE officer_vehicle_mapping_id = ?`,
      this.buildParams([...Object.values(data), id])
    );
  }

  async getVehicleAllotedDrivers(vehicleId: number): Promise<DriverVehicleMapping[]> {
    return this.selectAll<DriverVehicleMapping>(
      `SELECT dvm.*, o.officer_name AS driver_name, o.officer_mobile
       FROM ${TABLES.DRIVER_VEHICLE_MAPPING} dvm
       JOIN ${TABLES.OFFICERS} o ON o.officer_id = dvm.driver_id
       WHERE dvm.vehicle_id = ?
         AND dvm.status = 'Active'
         AND (dvm.to_date IS NULL OR dvm.to_date = '' OR dvm.to_date >= CURDATE())
       ORDER BY dvm.driver_vehicle_mapping_id DESC`,
      [vehicleId]
    );
  }

  async getDriverVehicleMappingById(id: number): Promise<DriverVehicleMapping | null> {
    return this.selectOne<DriverVehicleMapping>(
      `SELECT * FROM ${TABLES.DRIVER_VEHICLE_MAPPING} WHERE driver_vehicle_mapping_id = ?`,
      [id]
    );
  }

  async driverCheckVehicleAllotment(driverId: number): Promise<DriverVehicleMapping | null> {
    return this.selectOne<DriverVehicleMapping>(
      `SELECT * FROM ${TABLES.DRIVER_VEHICLE_MAPPING}
       WHERE driver_id = ?
         AND status = 'Active'
         AND (to_date IS NULL OR to_date = '' OR to_date >= CURDATE())
       ORDER BY driver_vehicle_mapping_id DESC
       LIMIT 1`,
      [driverId]
    );
  }

  async officerDetailsByVehicleId(vehicleId: number): Promise<RowDataPacket | null> {
    return this.selectOne(
      `SELECT o.officer_name, v.registration_no
       FROM ${TABLES.OFFICER_VEHICLE_MAPPING} ovm
       JOIN ${TABLES.OFFICERS} o ON o.officer_id = ovm.officer_id
       JOIN ${TABLES.VEHICLES} v ON v.vehicle_id = ovm.vehicle_id
       WHERE ovm.vehicle_id = ?
         AND ovm.status = 'Active'
         AND (ovm.to_date IS NULL OR ovm.to_date = '' OR ovm.to_date >= CURDATE())
       ORDER BY ovm.officer_vehicle_mapping_id DESC
       LIMIT 1`,
      [vehicleId]
    );
  }

  async insertDriverAllotment(data: {
    driver_id: number;
    vehicle_id: number;
    from_date: string;
    created_by: number;
    created_on: string;
  }): Promise<number> {
    return this.insertRecord(
      `INSERT INTO ${TABLES.DRIVER_VEHICLE_MAPPING}
       (vehicle_id, driver_id, from_date, to_date, status, created_by, created_on)
       VALUES (?, ?, ?, NULL, 'Active', ?, ?)`,
      this.buildParams([
        data.vehicle_id,
        data.driver_id,
        data.from_date,
        data.created_by,
        data.created_on,
      ])
    );
  }

  async updateDriverVehicleMapping(id: number, data: Record<string, unknown>): Promise<void> {
    const fields = Object.keys(data).map((k) => `${k} = ?`).join(", ");
    await this.executeUpdate(
      `UPDATE ${TABLES.DRIVER_VEHICLE_MAPPING} SET ${fields} WHERE driver_vehicle_mapping_id = ?`,
      this.buildParams([...Object.values(data), id])
    );
  }

  async deleteDriverVehicleMapping(id: number): Promise<void> {
    await this.executeDelete(
      `DELETE FROM ${TABLES.DRIVER_VEHICLE_MAPPING} WHERE driver_vehicle_mapping_id = ?`,
      [id]
    );
  }
}

export const allotmentRepository = new AllotmentRepository();
