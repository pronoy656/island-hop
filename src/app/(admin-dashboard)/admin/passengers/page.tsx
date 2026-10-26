import { redirect } from "next/navigation";

export default function AdminPassengersRedirect() {
  redirect("/dashboard/admin/passengers");
}
