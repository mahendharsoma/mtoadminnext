import { StreamPage } from "@/components/shared/stream-page";
import { userRepository } from "@/lib/db/repositories/user.repository";
import { UsersClient } from "@/components/users/users-client";

export default function UsersPage() {
  return (
    <StreamPage>
      <UsersPageContent />
    </StreamPage>
  );
}

async function UsersPageContent() {
  const [users, roles] = await Promise.all([
    userRepository.findAll(),
    userRepository.getAllRoles(),
  ]);

  return <UsersClient users={users} roles={roles} />;
}