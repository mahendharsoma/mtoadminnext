// System status codes (mirrors CI4 Constants.php)
export const SYSTEM_STATUS = {
  SUCCESS: 200,
  FAILURE: 500,
} as const;

export const STATUS = {
  ACTIVE: "Active",
  INACTIVE: "Inactive",
  PENDING: "Pending",
} as const;

export const JOB_CARD_STATUS = {
  ACTIVE: "Active",
  APPROVE: "Approve",
  CLOSE: "Close",
  REJECTED: "Rejected",
} as const;

export const ITEM_INVENTORY_STATUS = {
  AVAILABLE: "Available",
  SOLD: "Sold",
} as const;

export const INVENTORY_QR_PASSWORD =
  process.env.INVENTORY_QR_PASSWORD ?? "MTO@MLKJ";

// Table names
export const TABLES = {
  USERS: "users",
  ROLES: "roles",
  USER_ROLE_MAPPING: "user_role_mapping",
  MECHANICS: "mechanics",
  VEHICLE_MAKE_TYPE: "vehicle_make_type",
  VEHICLE_VARIANT: "vehicle_variant",
  VEHICLES: "vehicles",
  POLICE_STATION: "police_station",
  OFFICERS: "officers",
  DRIVERS: "drivers",
  OFFICER_VEHICLE_MAPPING: "officer_vehicle_mapping",
  DRIVER_VEHICLE_MAPPING: "driver_vehicle_mapping",
  JOB_CARD: "job_card",
  JOB_CARD_ITEMS: "job_card_items",
  JOB_CARD_MECHANIC_MAPPING: "job_card_mechanic_mapping",
  JOB_CARD_OILS: "job_card_oils",
  ITEM_NAME: "item_name",
  BULK_ITEMS: "bulk_items",
  RECEIVED_VOUCHERS: "received_vouchers",
  ITEM_TRANSACTION: "item_transaction",
  ITEM_INVENTORY: "item_inventory",
  VEHICLE_ALLOCATED_ITEMS: "vehicle_allocated_items",
  INVENTORY: "inventory",
  VEHICLE_FUEL: "vehicle_fuel",
  VEHICLE_SERVICES: "vehicle_services",
  VEHICLE_TYPES: "vehicle_types",
  INSPECTIONS: "inspections",
  INSPECTION_TITLES: "inspection_titles",
  INSPECTION_TITLE_MAPPING: "inspection_title_mappig",
  VENDORS: "vendors",
  LUBRICANT_TYPE: "lubricant_type",
  LUBRICANT_GRADES: "lubricant_grades",
  LUBRICANTS: "lubricants",
  LUBRICANT_RECEIVE_VOUCHER: "lubricant_receive_voucher",
  LUBRICANT_RECEIVE_VOUCHER_ITEMS: "lubricant_receive_voucher_items",
  LUBRICANT_CONTAINERS: "lubricant_containers",
  LUBRICANT_INVENTORY: "lubricant_inventory",
  LUBRICANT_CONTAINER_TRANSACTIONS: "lubricant_container_transactions",
  CONDEMNATION: "condemnation",
} as const;

export const ROLES = {
  ADMIN: "Admin",
  STORE: "Store",
  STORE_ADMIN: "Store Admin",
  WORKSHOP: "Work Shop",
  CONDEMNATION: "Condemnation",
} as const;

export const ALLOWED_LOGIN_ROLES = [ROLES.ADMIN, ROLES.STORE, ROLES.STORE_ADMIN];

export const JOB_TYPES: Record<number, string> = {
  1: "In Side",
  2: "Out Side",
};

export const SERVICE_TYPES: Record<number, string> = {
  1: "General",
  2: "Minor Repair",
  3: "Major Repair",
  4: "Quick",
  5: "Inspection",
};

export type ActionResponse<T = unknown> = {
  ok: boolean;
  message: string;
  data?: T;
  refresh: boolean;
  redirect: string | null;

  // Backward compatibility with current UI usage
  statusCode: number;
  statusMessage: string;
  refreshPage?: boolean;
  redirectUrl?: string | null;
};

export function successResponse<T>(
  data?: T,
  message = "Process Completed Successfully",
  options?: { refreshPage?: boolean; redirectUrl?: string | null }
): ActionResponse<T> {
  const refresh = options?.refreshPage ?? false;
  const redirect = options?.redirectUrl ?? null;
  return {
    ok: true,
    message,
    data,
    refresh,
    redirect,
    statusCode: SYSTEM_STATUS.SUCCESS,
    statusMessage: message,
    refreshPage: refresh,
    redirectUrl: redirect,
  };
}

export function failureResponse(
  message = "Unable to process the request, Please try again."
): ActionResponse {
  return {
    ok: false,
    message,
    refresh: false,
    redirect: null,
    statusCode: SYSTEM_STATUS.FAILURE,
    statusMessage: message,
    refreshPage: false,
    redirectUrl: null,
  };
}
