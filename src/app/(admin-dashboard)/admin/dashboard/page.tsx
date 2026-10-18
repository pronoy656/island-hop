import { redirect } from "next/navigation";

export default function AdminDashboardRedirect() {
  redirect("/dashboard/admin");
}
