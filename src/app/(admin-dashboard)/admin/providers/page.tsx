import { redirect } from "next/navigation";

export default function AdminProvidersRedirect() {
  redirect("/dashboard/admin/operators");
}
