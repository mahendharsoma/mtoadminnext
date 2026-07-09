import { BaseRepository } from "@/lib/db/repositories/base.repository";
import { TABLES } from "@/lib/constants";
import type { CountRow } from "@/lib/db/types";
import type { VehicleMakeType, VehicleVariant, Vehicle, VehicleFuelEntry } from "@/lib/types";

export class VehicleRepository extends BaseRepository {
  // Make Types
  async getAllMakeTypes(): Promise<VehicleMakeType[]> {
    return this.selectAll<VehicleMakeType>(
      `SELECT make_type_id, make_type AS make_type_name, status, created_by, created_on, updated_by, updated_on
       FROM ${TABLES.VEHICLE_MAKE_TYPE} ORDER BY make_type`
    );
  }

  async getMakeTypeById(id: number): Promise<VehicleMakeType | null> {
    return this.selectOne<VehicleMakeType>(
      `SELECT make_type_id, make_type AS make_type_name, status, created_by, created_on, updated_by, updated_on
       FROM ${TABLES.VEHICLE_MAKE_TYPE} WHERE make_type_id = ?`,
      [id]
    );
  }

  async createMakeType(data: {
    make_type_name: string;
    status: string;
    created_by: number;
    created_on: string;
  }): Promise<number> {
    return this.insertRecord(
      `INSERT INTO ${TABLES.VEHICLE_MAKE_TYPE} (make_type, status, created_by, created_on)
       VALUES (?, ?, ?, ?)`,
      [data.make_type_name, data.status, data.created_by, data.created_on]
    );
  }

  async updateMakeType(id: number, data: Record<string, unknown>): Promise<void> {
    const mapped = { ...data };
    if ("make_type_name" in mapped) {
      mapped.make_type = mapped.make_type_name;
      delete mapped.make_type_name;
    }
    const fields = Object.keys(mapped).map((k) => `${k} = ?`).join(", ");
    await this.executeUpdate(
      `UPDATE ${TABLES.VEHICLE_MAKE_TYPE} SET ${fields} WHERE make_type_id = ?`,
      this.buildParams([...Object.values(mapped), id])
    );
  }

  async deleteMakeType(id: number): Promise<void> {
    await this.executeDelete(
      `DELETE FROM ${TABLES.VEHICLE_MAKE_TYPE} WHERE make_type_id = ?`,
      [id]
    );
  }

  // Variants
  async getAllVariants(): Promise<VehicleVariant[]> {
    return this.selectAll<VehicleVariant>(
      `SELECT v.*, m.make_type AS make_type_name FROM ${TABLES.VEHICLE_VARIANT} v
       LEFT JOIN ${TABLES.VEHICLE_MAKE_TYPE} m ON m.make_type_id = v.make_type_id
       ORDER BY v.variant_id DESC`
    );
  }

  async getVariantsByMakeType(makeTypeId: number): Promise<VehicleVariant[]> {
    return this.selectAll<VehicleVariant>(
      `SELECT * FROM ${TABLES.VEHICLE_VARIANT} WHERE make_type_id = ? AND status = 'Active' ORDER BY variant_name`,
      [makeTypeId]
    );
  }

  async createVariant(data: {
    make_type_id: number;
    variant_name: string;
    status: string;
    created_by: number;
    created_on: string;
  }): Promise<number> {
    return this.insertRecord(
      `INSERT INTO ${TABLES.VEHICLE_VARIANT} (make_type_id, variant_name, status, created_by, created_on)
       VALUES (?, ?, ?, ?, ?)`,
      [data.make_type_id, data.variant_name, data.status, data.created_by, data.created_on]
    );
  }

  async updateVariant(id: number, data: Record<string, unknown>): Promise<void> {
    const fields = Object.keys(data).map((k) => `${k} = ?`).join(", ");
    await this.executeUpdate(
      `UPDATE ${TABLES.VEHICLE_VARIANT} SET ${fields} WHERE variant_id = ?`,
      this.buildParams([...Object.values(data), id])
    );
  }

