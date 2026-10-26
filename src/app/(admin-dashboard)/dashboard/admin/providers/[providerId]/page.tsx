import { redirect } from "next/navigation";

interface ProviderDetailPageProps {
  params: Promise<{
    providerId: string;
  }>;
}

export default async function ProviderDetailRedirectPage({
  params
}: ProviderDetailPageProps) {
  const { providerId } = await params;
  redirect(`/dashboard/admin/operators/${providerId}`);
}
