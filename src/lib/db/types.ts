import type { RowDataPacket } from "mysql2/promise";

export interface CountRow extends RowDataPacket {
  count: number;
}

export interface SumRow extends RowDataPacket {
  total: number;
}