  async deleteVariant(id: number): Promise<void> {
    await this.executeDelete(
      `DELETE FROM ${TABLES.VEHICLE_VARIANT} WHERE variant_id = ?`,
      [id]
    );
  }

  // Vehicles
  async getVehiclesByPsId(psId: number): Promise<Vehicle[]> {
    return this.selectAll<Vehicle>(
      `SELECT v.*, m.make_type AS make_type_name, vv.variant_name, ps.ps_name
       FROM ${TABLES.VEHICLES} v
       LEFT JOIN ${TABLES.VEHICLE_MAKE_TYPE} m ON m.make_type_id = v.make_type_id
       LEFT JOIN ${TABLES.VEHICLE_VARIANT} vv ON vv.variant_id = v.variant_id
       LEFT JOIN ${TABLES.POLICE_STATION} ps ON ps.ps_id = v.ps_id
       WHERE v.ps_id = ? AND v.status = 'Active'
       ORDER BY v.registration_no`,
      [psId]
    );
  }

  async getAllVehicles(): Promise<Vehicle[]> {
    return this.selectAll<Vehicle>(
      `SELECT v.*,
              m.make_type AS make_type_name,
              vv.variant_name,
              ps.ps_name,
              o.officer_name,
              o.officer_mobile
       FROM ${TABLES.VEHICLES} v
       LEFT JOIN ${TABLES.VEHICLE_MAKE_TYPE} m ON m.make_type_id = v.make_type_id
       LEFT JOIN ${TABLES.VEHICLE_VARIANT} vv ON vv.variant_id = v.variant_id
       LEFT JOIN ${TABLES.POLICE_STATION} ps ON ps.ps_id = v.ps_id
       LEFT JOIN ${TABLES.OFFICER_VEHICLE_MAPPING} ovm ON ovm.vehicle_id = v.vehicle_id
       LEFT JOIN ${TABLES.OFFICERS} o ON o.officer_id = ovm.officer_id
       ORDER BY v.vehicle_id DESC`
    );
  }

  async getVehicleById(id: number): Promise<Vehicle | null> {
    return this.selectOne<Vehicle>(
      `SELECT v.*, m.make_type AS make_type_name, vv.variant_name, ps.ps_name
       FROM ${TABLES.VEHICLES} v
       LEFT JOIN ${TABLES.VEHICLE_MAKE_TYPE} m ON m.make_type_id = v.make_type_id
       LEFT JOIN ${TABLES.VEHICLE_VARIANT} vv ON vv.variant_id = v.variant_id
       LEFT JOIN ${TABLES.POLICE_STATION} ps ON ps.ps_id = v.ps_id
       WHERE v.vehicle_id = ?`,
      [id]
    );
  }

  async registrationExists(regNo: string, excludeId?: number): Promise<boolean> {
    const sql = excludeId
      ? `SELECT vehicle_id FROM ${TABLES.VEHICLES} WHERE registration_no = ? AND vehicle_id != ?`
      : `SELECT vehicle_id FROM ${TABLES.VEHICLES} WHERE registration_no = ?`;
    const params = excludeId ? [regNo, excludeId] : [regNo];
    return (await this.selectOne<Vehicle>(sql, params)) !== null;
  }

