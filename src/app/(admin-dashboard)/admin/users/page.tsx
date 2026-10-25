import { redirect } from "next/navigation";

export default function AdminUsersRedirect() {
  redirect("/dashboard/admin/users");
}
