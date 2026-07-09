"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { requireSession } from "@/lib/auth/jwt";
import { inventoryRepository } from "@/lib/db/repositories/inventory.repository";
import { getCurrentDateTimeForDb } from "@/lib/utils";
import { failureResponse, successResponse, INVENTORY_QR_PASSWORD } from "@/lib/constants";

function isValidPhone(phone: string): boolean {
  return /^\d{10}$/.test(phone.trim());
}

export async function unlockTotalStockQrAction(formData: FormData) {
  const password = String(formData.get("inventory_qr_password") || "").trim();
  if (!password) return failureResponse("Password is required");
  if (password !== INVENTORY_QR_PASSWORD) {
    return failureResponse("Password is not correct. Please try again.");
  }

  const cookieStore = await cookies();
  cookieStore.set("mto_qr_stock_access", "1", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24,
    path: "/",
  });
  return successResponse(undefined, "Access granted", { refreshPage: true });
}

export async function createItemNameAction(formData: FormData) {
  const session = await requireSession();
  const name = formData.get("item_name") as string;
  if (!name?.trim()) return failureResponse("Item name is required");
  const itemName = name.trim();

  if (await inventoryRepository.itemNameExists(itemName)) {
    return failureResponse("Item name already exists");
  }

  try {
    await inventoryRepository.createItemName({
      item_name: itemName,
      status: "Active",
      created_by: session.userId,
      created_on: getCurrentDateTimeForDb(),
    });
    revalidatePath("/add-item-name");
    return successResponse(undefined, "Item name created", { refreshPage: true });
  } catch {
    return failureResponse();
  }
}

export async function updateItemNameAction(formData: FormData) {
  const session = await requireSession();
  const id = Number(formData.get("item_name_id"));
  const name = formData.get("item_name") as string;
  if (!id) return failureResponse("Invalid ID");
  if (!name?.trim()) return failureResponse("Item name is required");
  const itemName = name.trim();

  if (await inventoryRepository.itemNameExists(itemName, id)) {
    return failureResponse("Item name already exists");
  }

  try {
    await inventoryRepository.updateItemName(id, {
      item_name: itemName,
      updated_by: session.userId,
      updated_on: getCurrentDateTimeForDb(),
    });
    revalidatePath("/add-item-name");
    return successResponse(undefined, "Updated", { refreshPage: true });
  } catch {
    return failureResponse();
  }
}

export async function deleteItemNameAction(id: number) {
  await requireSession();
  try {
    await inventoryRepository.deleteItemName(id);
    revalidatePath("/add-item-name");
    return successResponse(undefined, "Deleted", { refreshPage: true });
  } catch {
    return failureResponse();
  }
}

export async function createVendorAction(formData: FormData) {
  const session = await requireSession();
  const vendorName = String(formData.get("vendor_name") || "").trim();
  const vendorPhone = String(formData.get("vendor_phone") || "").trim();
  if (!vendorName) return failureResponse("Vendor name is required");
  if (!vendorPhone) return failureResponse("Phone is required");
  if (vendorPhone && !isValidPhone(vendorPhone)) {
    return failureResponse("Phone must be exactly 10 digits");
  }
  try {
    await inventoryRepository.createVendor({
      vendor_name: vendorName,
      vendor_phone: vendorPhone,
      created_by: session.userId,
      created_on: getCurrentDateTimeForDb(),
    });
    revalidatePath("/vendors");
    return successResponse(undefined, "Vendor created", { refreshPage: true });
  } catch {
    return failureResponse();
  }
}

