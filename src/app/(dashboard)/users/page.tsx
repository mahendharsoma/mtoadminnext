import { userRepository } from "@/lib/db/repositories/user.repository";
import { UsersClient } from "@/components/users/users-client";

export default async function UsersPage() {
  const [users, roles] = await Promise.all([
    userRepository.findAll(),
    userRepository.getAllRoles(),
  ]);

  return <UsersClient users={users} roles={roles} />;
}
