import {
  query,
  queryOne,
  insert,
  execute,
  withTransaction,
  transactionQuery,
  transactionInsert,
  toSqlParams,
  type QueryResult,
  type QueryParams,
} from "@/lib/db/database";
import type { PoolConnection, RowDataPacket } from "mysql2/promise";

export abstract class BaseRepository {
  protected async selectAll<T extends RowDataPacket>(
    sql: string,
    params: QueryParams = []
  ): Promise<T[]> {
    return query<T[]>(sql, params);
  }

  protected async selectOne<T extends RowDataPacket>(
    sql: string,
    params: QueryParams = []
  ): Promise<T | null> {
    return queryOne<T>(sql, params);
  }

  protected async insertRecord(
    sql: string,
    params: QueryParams = []
  ): Promise<number> {
    return insert(sql, params);
  }

  protected async executeUpdate(
    sql: string,
    params: QueryParams = []
  ): Promise<number> {
    return execute(sql, params);
  }

  protected async executeDelete(
    sql: string,
    params: QueryParams = []
  ): Promise<number> {
    return execute(sql, params);
  }

  protected async withTransaction<T>(
    callback: (connection: PoolConnection) => Promise<T>
  ): Promise<T> {
    return withTransaction(callback);
  }

  protected async txQuery<T extends RowDataPacket>(
    connection: PoolConnection,
    sql: string,
    params: QueryParams = []
  ): Promise<T[]> {
    return transactionQuery<T[]>(connection, sql, params);
  }

  protected async txInsert(
    connection: PoolConnection,
    sql: string,
    params: QueryParams = []
  ): Promise<number> {
    return transactionInsert(connection, sql, params);
  }

  protected buildParams(values: unknown[]): QueryParams {
    return toSqlParams(values);
  }
}

export type { RowDataPacket, QueryResult };
