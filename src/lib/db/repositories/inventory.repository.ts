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
  make_type_name: string | null;
  variant_name: string | null;
  item_name: string;
  total_sanctioned_quantity: number;
  total_pending_quantity: number;
  total_received_quantity: number;
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
      `SELECT * FROM ${TABLES.ITEM_NAME} ORDER BY item_name`
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
      `SELECT * FROM ${TABLES.VENDORS} ORDER BY vendor_name`
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
    const fields = Object.keys(data).map((k) => `${k} = ?`).join(", ");
    await this.executeUpdate(
      `UPDATE ${TABLES.VENDORS} SET ${fields} WHERE vendor_id = ?`,
      this.buildParams([...Object.values(data), id])
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
    return this.insertRecord(
      `INSERT INTO ${TABLES.INVENTORY}
       (bulk_items_id, make_type_id, variant_id, item_name_id, is_common, total_quantity, available_quantity, item_price, status, created_by, created_on)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      this.buildParams([
        data.bulk_items_id,
        data.make_type_id ?? null,
        data.variant_id ?? null,
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
    return this.insertRecord(
      `INSERT INTO ${TABLES.ITEM_INVENTORY}
       (bulk_items_id, make_type_id, variant_id, item_name_id, is_common, item_price, status, created_by, created_on)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      this.buildParams([
        data.bulk_items_id,
        data.make_type_id ?? null,
        data.variant_id ?? null,
        data.item_name_id,
        data.is_common ?? 0,
        data.item_price,
        data.status ?? "Active",
        data.created_by,
        data.created_on,
      ])
    );
  }

  // Stock
  async getTotalStock(
    makeTypeId?: number | null,
    variantId?: number | null,
    itemNameId?: number | null
  ): Promise<StockRow[]> {
    const where: string[] = [];
    const params: Array<number> = [];
    if (makeTypeId) {
      where.push("i.make_type_id = ?");
      params.push(makeTypeId);
    }
    if (variantId) {
      where.push("i.variant_id = ?");
      params.push(variantId);
    }
    if (itemNameId) {
      where.push("i.item_name_id = ?");
      params.push(itemNameId);
    }
    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    return this.selectAll<StockRow>(
      `SELECT
         i.inventory_id,
         i.make_type_id,
         i.variant_id,
         i.item_name_id,
         m.make_type AS make_type_name,
         vv.variant_name,
         iname.item_name,
         COALESCE(CAST(bi.total_quantity AS SIGNED), i.total_quantity, 0) AS total_sanctioned_quantity,
         COALESCE(it.received_quantity, COALESCE(CAST(bi.total_quantity AS SIGNED), i.total_quantity, 0)) AS total_received_quantity,
         GREATEST(
           COALESCE(CAST(bi.total_quantity AS SIGNED), i.total_quantity, 0) -
           COALESCE(it.received_quantity, COALESCE(CAST(bi.total_quantity AS SIGNED), i.total_quantity, 0)),
           0
         ) AS total_pending_quantity,
         i.available_quantity
       FROM ${TABLES.INVENTORY} i
       LEFT JOIN ${TABLES.BULK_ITEMS} bi ON bi.bulk_items_id = i.bulk_items_id
       LEFT JOIN ${TABLES.ITEM_TRANSACTION} it ON it.bulk_items_id = i.bulk_items_id
       LEFT JOIN ${TABLES.VEHICLE_MAKE_TYPE} m ON m.make_type_id = i.make_type_id
       LEFT JOIN ${TABLES.VEHICLE_VARIANT} vv ON vv.variant_id = i.variant_id
       LEFT JOIN ${TABLES.ITEM_NAME} iname ON iname.item_name_id = i.item_name_id
       ${whereSql}
       ORDER BY iname.item_name`
      ,
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