export async function updateVendorAction(formData: FormData) {
  const session = await requireSession();
  const id = Number(formData.get("vendor_id"));
  if (!id) return failureResponse("Invalid ID");
  const vendorName = String(formData.get("vendor_name") || "").trim();
  const vendorPhone = String(formData.get("vendor_phone") || "").trim();
  if (!vendorName) return failureResponse("Vendor name is required");
  if (!vendorPhone) return failureResponse("Phone is required");
  if (vendorPhone && !isValidPhone(vendorPhone)) {
    return failureResponse("Phone must be exactly 10 digits");
  }

  try {
    await inventoryRepository.updateVendor(id, {
      vendor_name: vendorName,
      vendor_phone: vendorPhone,
      updated_by: session.userId,
      updated_on: getCurrentDateTimeForDb(),
    });
    revalidatePath("/vendors");
    return successResponse(undefined, "Updated", { refreshPage: true });
  } catch {
    return failureResponse();
  }
}

export async function deleteVendorAction(id: number) {
  await requireSession();
  try {
    await inventoryRepository.deleteVendor(id);
    revalidatePath("/vendors");
    return successResponse(undefined, "Deleted", { refreshPage: true });
  } catch {
    return failureResponse();
  }
}

export async function createReceivedVoucherAction(formData: FormData) {
  const session = await requireSession();
  const vendorId = Number(formData.get("vendor_id"));
  const vehicleId = formData.get("vehicle_id") ? Number(formData.get("vehicle_id")) : null;
  const noteFileNo = String(formData.get("note_file_no") || "").trim();
  const receivedVoucher = String(formData.get("received_voucher") || "").trim();
  const heldDate = String(formData.get("held_date") || "").trim();
  if (!vendorId || !noteFileNo || !receivedVoucher || !heldDate) {
    return failureResponse("Vendor, note file, received voucher and held date are required");
  }
  if (await inventoryRepository.noteFileNoExists(noteFileNo)) {
    return failureResponse("Note File Number already exists");
  }
  if (await inventoryRepository.receivedVoucherExists(receivedVoucher)) {
    return failureResponse("Received Voucher already exists");
  }

  try {
    const id = await inventoryRepository.createVoucher({
      vendor_id: vendorId,
      vehicle_id: vehicleId,
      note_file_no: noteFileNo,
      received_voucher: receivedVoucher,
      held_date: heldDate,
      status: "Active",
      created_by: session.userId,
      created_on: getCurrentDateTimeForDb(),
    });
    revalidatePath("/received-voucher");
    return successResponse({ voucherId: id }, "Voucher created", {
      redirectUrl: `/received-voucher/${id}/items`,
    });
  } catch {
    return failureResponse();
  }
}

export async function updateReceivedVoucherAction(formData: FormData) {
  const session = await requireSession();
  const id = Number(formData.get("received_voucher_id"));
  if (!id) return failureResponse("Invalid ID");
  const vendorId = Number(formData.get("vendor_id"));
  const vehicleId = formData.get("vehicle_id") ? Number(formData.get("vehicle_id")) : null;
  const noteFileNo = String(formData.get("note_file_no") || "").trim();
  const receivedVoucher = String(formData.get("received_voucher") || "").trim();
  const heldDate = String(formData.get("held_date") || "").trim();
  if (!vendorId || !noteFileNo || !receivedVoucher || !heldDate) {
    return failureResponse("Vendor, note file, received voucher and held date are required");
  }
  if (await inventoryRepository.noteFileNoExists(noteFileNo, id)) {
    return failureResponse("Note File Number already exists");
  }
  if (await inventoryRepository.receivedVoucherExists(receivedVoucher, id)) {
    return failureResponse("Received Voucher already exists");
  }

  try {
    await inventoryRepository.updateVoucher(id, {
      vendor_id: vendorId,
      vehicle_id: vehicleId,
      note_file_no: noteFileNo,
      received_voucher: receivedVoucher,
      held_date: heldDate,
      updated_by: session.userId,
      updated_on: getCurrentDateTimeForDb(),
    });
    revalidatePath("/received-voucher");
    return successResponse(undefined, "Updated", { refreshPage: true });
  } catch {
    return failureResponse();
  }
}

