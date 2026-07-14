import { BaseRepository } from "@/lib/db/repositories/base.repository";
import { TABLES } from "@/lib/constants";
import type { CountRow, SumRow } from "@/lib/db/types";
import type { ItemName, Vendor, ReceivedVoucher } from "@/lib/types";
import type { RowDataPacket } from "mysql2/promise";

interface StockRow extends RowDataPacket {
  inventory_id: number;
  make_type_id: number | null;
  variant_id: number | null;
  item_name_id: number;
  is_common: number;
  make_type_name: string | null;
  variant_name: string | null;
  item_name: string;
  total_sanctioned_quantity: number;
  pending_quantity: number;
  master_total_quantity: number;
  received_quantity: number;
  available_quantity: number;
}

interface BulkItemRow extends RowDataPacket {
  bulk_items_id: number;
  received_voucher_id: number;
  make_type_id: number | null;
  variant_id: number | null;
  item_name_id: number;
  is_common: number;
  total_quantity: string;
  item_price: string;
  total_price: string;
  received_from: string;
  make_type_name?: string;
  variant_name?: string;
  item_name?: string;
  received_quantity?: number;
}

export class InventoryRepository extends BaseRepository {
  // Item Names
  async getAllItemNames(): Promise<ItemName[]> {
    return this.selectAll<ItemName>(
      `SELECT * FROM ${TABLES.ITEM_NAME} ORDER BY item_name_id DESC`
    );
  }

  async createItemName(data: {
    item_name: string;
    status: string;
    created_by: number;
    created_on: string;
  }): Promise<number> {
    return this.insertRecord(
      `INSERT INTO ${TABLES.ITEM_NAME} (item_name, status, created_by, created_on)
       VALUES (?, ?, ?, ?)`,
      [data.item_name, data.status, data.created_by, data.created_on]
    );
  }

  async itemNameExists(itemName: string, excludeId?: number): Promise<boolean> {
    const sql = excludeId
      ? `SELECT item_name_id
         FROM ${TABLES.ITEM_NAME}
         WHERE LOWER(TRIM(item_name)) = LOWER(TRIM(?))
           AND item_name_id != ?`
      : `SELECT item_name_id
         FROM ${TABLES.ITEM_NAME}
         WHERE LOWER(TRIM(item_name)) = LOWER(TRIM(?))`;
    const params = excludeId ? [itemName, excludeId] : [itemName];
    return (await this.selectOne<ItemName>(sql, params)) !== null;
  }

  async updateItemName(id: number, data: Record<string, unknown>): Promise<void> {
    const fields = Object.keys(data).map((k) => `${k} = ?`).join(", ");
    await this.executeUpdate(
      `UPDATE ${TABLES.ITEM_NAME} SET ${fields} WHERE item_name_id = ?`,
      this.buildParams([...Object.values(data), id])
    );
  }

  async deleteItemName(id: number): Promise<void> {
    await this.executeDelete(`DELETE FROM ${TABLES.ITEM_NAME} WHERE item_name_id = ?`, [id]);
  }

  // Vendors
  async getAllVendors(): Promise<Vendor[]> {
    return this.selectAll<Vendor>(
      `SELECT * FROM ${TABLES.VENDORS} ORDER BY vendor_id DESC`
    );
  }

  async createVendor(data: Record<string, unknown>): Promise<number> {
    return this.insertRecord(
      `INSERT INTO ${TABLES.VENDORS} (vendor_name, vendor_phone, created_by, created_on)
       VALUES (?, ?, ?, ?)`,
      this.buildParams([
        data.vendor_name,
        data.vendor_phone,
        data.created_by,
        data.created_on,
      ])
    );
  }

