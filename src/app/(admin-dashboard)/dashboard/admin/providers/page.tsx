import { redirect } from "next/navigation";

export default function AdminProvidersRedirectPage() {
  redirect("/dashboard/admin/operators");
}