  async createVehicle(data: Record<string, unknown>): Promise<number> {
    return this.insertRecord(
      `INSERT INTO ${TABLES.VEHICLES}
       (registration_no, make_type_id, variant_id, ps_id, model_year, engine_no, chassis_no, status, created_by, created_on)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      this.buildParams([
        data.registration_no,
        data.make_type_id,
        data.variant_id,
        data.ps_id,
        data.model_year,
        data.engine_no,
        data.chassis_no,
        data.status ?? "Active",
        data.created_by,
        data.created_on,
      ])
    );
  }

  async updateVehicle(id: number, data: Record<string, unknown>): Promise<void> {
    const fields = Object.keys(data).map((k) => `${k} = ?`).join(", ");
    await this.executeUpdate(
      `UPDATE ${TABLES.VEHICLES} SET ${fields} WHERE vehicle_id = ?`,
      this.buildParams([...Object.values(data), id])
    );
  }

  async deleteVehicle(id: number): Promise<void> {
    await this.executeDelete(`DELETE FROM ${TABLES.VEHICLES} WHERE vehicle_id = ?`, [id]);
  }

  async countVehicles(): Promise<number> {
    const row = await this.selectOne<CountRow>(
      `SELECT COUNT(*) as count FROM ${TABLES.VEHICLES}`
    );
    return row?.count ?? 0;
  }

  async getVehicleFuelByVehicleId(vehicleId: number): Promise<VehicleFuelEntry[]> {
    return this.selectAll<VehicleFuelEntry>(
      `SELECT vehicle_fuel_id,
              vehicle_id,
              filling_date,
              previous_reading,
              current_reading,
              liters,
              mileage
       FROM ${TABLES.VEHICLE_FUEL}
       WHERE vehicle_id = ?
       ORDER BY vehicle_fuel_id DESC`,
      [vehicleId]
    );
  }

  async getVehicleFuelById(id: number): Promise<VehicleFuelEntry | null> {
    return this.selectOne<VehicleFuelEntry>(
      `SELECT vehicle_fuel_id,
              vehicle_id,
              filling_date,
              previous_reading,
              current_reading,
              liters,
              mileage
       FROM ${TABLES.VEHICLE_FUEL}
       WHERE vehicle_fuel_id = ?`,
      [id]
    );
  }

  async getLastVehicleFuelByVehicleId(vehicleId: number): Promise<VehicleFuelEntry | null> {
    return this.selectOne<VehicleFuelEntry>(
      `SELECT vehicle_fuel_id,
              vehicle_id,
              filling_date,
              previous_reading,
              current_reading,
              liters,
              mileage
       FROM ${TABLES.VEHICLE_FUEL}
       WHERE vehicle_id = ?
       ORDER BY vehicle_fuel_id DESC
       LIMIT 1`,
      [vehicleId]
    );
  }

  async hasGreaterVehicleFuelRecord(vehicleId: number, vehicleFuelId: number): Promise<boolean> {
    const row = await this.selectOne<{ vehicle_fuel_id: number }>(
      `SELECT vehicle_fuel_id
       FROM ${TABLES.VEHICLE_FUEL}
       WHERE vehicle_id = ?
         AND vehicle_fuel_id > ?
       LIMIT 1`,
      [vehicleId, vehicleFuelId]
    );
    return row !== null;
  }

  async createVehicleFuel(data: {
    vehicle_id: number;
    filling_date: string;
    previous_reading: number;
    current_reading: number;
    liters: string;
    mileage: string;
    created_by: number;
    created_on: string;
  }): Promise<number> {
    return this.insertRecord(
      `INSERT INTO ${TABLES.VEHICLE_FUEL}
       (vehicle_id, filling_date, previous_reading, current_reading, liters, mileage, created_by, created_on)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.vehicle_id,
        data.filling_date,
        data.previous_reading,
        data.current_reading,
        data.liters,
        data.mileage,
        data.created_by,
        data.created_on,
      ]
    );
  }

  async updateVehicleFuel(
    id: number,
    data: {
      filling_date: string;
      previous_reading: number;
      current_reading: number;
      liters: string;
      mileage: string;
      updated_by: number;
      updated_on: string;
    }
  ): Promise<void> {
    await this.executeUpdate(
      `UPDATE ${TABLES.VEHICLE_FUEL}
       SET filling_date = ?,
           previous_reading = ?,
           current_reading = ?,
           liters = ?,
           mileage = ?,
           updated_by = ?,
           updated_on = ?
       WHERE vehicle_fuel_id = ?`,
      [
        data.filling_date,
        data.previous_reading,
        data.current_reading,
        data.liters,
        data.mileage,
        data.updated_by,
        data.updated_on,
        id,
      ]
    );
  }

  async deleteVehicleFuel(id: number): Promise<void> {
    await this.executeDelete(
      `DELETE FROM ${TABLES.VEHICLE_FUEL} WHERE vehicle_fuel_id = ?`,
      [id]
    );
  }
}

export const vehicleRepository = new VehicleRepository();