  async updateVendor(id: number, data: Record<string, unknown>): Promise<void> {
    await this.executeUpdate(
      `UPDATE ${TABLES.VENDORS}
       SET vendor_name = ?, vendor_phone = ?, updated_by = ?, updated_on = ?
       WHERE vendor_id = ?`,
      this.buildParams([
        data.vendor_name,
        data.vendor_phone,
        data.updated_by,
        data.updated_on,
        id,
      ])
    );
  }

  async deleteVendor(id: number): Promise<void> {
    await this.executeDelete(`DELETE FROM ${TABLES.VENDORS} WHERE vendor_id = ?`, [id]);
  }

  // Received Vouchers
  async getAllVouchers(): Promise<ReceivedVoucher[]> {
    return this.selectAll<ReceivedVoucher>(
      `SELECT rv.*, v.vendor_name, vh.registration_no
       FROM ${TABLES.RECEIVED_VOUCHERS} rv
       LEFT JOIN ${TABLES.VENDORS} v ON v.vendor_id = rv.vendor_id
       LEFT JOIN ${TABLES.VEHICLES} vh ON vh.vehicle_id = rv.vehicle_id
       ORDER BY rv.received_voucher_id DESC`
    );
  }

  async createVoucher(data: Record<string, unknown>): Promise<number> {
    return this.insertRecord(
      `INSERT INTO ${TABLES.RECEIVED_VOUCHERS}
       (vendor_id, vehicle_id, note_file_no, received_voucher, held_date, status, created_by, created_on)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      this.buildParams([
        data.vendor_id,
        data.vehicle_id ?? null,
        data.note_file_no,
        data.received_voucher,
        data.held_date,
        data.status ?? "Active",
        data.created_by,
        data.created_on,
      ])
    );
  }

  async updateVoucher(id: number, data: Record<string, unknown>): Promise<void> {
    const fields = Object.keys(data).map((k) => `${k} = ?`).join(", ");
    await this.executeUpdate(
      `UPDATE ${TABLES.RECEIVED_VOUCHERS} SET ${fields} WHERE received_voucher_id = ?`,
      this.buildParams([...Object.values(data), id])
    );
  }

  async countVouchers(): Promise<number> {
    const row = await this.selectOne<CountRow>(
      `SELECT COUNT(*) as count FROM ${TABLES.RECEIVED_VOUCHERS}`
    );
    return row?.count ?? 0;
  }

  async noteFileNoExists(noteFileNo: string, excludeId?: number): Promise<boolean> {
    const sql = excludeId
      ? `SELECT received_voucher_id
         FROM ${TABLES.RECEIVED_VOUCHERS}
         WHERE LOWER(TRIM(note_file_no)) = LOWER(TRIM(?))
           AND received_voucher_id != ?`
      : `SELECT received_voucher_id
         FROM ${TABLES.RECEIVED_VOUCHERS}
         WHERE LOWER(TRIM(note_file_no)) = LOWER(TRIM(?))`;
    const params = excludeId ? [noteFileNo, excludeId] : [noteFileNo];
    return (await this.selectOne<ReceivedVoucher>(sql, params)) !== null;
  }

  async receivedVoucherExists(receivedVoucher: string, excludeId?: number): Promise<boolean> {
    const sql = excludeId
      ? `SELECT received_voucher_id
         FROM ${TABLES.RECEIVED_VOUCHERS}
         WHERE LOWER(TRIM(received_voucher)) = LOWER(TRIM(?))
           AND received_voucher_id != ?`
      : `SELECT received_voucher_id
         FROM ${TABLES.RECEIVED_VOUCHERS}
         WHERE LOWER(TRIM(received_voucher)) = LOWER(TRIM(?))`;
    const params = excludeId ? [receivedVoucher, excludeId] : [receivedVoucher];
    return (await this.selectOne<ReceivedVoucher>(sql, params)) !== null;
  }

  // Bulk Items
  async getBulkItemsByVoucher(voucherId: number): Promise<BulkItemRow[]> {
    return this.selectAll<BulkItemRow>(
      `SELECT bi.*, m.make_type AS make_type_name, vv.variant_name, iname.item_name,
              COALESCE(MAX(it.received_quantity), 0) AS received_quantity
       FROM ${TABLES.BULK_ITEMS} bi
       LEFT JOIN ${TABLES.VEHICLE_MAKE_TYPE} m ON m.make_type_id = bi.make_type_id
       LEFT JOIN ${TABLES.VEHICLE_VARIANT} vv ON vv.variant_id = bi.variant_id
       LEFT JOIN ${TABLES.ITEM_NAME} iname ON iname.item_name_id = bi.item_name_id
       LEFT JOIN ${TABLES.ITEM_TRANSACTION} it ON it.bulk_items_id = bi.bulk_items_id
       WHERE bi.received_voucher_id = ?
       GROUP BY bi.bulk_items_id
       ORDER BY bi.bulk_items_id`,
      [voucherId]
    );
  }

  async createBulkItem(data: Record<string, unknown>): Promise<number> {
    return this.insertRecord(
      `INSERT INTO ${TABLES.BULK_ITEMS}
       (received_voucher_id, make_type_id, variant_id, item_name_id, is_common,
        total_quantity, item_price, total_price, received_from, created_by, created_on)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      this.buildParams([
        data.received_voucher_id,
        data.make_type_id ?? null,
        data.variant_id ?? null,
        data.item_name_id,
        data.is_common ?? 0,
        data.total_quantity,
        data.item_price,
        data.total_price,
        data.received_from,
        data.created_by,
        data.created_on,
      ])
    );
  }

