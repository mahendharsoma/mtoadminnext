import { NextResponse } from "next/server";
import { query } from "@/lib/db/database";
import { TABLES } from "@/lib/constants";

/**
 * Scheduled job: Service & fuel reminders
 * Call via cron: curl -H "x-cron-secret: YOUR_CRON_SECRET" http://localhost:3000/api/cron/service-reminders
 */
export async function GET() {
  try {
    const overdueServices = await query(
      `SELECT vs.*, v.registration_no
       FROM ${TABLES.VEHICLE_SERVICES} vs
       JOIN ${TABLES.VEHICLES} v ON v.vehicle_id = vs.vehicle_id
       WHERE vs.next_service_date <= CURDATE()
       AND vs.status = 'Active'
       LIMIT 100`
    );

    const lowFuelVehicles = await query(
      `SELECT v.vehicle_id, v.registration_no,
        (SELECT MAX(vf.fuel_date) FROM ${TABLES.VEHICLE_FUEL} vf WHERE vf.vehicle_id = v.vehicle_id) as last_fuel_date
       FROM ${TABLES.VEHICLES} v
       WHERE v.status = 'Active'
       HAVING last_fuel_date IS NULL OR last_fuel_date < DATE_SUB(CURDATE(), INTERVAL 30 DAY)
       LIMIT 100`
    );

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      overdueServices: Array.isArray(overdueServices) ? overdueServices.length : 0,
      lowFuelVehicles: Array.isArray(lowFuelVehicles) ? lowFuelVehicles.length : 0,
      data: { overdueServices, lowFuelVehicles },
    });
  } catch (error) {
    console.error("Cron service-reminders error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to run service reminders" },
      { status: 500 }
    );
  }
}
