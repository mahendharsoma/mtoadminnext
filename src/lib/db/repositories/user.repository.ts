import { BaseRepository } from "@/lib/db/repositories/base.repository";
import { TABLES, ALLOWED_LOGIN_ROLES } from "@/lib/constants";
import type { User, Role } from "@/lib/types";

export class UserRepository extends BaseRepository {
  async findByEmail(email: string): Promise<User | null> {
    return this.selectOne<User>(
      `SELECT u.*, r.role_id, r.role_name
       FROM ${TABLES.USERS} u
       LEFT JOIN ${TABLES.USER_ROLE_MAPPING} urm ON urm.user_id = u.user_id
       LEFT JOIN ${TABLES.ROLES} r ON r.role_id = urm.role_id
       WHERE u.email_id = ? AND u.status = 'Active'`,
      [email]
    );
  }

  async findAll(): Promise<User[]> {
    return this.selectAll<User>(
      `SELECT u.*, r.role_id, r.role_name
       FROM ${TABLES.USERS} u
       LEFT JOIN ${TABLES.USER_ROLE_MAPPING} urm ON urm.user_id = u.user_id
       LEFT JOIN ${TABLES.ROLES} r ON r.role_id = urm.role_id
       ORDER BY u.user_id DESC`
    );
  }

  async findById(userId: number): Promise<User | null> {
    return this.selectOne<User>(
      `SELECT u.*, r.role_id, r.role_name
       FROM ${TABLES.USERS} u
       LEFT JOIN ${TABLES.USER_ROLE_MAPPING} urm ON urm.user_id = u.user_id
       LEFT JOIN ${TABLES.ROLES} r ON r.role_id = urm.role_id
       WHERE u.user_id = ?`,
      [userId]
    );
  }

  async getAllRoles(): Promise<Role[]> {
    return this.selectAll<Role>(
      `SELECT * FROM ${TABLES.ROLES} ORDER BY role_id`
    );
  }

  async emailExists(email: string, excludeUserId?: number): Promise<boolean> {
    const sql = excludeUserId
      ? `SELECT user_id FROM ${TABLES.USERS} WHERE email_id = ? AND user_id != ?`
      : `SELECT user_id FROM ${TABLES.USERS} WHERE email_id = ?`;
    const params = excludeUserId ? [email, excludeUserId] : [email];
    const row = await this.selectOne<User>(sql, params);
    return row !== null;
  }

  async createUser(
    userData: {
      user_name: string;
      email_id: string;
      password: string;
      phone: string;
      created_by: number;
      created_on: string;
    },
    roleId: number
  ): Promise<number> {
    return this.withTransaction(async (conn) => {
      const userId = await this.txInsert(
        conn,
        `INSERT INTO ${TABLES.USERS} (user_name, email_id, password, phone, status, created_by, created_on)
         VALUES (?, ?, ?, ?, 'Active', ?, ?)`,
        [
          userData.user_name,
          userData.email_id,
          userData.password,
          userData.phone,
          userData.created_by,
          userData.created_on,
        ]
      );
      await this.txInsert(
        conn,
        `INSERT INTO ${TABLES.USER_ROLE_MAPPING} (user_id, role_id, created_by, created_on)
         VALUES (?, ?, ?, ?)`,
        [userId, roleId, userData.created_by, userData.created_on]
      );
      return userId;
    });
  }

  async updateUser(
    userId: number,
    data: Record<string, unknown>,
    roleId?: number
  ): Promise<void> {
    await this.withTransaction(async (conn) => {
      const fields = Object.keys(data)
        .map((k) => `${k} = ?`)
        .join(", ");
      const values = this.buildParams([...Object.values(data), userId]);
      await this.txQuery(
        conn,
        `UPDATE ${TABLES.USERS} SET ${fields} WHERE user_id = ?`,
        values
      );
      if (roleId) {
        await this.txQuery(
          conn,
          `UPDATE ${TABLES.USER_ROLE_MAPPING} SET role_id = ? WHERE user_id = ?`,
          [roleId, userId]
        );
      }
    });
  }

  async updateStatus(
    userId: number,
    status: string,
    updatedBy: number,
    updatedOn: string
  ): Promise<void> {
    await this.executeUpdate(
      `UPDATE ${TABLES.USERS} SET status = ?, updated_by = ?, updated_on = ? WHERE user_id = ?`,
      [status, updatedBy, updatedOn, userId]
    );
  }

  async deleteUser(userId: number): Promise<void> {
    await this.withTransaction(async (conn) => {
      await this.txQuery(
        conn,
        `DELETE FROM ${TABLES.USER_ROLE_MAPPING} WHERE user_id = ?`,
        [userId]
      );
      await this.txQuery(conn, `DELETE FROM ${TABLES.USERS} WHERE user_id = ?`, [
        userId,
      ]);
    });
  }

  isAllowedRole(roleName: string | undefined): boolean {
    if (!roleName) return false;
    return (ALLOWED_LOGIN_ROLES as readonly string[]).includes(roleName);
  }
}

export const userRepository = new UserRepository();
