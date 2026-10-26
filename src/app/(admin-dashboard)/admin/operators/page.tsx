import { redirect } from "next/navigation";

export default function AdminOperatorsRedirect() {
  redirect("/dashboard/admin/operators");
}
