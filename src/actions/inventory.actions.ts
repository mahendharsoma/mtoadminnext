"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { requireSession } from "@/lib/auth/jwt";
import { inventoryRepository } from "@/lib/db/repositories/inventory.repository";
import { getCurrentDateTimeForDb } from "@/lib/utils";
import { failureResponse, successResponse, INVENTORY_QR_PASSWORD } from "@/lib/constants";
import { resolveInventoryMakeVariantIds } from "@/lib/inventory-utils";

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
  } catch (error) {
    console.error("createVendorAction failed:", error);
    return failureResponse("Unable to create vendor");
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
  } catch (error) {
    console.error("updateVendorAction failed:", error);
    return failureResponse("Unable to update vendor");
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

  const isCommon = Number(bulk.is_common ?? 0) === 1 ? 1 : 0;
  const { makeTypeId, variantId } = resolveInventoryMakeVariantIds(
    isCommon,
    bulk.make_type_id as number | null,
    bulk.variant_id as number | null
  );
  const itemNameId = Number(bulk.item_name_id);

  const total = Number(bulk.total_quantity || 0);
  const tx = await inventoryRepository.getItemTransactionByBulkItemId(bulkItemsId);
  const actualReceived = await inventoryRepository.countItemsByBulkItemId(bulkItemsId);
  const prevReceived = actualReceived;
  const pending = total - prevReceived;
  if (addQty > pending) {
    return failureResponse(
      "Unable to Add Item Quantity, You are Adding more than the total quantity"
    );
  }

  const nextReceived = prevReceived + addQty;
  const now = getCurrentDateTimeForDb();
  const hadTransaction = Boolean(tx?.item_transaction_id);

  try {
    if (hadTransaction) {
      await inventoryRepository.updateItemTransaction(Number(tx!.item_transaction_id), {
        total_quantity: total,
        received_quantity: nextReceived,
        added_item_quantity: addQty,
        item_price: itemPrice,
        received_date: receivedDate,
        updated_by: session.userId,
        updated_on: now,
      });
    } else {
      await inventoryRepository.insertItemTransaction({
        bulk_items_id: bulkItemsId,
        total_quantity: total,
        received_quantity: nextReceived,
        added_item_quantity: addQty,
        is_common: isCommon,
        item_price: itemPrice,
        received_date: receivedDate,
        created_by: session.userId,
        created_on: now,
      });
    }

    const mainInv = await inventoryRepository.getMainInventory(
      makeTypeId,
      variantId,
      itemNameId
    );

    if (mainInv?.inventory_id) {
      await inventoryRepository.updateMainInventory(Number(mainInv.inventory_id), {
        total_quantity: Number(mainInv.total_quantity) + addQty,
        available_quantity: Number(mainInv.available_quantity) + addQty,
        updated_by: session.userId,
        updated_on: now,
      });
    } else {
      await inventoryRepository.insertMainInventory({
        bulk_items_id: bulkItemsId,
        make_type_id: makeTypeId,
        variant_id: variantId,
        item_name_id: itemNameId,
        is_common: isCommon,
        total_quantity: addQty,
        available_quantity: addQty,
        item_price: itemPrice,
        status: "Active",
        created_by: session.userId,
        created_on: now,
      });
    }

    const { generateSequentialBarcode, generateBarcodeImage } = await import("@/lib/barcode");

    for (let i = 0; i < addQty; i += 1) {
      const itemId = await inventoryRepository.insertSingleItem({
        bulk_items_id: bulkItemsId,
        make_type_id: makeTypeId,
        variant_id: variantId,
        item_name_id: itemNameId,
        is_common: isCommon,
        item_price: itemPrice,
        status: "Active",
        created_by: session.userId,
        created_on: now,
      });

      const barcodeNumber = generateSequentialBarcode(itemId);
      const barcodeImage = await generateBarcodeImage(barcodeNumber);
      await inventoryRepository.updateItemBarcode(itemId, {
        barcode_number: barcodeNumber,
        barcode_image: barcodeImage,
        make_type_id: makeTypeId,
        variant_id: variantId,
        item_name_id: itemNameId,
        updated_by: session.userId,
        updated_on: now,
      });
    }

    revalidatePath(`/received-voucher/${bulk.received_voucher_id}/items`);
    revalidatePath(`/add-items-quantity/${bulkItemsId}`);
    revalidatePath("/total-stock");
    return successResponse(
      undefined,
      hadTransaction ? "Successfully Updated Items" : "Successfully Added Items",
      { refreshPage: true }
    );
  } catch (error) {
    console.error("addBulkItemQuantityAction failed:", error);
    return failureResponse("Unable to Add Items Quantity, please try later");
  }
}

export async function deleteSingleBarcodeItemAction(formData: FormData) {
  const session = await requireSession();
  const itemInventoryId = Number(formData.get("item_inventory_id"));
  const bulkItemsId = Number(formData.get("bulk_items_id"));
  if (!itemInventoryId || !bulkItemsId) {
    return failureResponse("Invalid item");
  }

  const item = await inventoryRepository.getItemInventoryById(itemInventoryId);
  if (!item || Number(item.bulk_items_id) !== bulkItemsId) {
    return failureResponse("Item not found");
  }

  if (await inventoryRepository.isItemInventoryAllocated(itemInventoryId)) {
    return failureResponse("Cannot remove item — it is already allocated to a vehicle");
  }

  const bulk = await inventoryRepository.getBulkItemById(bulkItemsId);
  if (!bulk) return failureResponse("Bulk item not found");

  const isCommon = Number(bulk.is_common ?? 0) === 1 ? 1 : 0;
  const { makeTypeId, variantId } = resolveInventoryMakeVariantIds(
    isCommon,
    bulk.make_type_id as number | null,
    bulk.variant_id as number | null
  );
  const itemNameId = Number(bulk.item_name_id);
  const now = getCurrentDateTimeForDb();

  try {
    await inventoryRepository.deleteItemInventoryById(itemInventoryId);

    const tx = await inventoryRepository.getItemTransactionByBulkItemId(bulkItemsId);
    if (tx?.item_transaction_id) {
      const prevReceived = Number(tx.received_quantity ?? 0);
      const nextReceived = Math.max(0, prevReceived - 1);
      await inventoryRepository.updateItemTransaction(Number(tx.item_transaction_id), {
        received_quantity: nextReceived,
        updated_by: session.userId,
        updated_on: now,
      });
    }

    const mainInv = await inventoryRepository.getMainInventory(
      makeTypeId,
      variantId,
      itemNameId
    );
    if (mainInv?.inventory_id) {
      await inventoryRepository.updateMainInventory(Number(mainInv.inventory_id), {
        total_quantity: Math.max(0, Number(mainInv.total_quantity) - 1),
        available_quantity: Math.max(0, Number(mainInv.available_quantity) - 1),
        updated_by: session.userId,
        updated_on: now,
      });
    }

    revalidatePath(`/received-voucher/${bulk.received_voucher_id}/items`);
    revalidatePath(`/add-items-quantity/${bulkItemsId}`);
    revalidatePath("/total-stock");
    return successResponse(undefined, "Item removed successfully", { refreshPage: true });
  } catch (error) {
    console.error("deleteSingleBarcodeItemAction failed:", error);
    return failureResponse("Unable to remove item, please try later");
  }
}
