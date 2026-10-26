import type { Metadata } from "next";
import { ProviderDetailsView } from "@/widgets";

interface OperatorDetailPageProps {
  params: Promise<{
    providerId: string;
  }>;
}

export async function generateMetadata({
  params
}: OperatorDetailPageProps): Promise<Metadata> {
  const { providerId } = await params;
  return {
    title: `Operator Details (${providerId}) | FerryGo Admin`,
    description: "Manage operator fleet, route schedules, revenue splits, and account status."
  };
}

export default async function OperatorDetailPage({
  params
}: OperatorDetailPageProps) {
  const { providerId } = await params;
  return <ProviderDetailsView providerId={providerId} />;
}
