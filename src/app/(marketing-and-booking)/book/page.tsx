import { redirect } from "next/navigation";

interface LegacyBookPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/**
 * Backward compatibility redirect:
 * Redirects legacy `/book?...` search requests to `/ferries?...` preserving all query parameters.
 */
export default async function LegacyBookPage({ searchParams }: LegacyBookPageProps) {
  const resolvedParams = await searchParams;
  const query = new URLSearchParams();

  if (resolvedParams) {
    for (const [key, value] of Object.entries(resolvedParams)) {
      if (typeof value === "string") {
        query.set(key, value);
      } else if (Array.isArray(value)) {
        for (const item of value) {
          query.append(key, item);
        }
      }
    }
  }

  const queryString = query.toString();
  redirect(`/ferries${queryString ? `?${queryString}` : ""}`);
}
