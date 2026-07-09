import type { RowDataPacket } from "mysql2/promise";

export interface User extends RowDataPacket {
  user_id: number;
  user_name: string;
  email_id: string;
  password: string;
  phone: string;
  status: string;
  created_by: number;
  created_on: string;
  updated_by: number | null;
  updated_on: string | null;
  role_id?: number;
  role_name?: string;
}

export interface Role extends RowDataPacket {
  role_id: number;
  role_name: string;
}

export interface Mechanic extends RowDataPacket {
  mechanic_id: number;
  mechanic_name: string;
  general_number: string;
  mechanic_phone: string;
  status: string;
  created_by: number;
  created_on: string;
  updated_by?: number | null;
  updated_on?: string | null;
}

export interface VehicleMakeType extends RowDataPacket {
  make_type_id: number;
  make_type_name: string;
  status: string;
  created_by: number;
  created_on: string;
}

export interface VehicleVariant extends RowDataPacket {
  variant_id: number;
  make_type_id: number;
  variant_name: string;
  status: string;
  make_type_name?: string;
}

export interface Vehicle extends RowDataPacket {
  vehicle_id: number;
  registration_no: string;
  make_type_id: number;
  variant_id: number;
  ps_id: number;
  model_year: string;
  engine_no: string;
  chassis_no: string;
  status: string;
  make_type_name?: string;
  variant_name?: string;
  ps_name?: string;
  officer_name?: string | null;
  officer_mobile?: string | null;
}

export interface VehicleFuelEntry extends RowDataPacket {
  vehicle_fuel_id: number;
  vehicle_id: number;
  filling_date: string;
  previous_reading: number | null;
  current_reading: number;
  liters: string;
  mileage: string;
}

export interface PoliceStation extends RowDataPacket {
  ps_id: number;
  ps_name: string;
  address?: string;
  ps_phone?: string;
  status: string;
  zone_name?: string;
  division_name?: string;
}

export interface Officer extends RowDataPacket {
  officer_id: number;
  ps_id?: number | null;
  officer_name: string;
  officer_mobile: string;
  officer_rank: string;
  status: string;
  ps_name?: string;
}

export interface Driver extends RowDataPacket {
  driver_id: number;
  ps_id: number;
  driver_name: string;
  general_number: string;
  status: string;
  ps_name?: string;
}

export interface ItemName extends RowDataPacket {
  item_name_id: number;
  item_name: string;
  status: string;
}

export interface Vendor extends RowDataPacket {
  vendor_id: number;
  vendor_name: string;
  vendor_address: string;
  vendor_phone: string;
  status: string;
}

export interface ReceivedVoucher extends RowDataPacket {
  received_voucher_id: number;
  note_file_no: string;
  received_voucher: string;
  held_date: string;
  vendor_id: number;
  vehicle_id: number | null;
  vendor_name?: string;
  registration_no?: string;
  status: string;
}

export interface JobCard extends RowDataPacket {
  job_card_id: number;
  vehicle_id: number;
  officer_id: number | null;
  driver_id: number | null;
  make_type_id: number | null;
  variant_id: number | null;
  job_card_status: string;
  job_type_id: number | null;
  service_type_id: number | null;
  it_no: string | null;
  outside_parts: string | null;
  outside_work_shop: string | null;
  comments: string | null;
  complaints: string | null;
  remarks: string | null;
  gate_pass: string | null;
  kmr: string | null;
  time_in: string | null;
  created_on: string;
  date_time_in: string | null;
  date_time_out: string | null;
  registration_no?: string;
  make_type?: string;
  variant_name?: string;
  officer_name?: string;
  officer_rank?: string;
  officer_mobile?: string;
  driver_name?: string;
  driver_rank?: string;
  mechanic_names?: string;
  mechanic_ids?: string;
}

export interface JobCardSparePart extends RowDataPacket {
  item_name_id: number;
  item_name: string;
  available_quantity: number | string;
  is_common: number;
}

export interface JobCardAssignedItem extends RowDataPacket {
  job_card_item_id: number;
  job_card_id: number;
  item_name_id: number;
  item_quantity: number;
  is_common: number;
}

export interface JobCardOil extends RowDataPacket {
  job_card_oil_id: number;
  job_card_id: number;
  lubricant_id: number;
  required_quantity: number;
  status: string;
  lubricant_name: string;
  lubricant_type_name: string;
  lubricant_grade: string;
  available_liters: number | string;
}

export interface VehicleType extends RowDataPacket {
  vehicle_type_id: number;
  vehicle_type_name: string;
}

export interface InspectionTitle extends RowDataPacket {
  inspection_title_id: number;
  vehicle_type_id: number;
  inspection_title: string;
  vehicle_type_name?: string;
}

export interface LubricantType extends RowDataPacket {
  lubricant_type_id: number;
  lubricant_type_name: string;
  status: string;
}

export interface LubricantGrade extends RowDataPacket {
  lubricant_grade_id: number;
  lubricant_grade_name: string;
  status: string;
}

export interface Lubricant extends RowDataPacket {
  lubricant_id: number;
  lubricant_type_id: number;
  lubricant_grade_id: number;
  lubricant_name: string;
  status: string;
  lubricant_type_name?: string;
  lubricant_grade_name?: string;
}