  async bulkItemExists(
    receivedVoucherId: number,
    makeTypeId: number | null,
    variantId: number | null,
    itemNameId: number
  ): Promise<boolean> {
    const row = await this.selectOne<RowDataPacket>(
      `SELECT bulk_items_id
       FROM ${TABLES.BULK_ITEMS}
       WHERE received_voucher_id = ?
         AND (
           (make_type_id IS NULL AND ? IS NULL) OR
           make_type_id = ?
         )
         AND (
           (variant_id IS NULL AND ? IS NULL) OR
           variant_id = ?
         )
         AND item_name_id = ?`,
      [receivedVoucherId, makeTypeId, makeTypeId, variantId, variantId, itemNameId]
    );
    return row !== null;
  }

  async getBulkItemById(bulkItemsId: number): Promise<BulkItemRow | null> {
    return this.selectOne<BulkItemRow>(
      `SELECT * FROM ${TABLES.BULK_ITEMS} WHERE bulk_items_id = ?`,
      [bulkItemsId]
    );
  }

  async getItemTransactionByBulkItemId(bulkItemsId: number): Promise<RowDataPacket | null> {
    return this.selectOne<RowDataPacket>(
      `SELECT * FROM ${TABLES.ITEM_TRANSACTION} WHERE bulk_items_id = ?`,
      [bulkItemsId]
    );
  }

  async countItemsByBulkItemId(bulkItemsId: number): Promise<number> {
    const row = await this.selectOne<RowDataPacket>(
      `SELECT COUNT(*) AS total FROM ${TABLES.ITEM_INVENTORY} WHERE bulk_items_id = ?`,
      [bulkItemsId]
    );
    return Number(row?.total ?? 0);
  }