export async function createBulkItemAction(formData: FormData) {
  const session = await requireSession();
  const voucherId = Number(formData.get("received_voucher_id"));
  const itemNameId = Number(formData.get("item_name_id"));
  if (!voucherId || !itemNameId) return failureResponse("Invalid item details");
  const qty = formData.get("total_quantity") as string;
  const price = formData.get("item_price") as string;
  const isCommon = formData.get("is_common") === "1";
  const makeTypeId = isCommon ? null : (formData.get("make_type_id") ? Number(formData.get("make_type_id")) : null);
  const variantId = isCommon ? null : (formData.get("variant_id") ? Number(formData.get("variant_id")) : null);

  if (!isCommon && (!makeTypeId || !variantId)) {
    return failureResponse("Make type and variant are required");
  }
  if (await inventoryRepository.bulkItemExists(voucherId, makeTypeId, variantId, itemNameId)) {
    return failureResponse("Duplicate entries detected, please check once");
  }

  try {
    const totalPrice = (parseFloat(qty || "0") * parseFloat(price || "0")).toFixed(2);
    await inventoryRepository.createBulkItem({
      received_voucher_id: voucherId,
      make_type_id: makeTypeId,
      variant_id: variantId,
      item_name_id: itemNameId,
      is_common: isCommon ? 1 : 0,
      total_quantity: qty,
      item_price: price || "0",
      total_price: totalPrice,
      received_from: (formData.get("received_from") as string) || "N/A",
      created_by: session.userId,
      created_on: getCurrentDateTimeForDb(),
    });
    revalidatePath(`/received-voucher/${voucherId}/items`);
    return successResponse(undefined, "Item added to voucher", { refreshPage: true });
  } catch {
    return failureResponse();
  }
}

type BulkItemInput = {
  item_name_id: number;
  total_quantity: number;
  item_price: number;
  received_from: string;
};

export async function createBulkItemsBatchAction(formData: FormData) {
  const session = await requireSession();
  const voucherId = Number(formData.get("received_voucher_id"));
  if (!voucherId) return failureResponse("Invalid voucher");

  const isCommon = formData.get("is_common") === "1";
  const makeTypeId = isCommon ? null : (formData.get("make_type_id") ? Number(formData.get("make_type_id")) : null);
  const variantId = isCommon ? null : (formData.get("variant_id") ? Number(formData.get("variant_id")) : null);
  if (!isCommon && (!makeTypeId || !variantId)) {
    return failureResponse("Make type and variant are required");
  }

  const itemsRaw = String(formData.get("items_json") || "[]");
  let items: BulkItemInput[] = [];
  try {
    items = JSON.parse(itemsRaw) as BulkItemInput[];
  } catch {
    return failureResponse("Invalid items payload");
  }
  if (!items.length) return failureResponse("Add at least one item");

  const dedupe = new Set<string>();
  for (const item of items) {
    if (!item.item_name_id || !item.total_quantity || item.total_quantity <= 0) {
      return failureResponse("Item and quantity are required for all rows");
    }
    const key = `${item.item_name_id}`;
    if (dedupe.has(key)) return failureResponse("Duplicate item rows detected, please check once");
    dedupe.add(key);
    if (await inventoryRepository.bulkItemExists(voucherId, makeTypeId, variantId, item.item_name_id)) {
      return failureResponse("Duplicate entries detected, please check once");
    }
  }

  try {
    for (const item of items) {
      await inventoryRepository.createBulkItem({
        received_voucher_id: voucherId,
        make_type_id: makeTypeId,
        variant_id: variantId,
        item_name_id: item.item_name_id,
        is_common: isCommon ? 1 : 0,
        total_quantity: String(item.total_quantity),
        item_price: String(item.item_price ?? 0),
        total_price: String((item.total_quantity * (item.item_price ?? 0)).toFixed(2)),
        received_from: item.received_from || "N/A",
        created_by: session.userId,
        created_on: getCurrentDateTimeForDb(),
      });
    }
    revalidatePath(`/received-voucher/${voucherId}/items`);
    return successResponse(undefined, "Items Added Successfully!", { refreshPage: true });
  } catch {
    return failureResponse("Item insert failed.");
  }
}