export interface LubricantReceiveVoucher extends RowDataPacket {
  lubricant_receive_voucher_id: number;
  voucher_no: string;
  voucher_date: string;
  note_file_no: string;
  vendor_name: string;
}

export interface LubricantVoucherItem extends RowDataPacket {
  receive_item_id: number;
  lubricant_name: string;
  ordered_quantity: number;
  total_received_liters: number;
  balance_liters: number;
  price_per_liter: number;
  amount: number;
  cgst_amount: number;
  sgst_amount: number;
  igst_amount: number;
  total_amount: number;
}

export interface LubricantVoucherContainer extends RowDataPacket {
  lubricant_container_id: number;
  barcode: string;
  barcode_image_path?: string;
  lubricant_name: string;
  container_capacity: number;
  available_liters: number;
  status: string;
}

export interface Inspection extends RowDataPacket {
  inspection_id: number;
  job_card_id: number;
  vehicle_id: number;
  inspected_by: string;
  inspected_on: string;
  general_number: string;
  comment: string;
  registration_no?: string | null;
}

export interface InspectionTitleReportRow extends RowDataPacket {
  inspection_title_mapping_id: number;
  inspection_id: number;
  job_card_id: number;
  inspected_on: string;
  registration_no?: string | null;
  vehicle_type_name?: string | null;
  inspection_title: string;
  remark?: string | null;
  inspected_by: string;
}

export interface DailyJobCardReportRow extends RowDataPacket {
  job_card_id: number;
  date_in: string;
  it_no: string | null;
  job_type_id: number | null;
  service_type_id: number | null;
  outside_work_shop: string | null;
  outside_parts: string | null;
  job_card_status: string;
  kmr: string | null;
  ps_id: number | null;
  registration_no: string | null;
  ps_name: string | null;
  make_type_name: string | null;
  variant_name: string | null;
  officer_name: string | null;
  officer_rank: string | null;
  driver_name: string | null;
  driver_rank: string | null;
  mechanic_names: string | null;
  allocated_items_details: string | null;
  job_card_total_price: number | string;
}

export interface RvDcReportRow extends RowDataPacket {
  report_date: string;
  note_file_no: string;
  rv_dc_number: string;
  received_from: string;
  make_name: string | null;
  variant_name: string | null;
  item_name: string;
  sanctioned_qty: number | string;
  received_qty: number | string;
  received_date_qty: string | null;
  pending_qty: number | string;
  item_status: string;
}

export interface CondemnationReportRow extends RowDataPacket {
  condemnation_id: number;
  job_card_id: number;
  make_type_id: number;
  variant_id: number;
  item_name_id: number;
  item_inventory_id: number;
  status: string;
  vehicle_id: number;
  job_type_id: number | null;
  service_type_id: number | null;
  it_no: string | null;
  remarks: string | null;
  outside_parts: string | null;
  outside_work_shop: string | null;
  registration_no: string | null;
  make_type: string | null;
  variant_name: string | null;
  item_name: string | null;
  bulk_items_id: number | null;
  received_voucher_id: number | null;
  received_voucher: string | null;
  held_date: string | null;
  item_quantity: number | string;
}

export interface StockReportRow extends RowDataPacket {
  inventory_id: number;
  make_type_id: number | null;
  variant_id: number | null;
  item_name_id: number;
  is_common: number;
  make_type: string | null;
  variant_name: string | null;
  item_name: string;
  total_sanctioned_quantity: number | string;
  pending_quantity: number | string;
  received_quantity: number | string;
  available_quantity: number | string;
}

export interface IssuedStockReportRow extends RowDataPacket {
  issued_date: string;
  created_on: string;
  make_type_id: number | null;
  variant_id: number | null;
  item_name_id: number;
  make_type: string | null;
  variant_name: string | null;
  item_name: string | null;
  vehicle_id: number | null;
  registration_no: string | null;
  is_common: number | null;
  total_issued_stock: number | string;
}

export interface VehicleOverallServiceReportRow extends RowDataPacket {
  job_card_id: number;
  it_no: string | null;
  date_in: string | null;
  time_in: string | null;
  kmr: string | null;
  job_type_id: number | null;
  service_type_id: number | null;
  outside_parts: string | null;
  outside_work_shop: string | null;
  remarks: string | null;
  complaints: string | null;
  job_card_status: string;
  registration_no: string | null;
  make_type: string | null;
  variant_name: string | null;
  ps_name: string | null;
  issued_items: string | null;
  created_on: string | null;
}

export interface VehicleFuelReportRow extends RowDataPacket {
  vehicle_fuel_id: number;
  vehicle_id: number;
  filling_date: string;
  previous_reading: number | null;
  current_reading: number;
  liters: string;
  mileage: string;
  registration_no: string | null;
}

export interface DashboardStats {
  totalVehicles: number;
  approvedJobCards: number;
  closedJobCards: number;
  activeJobCards: number;
  receivedVouchers: number;
  totalStockQuantity: number;
  totalMechanics: number;
  psCount: number;
}

export interface JWTPayload {
  userId: number;
  userName: string;
  userEmail: string;
  userPhone: string;
  userRole: string;
}