  async insertItemTransaction(data: Record<string, unknown>): Promise<number> {
    return this.insertRecord(
      `INSERT INTO ${TABLES.ITEM_TRANSACTION}
       (bulk_items_id, total_quantity, received_quantity, added_item_quantity, is_common, item_price, received_date, created_by, created_on)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      this.buildParams([
        data.bulk_items_id,
        data.total_quantity,
        data.received_quantity,
        data.added_item_quantity,
        data.is_common ?? 0,
        data.item_price,
        data.received_date,
        data.created_by,
        data.created_on,
      ])
    );
  }

  async updateItemTransaction(itemTransactionId: number, data: Record<string, unknown>): Promise<void> {
    const fields = Object.keys(data).map((k) => `${k} = ?`).join(", ");
    await this.executeUpdate(
      `UPDATE ${TABLES.ITEM_TRANSACTION} SET ${fields} WHERE item_transaction_id = ?`,
      this.buildParams([...Object.values(data), itemTransactionId])
    );
  }

  async getMainInventory(
    makeTypeId: number | null,
    variantId: number | null,
    itemNameId: number
  ): Promise<RowDataPacket | null> {
    return this.selectOne<RowDataPacket>(
      `SELECT * FROM ${TABLES.INVENTORY}
       WHERE (
         (make_type_id IS NULL AND ? IS NULL) OR
         make_type_id = ?
       )
       AND (
         (variant_id IS NULL AND ? IS NULL) OR
         variant_id = ?
       )
       AND item_name_id = ?`,
      [makeTypeId, makeTypeId, variantId, variantId, itemNameId]
    );
  }

  async insertMainInventory(data: Record<string, unknown>): Promise<number> {
    // Columns are NOT NULL — common parts must use 0, never SQL NULL
    const makeTypeId = Number(data.make_type_id ?? 0);
    const variantId = Number(data.variant_id ?? 0);
    return this.insertRecord(
      `INSERT INTO ${TABLES.INVENTORY}
       (bulk_items_id, make_type_id, variant_id, item_name_id, is_common, total_quantity, available_quantity, item_price, status, created_by, created_on)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      this.buildParams([
        data.bulk_items_id,
        Number.isFinite(makeTypeId) ? makeTypeId : 0,
        Number.isFinite(variantId) ? variantId : 0,
        data.item_name_id,
        data.is_common ?? 0,
        data.total_quantity,
        data.available_quantity,
        data.item_price,
        data.status ?? "Active",
        data.created_by,
        data.created_on,
      ])
    );
  }

  async updateMainInventory(inventoryId: number, data: Record<string, unknown>): Promise<void> {
    const fields = Object.keys(data).map((k) => `${k} = ?`).join(", ");
    await this.executeUpdate(
      `UPDATE ${TABLES.INVENTORY} SET ${fields} WHERE inventory_id = ?`,
      this.buildParams([...Object.values(data), inventoryId])
    );
  }

