import type { Metadata } from "next";
import { ProviderDetailsView } from "@/widgets";

interface ProviderDetailPageProps {
  params: Promise<{
    providerId: string;
  }>;
}

export async function generateMetadata({
  params
}: ProviderDetailPageProps): Promise<Metadata> {
  const { providerId } = await params;
  return {
    title: `Provider Details (${providerId}) | FerryGo Admin`,
    description: "Manage provider fleet, route schedules, revenue splits, and account status."
  };
}

export default async function ProviderDetailPage({
  params
}: ProviderDetailPageProps) {
  const { providerId } = await params;
  return <ProviderDetailsView providerId={providerId} />;
}