export async function addBulkItemQuantityAction(formData: FormData) {
  const session = await requireSession();
  const bulkItemsId = Number(formData.get("bulk_items_id"));
  const addQty = Number(formData.get("add_item_quantity"));
  const itemPrice = String(formData.get("item_price") || "0");
  const receivedDate = String(formData.get("received_date") || "");
  if (!bulkItemsId || !addQty || addQty <= 0 || !receivedDate) {
    return failureResponse("Quantity and received date are required");
  }

  const bulk = await inventoryRepository.getBulkItemById(bulkItemsId);
  if (!bulk) return failureResponse("Bulk item not found");

  const total = Number(bulk.total_quantity || 0);
  const tx = await inventoryRepository.getItemTransactionByBulkItemId(bulkItemsId);
  const prevReceived = Number((tx?.received_quantity as number | undefined) ?? 0);
  const pending = total - prevReceived;
  if (addQty > pending) {
    return failureResponse("Unable to add item quantity, adding more than ordered quantity");
  }

  const nextReceived = prevReceived + addQty;

  try {
    if (tx?.item_transaction_id) {
      await inventoryRepository.updateItemTransaction(Number(tx.item_transaction_id), {
        total_quantity: total,
        received_quantity: nextReceived,
        added_item_quantity: addQty,
        item_price: itemPrice,
        received_date: receivedDate,
        updated_by: session.userId,
        updated_on: getCurrentDateTimeForDb(),
      });
    } else {
      await inventoryRepository.insertItemTransaction({
        bulk_items_id: bulkItemsId,
        total_quantity: total,
        received_quantity: nextReceived,
        added_item_quantity: addQty,
        is_common: Number(bulk.is_common ?? 0),
        item_price: itemPrice,
        received_date: receivedDate,
        created_by: session.userId,
        created_on: getCurrentDateTimeForDb(),
      });
    }

    const mainInv = await inventoryRepository.getMainInventory(
      (bulk.make_type_id as number | null) ?? null,
      (bulk.variant_id as number | null) ?? null,
      Number(bulk.item_name_id)
    );

    if (mainInv?.inventory_id) {
      await inventoryRepository.updateMainInventory(Number(mainInv.inventory_id), {
        total_quantity: Number(mainInv.total_quantity) + addQty,
        available_quantity: Number(mainInv.available_quantity) + addQty,
        item_price: itemPrice,
        updated_by: session.userId,
        updated_on: getCurrentDateTimeForDb(),
      });
    } else {
      await inventoryRepository.insertMainInventory({
        bulk_items_id: bulkItemsId,
        make_type_id: (bulk.make_type_id as number | null) ?? null,
        variant_id: (bulk.variant_id as number | null) ?? null,
        item_name_id: Number(bulk.item_name_id),
        is_common: Number(bulk.is_common ?? 0),
        total_quantity: addQty,
        available_quantity: addQty,
        item_price: itemPrice,
        status: "Active",
        created_by: session.userId,
        created_on: getCurrentDateTimeForDb(),
      });
    }

    for (let i = 0; i < addQty; i += 1) {
      await inventoryRepository.insertSingleItem({
        bulk_items_id: bulkItemsId,
        make_type_id: (bulk.make_type_id as number | null) ?? null,
        variant_id: (bulk.variant_id as number | null) ?? null,
        item_name_id: Number(bulk.item_name_id),
        is_common: Number(bulk.is_common ?? 0),
        item_price: itemPrice,
        status: "Active",
        created_by: session.userId,
        created_on: getCurrentDateTimeForDb(),
      });
    }

    revalidatePath(`/received-voucher/${bulk.received_voucher_id}/items`);
    revalidatePath("/total-stock");
    return successResponse(undefined, "Successfully Added Items", { refreshPage: true });
  } catch {
    return failureResponse("Unable to add item quantity, please try later");
  }
}
