import mysql, { type Pool, type PoolConnection, type RowDataPacket } from "mysql2/promise";

/** Supported SQL parameter values for prepared statements */
export type SqlValue = string | number | boolean | Date | null | Buffer;
export type QueryParams = SqlValue[];

export type QueryResult<T> = T extends RowDataPacket ? T[] : T;

declare global {
  // eslint-disable-next-line no-var
  var __mto_mysql_pool__: Pool | undefined;
}

let pool: Pool | null = globalThis.__mto_mysql_pool__ ?? null;

function getPoolConfig(): mysql.PoolOptions {
  const connectionLimit = Number(process.env.DB_CONNECTION_LIMIT ?? 4);
  return {
    host: process.env.DB_HOST ?? "localhost",
    port: Number(process.env.DB_PORT ?? 3306),
    user: process.env.DB_USER ?? "root",
    password: process.env.DB_PASSWORD ?? "",
    database: process.env.DB_NAME ?? "mlkj_mto",
    waitForConnections: true,
    connectionLimit: Number.isFinite(connectionLimit) && connectionLimit > 0 ? connectionLimit : 4,
    maxIdle: 4,
    idleTimeout: 60000,
    queueLimit: 0,
    timezone: "+05:30",
    dateStrings: true,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000,
  };
}

export function getPool(): Pool {
  if (!pool) {
    pool = mysql.createPool(getPoolConfig());
    globalThis.__mto_mysql_pool__ = pool;
  }
  return pool;
}

export async function query<T = RowDataPacket[]>(
  sql: string,
  params: QueryParams = []
): Promise<T> {
  const [rows] = await getPool().execute(sql, params);
  return rows as T;
}

export async function queryOne<T extends RowDataPacket>(
  sql: string,
  params: QueryParams = []
): Promise<T | null> {
  const rows = await query<T[]>(sql, params);
  return rows[0] ?? null;
}

export async function insert(
  sql: string,
  params: QueryParams = []
): Promise<number> {
  const [result] = await getPool().execute(sql, params);
  const insertResult = result as mysql.ResultSetHeader;
  return insertResult.insertId;
}

export async function execute(
  sql: string,
  params: QueryParams = []
): Promise<number> {
  const [result] = await getPool().execute(sql, params);
  const header = result as mysql.ResultSetHeader;
  return header.affectedRows;
}

export async function withTransaction<T>(
  callback: (connection: PoolConnection) => Promise<T>
): Promise<T> {
  const connection = await getPool().getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function transactionQuery<T = RowDataPacket[]>(
  connection: PoolConnection,
  sql: string,
  params: QueryParams = []
): Promise<T> {
  const [rows] = await connection.execute(sql, params);
  return rows as T;
}

export async function transactionInsert(
  connection: PoolConnection,
  sql: string,
  params: QueryParams = []
): Promise<number> {
  const [result] = await connection.execute(sql, params);
  const insertResult = result as mysql.ResultSetHeader;
  return insertResult.insertId;
}

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
    globalThis.__mto_mysql_pool__ = undefined;
  }
}

/** Coerce dynamic values to SQL params */
export function toSqlParams(values: unknown[]): QueryParams {
  return values.map((v) => {
    if (v === undefined) return null;
    if (
      typeof v === "string" ||
      typeof v === "number" ||
      typeof v === "boolean" ||
      v instanceof Date ||
      v === null ||
      Buffer.isBuffer(v)
    ) {
      return v;
    }
    return String(v);
  });
}