  async insertSingleItem(data: Record<string, unknown>): Promise<number> {
    const makeTypeId = Number(data.make_type_id ?? 0);
    const variantId = Number(data.variant_id ?? 0);
    return this.insertRecord(
      `INSERT INTO ${TABLES.ITEM_INVENTORY}
       (bulk_items_id, make_type_id, variant_id, item_name_id, is_common, item_price, status, created_by, created_on)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      this.buildParams([
        data.bulk_items_id,
        Number.isFinite(makeTypeId) ? makeTypeId : 0,
        Number.isFinite(variantId) ? variantId : 0,
        data.item_name_id,
        data.is_common ?? 0,
        data.item_price,
        data.status ?? "Active",
        data.created_by,
        data.created_on,
      ])
    );
  }

  async updateItemBarcode(
    itemInventoryId: number,
    data: {
      barcode_number: string;
      barcode_image: string;
      make_type_id: number;
      variant_id: number;
      item_name_id: number;
      updated_by: number;
      updated_on: string;
    }
  ): Promise<void> {
    const makeTypeId = Number.isFinite(data.make_type_id) ? data.make_type_id : 0;
    const variantId = Number.isFinite(data.variant_id) ? data.variant_id : 0;
    await this.executeUpdate(
      `UPDATE ${TABLES.ITEM_INVENTORY}
       SET barcode_number = ?,
           barcode_image = ?,
           make_type_id = ?,
           variant_id = ?,
           item_name_id = ?,
           updated_by = ?,
           updated_on = ?
       WHERE item_inventory_id = ?`,
      [
        data.barcode_number,
        data.barcode_image,
        makeTypeId,
        variantId,
        data.item_name_id,
        data.updated_by,
        data.updated_on,
        itemInventoryId,
      ]
    );
  }

  async getItemInventoryById(itemInventoryId: number): Promise<RowDataPacket | null> {
    return this.selectOne<RowDataPacket>(
      `SELECT * FROM ${TABLES.ITEM_INVENTORY} WHERE item_inventory_id = ?`,
      [itemInventoryId]
    );
  }

  async isItemInventoryAllocated(itemInventoryId: number): Promise<boolean> {
    const row = await this.selectOne<RowDataPacket>(
      `SELECT vehicle_allocated_item_id
       FROM ${TABLES.VEHICLE_ALLOCATED_ITEMS}
       WHERE item_inventory_id = ?
       LIMIT 1`,
      [itemInventoryId]
    );
    return Boolean(row);
  }

  async deleteItemInventoryById(itemInventoryId: number): Promise<void> {
    await this.executeDelete(
      `DELETE FROM ${TABLES.ITEM_INVENTORY} WHERE item_inventory_id = ?`,
      [itemInventoryId]
    );
  }

  async getItemsByBulkItemId(bulkItemsId: number): Promise<RowDataPacket[]> {
    return this.selectAll<RowDataPacket>(
      `SELECT ii.*,
              m.make_type AS make_type_name,
              vv.variant_name,
              iname.item_name
       FROM ${TABLES.ITEM_INVENTORY} ii
       LEFT JOIN ${TABLES.VEHICLE_MAKE_TYPE} m ON m.make_type_id = ii.make_type_id
       LEFT JOIN ${TABLES.VEHICLE_VARIANT} vv ON vv.variant_id = ii.variant_id
       LEFT JOIN ${TABLES.ITEM_NAME} iname ON iname.item_name_id = ii.item_name_id
       WHERE ii.bulk_items_id = ?
       ORDER BY ii.item_inventory_id DESC`,
      [bulkItemsId]
    );
  }

  async getBulkItemDetails(bulkItemsId: number): Promise<BulkItemRow | null> {
    return this.selectOne<BulkItemRow>(
      `SELECT bi.*,
              m.make_type AS make_type_name,
              vv.variant_name,
              iname.item_name,
              COALESCE(
                (SELECT COUNT(*)
                 FROM ${TABLES.ITEM_INVENTORY} ii
                 WHERE ii.bulk_items_id = bi.bulk_items_id),
                0
              ) AS received_quantity
       FROM ${TABLES.BULK_ITEMS} bi
       LEFT JOIN ${TABLES.VEHICLE_MAKE_TYPE} m ON m.make_type_id = bi.make_type_id
       LEFT JOIN ${TABLES.VEHICLE_VARIANT} vv ON vv.variant_id = bi.variant_id
       LEFT JOIN ${TABLES.ITEM_NAME} iname ON iname.item_name_id = bi.item_name_id
       WHERE bi.bulk_items_id = ?`,
      [bulkItemsId]
    );
  }

  // Stock — mirrors CI4 Inventory_management_library::get_total_stock()
  async getTotalStock(
    makeTypeId?: number | null,
    variantId?: number | null,
    itemNameId?: number | null
  ): Promise<StockRow[]> {
    const i = TABLES.INVENTORY;
    const m = TABLES.VEHICLE_MAKE_TYPE;
    const vv = TABLES.VEHICLE_VARIANT;
    const iname = TABLES.ITEM_NAME;
    const bi = TABLES.BULK_ITEMS;
    const it = TABLES.ITEM_TRANSACTION;

    const where: string[] = [];
    const params: Array<number> = [];
    if (makeTypeId) {
      where.push(`i.make_type_id = ?`);
      params.push(makeTypeId);
    }
    if (variantId) {
      where.push(`i.variant_id = ?`);
      params.push(variantId);
    }
    if (itemNameId) {
      where.push(`i.item_name_id = ?`);
      params.push(itemNameId);
    }
    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    return this.selectAll<StockRow>(
      `SELECT
         i.inventory_id,
         i.available_quantity,
         i.total_quantity AS master_total_quantity,
         i.is_common,
         m.make_type_id,
         m.make_type AS make_type_name,
         vv.variant_id,
         vv.variant_name,
         iname.item_name_id,
         iname.item_name,
         CASE
           WHEN i.is_common = 1 THEN (
             SELECT COALESCE(SUM(total_quantity), 0)
             FROM ${bi}
             WHERE is_common = 1
               AND item_name_id = i.item_name_id
           )
           ELSE (
             SELECT COALESCE(SUM(total_quantity), 0)
             FROM ${bi}
             WHERE make_type_id = i.make_type_id
               AND variant_id = i.variant_id
               AND item_name_id = i.item_name_id
               AND is_common = 0
           )
         END AS total_sanctioned_quantity,
         CASE
           WHEN i.is_common = 1 THEN (
             (
               SELECT COALESCE(SUM(total_quantity), 0)
               FROM ${bi}
               WHERE is_common = 1
                 AND item_name_id = i.item_name_id
             )
             -
             (
               SELECT COALESCE(SUM(received_quantity), 0)
               FROM ${it} tx
               JOIN ${bi} bulk ON bulk.bulk_items_id = tx.bulk_items_id
               WHERE bulk.is_common = 1
                 AND bulk.item_name_id = i.item_name_id
             )
           )
           ELSE (
             (
               SELECT COALESCE(SUM(total_quantity), 0)
               FROM ${bi}
               WHERE make_type_id = i.make_type_id
                 AND variant_id = i.variant_id
                 AND item_name_id = i.item_name_id
                 AND is_common = 0
             )
             -
             (
               SELECT COALESCE(SUM(received_quantity), 0)
               FROM ${it} tx
               JOIN ${bi} bulk ON bulk.bulk_items_id = tx.bulk_items_id
               WHERE bulk.make_type_id = i.make_type_id
                 AND bulk.variant_id = i.variant_id
                 AND bulk.item_name_id = i.item_name_id
                 AND bulk.is_common = 0
             )
           )
         END AS pending_quantity,
         (
           CASE
             WHEN i.is_common = 1 THEN (
               SELECT COALESCE(SUM(received_quantity), 0)
               FROM ${it} tx
               JOIN ${bi} bulk ON bulk.bulk_items_id = tx.bulk_items_id
               WHERE bulk.is_common = 1
                 AND bulk.item_name_id = i.item_name_id
             )
             ELSE (
               SELECT COALESCE(SUM(received_quantity), 0)
               FROM ${it} tx
               JOIN ${bi} bulk ON bulk.bulk_items_id = tx.bulk_items_id
               WHERE bulk.make_type_id = i.make_type_id
                 AND bulk.variant_id = i.variant_id
                 AND bulk.item_name_id = i.item_name_id
                 AND bulk.is_common = 0
             )
           END
         ) AS received_quantity
       FROM ${i} i
       LEFT JOIN ${m} m ON m.make_type_id = i.make_type_id
       LEFT JOIN ${vv} vv ON vv.variant_id = i.variant_id
       LEFT JOIN ${iname} iname ON iname.item_name_id = i.item_name_id
       ${whereSql}
       GROUP BY i.inventory_id, m.make_type_id, vv.variant_id, iname.item_name_id
       ORDER BY iname.item_name`,
      params
    );
  }

  async getTotalAvailableQuantity(): Promise<number> {
    const row = await this.selectOne<SumRow>(
      `SELECT COALESCE(SUM(available_quantity), 0) as total FROM ${TABLES.INVENTORY}`
    );
    return Number(row?.total ?? 0);
  }
}

export const inventoryRepository = new InventoryRepository();
