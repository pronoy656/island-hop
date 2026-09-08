import { AVAILABLE_FERRIES } from "./ferries";
import { POPULAR_ROUTES } from "./routes";

/**
 * Dynamically extract unique ports from ferries & routes datasets
 */
export function getUniquePorts(): string[] {
  const set = new Set<string>();

  AVAILABLE_FERRIES.forEach((f) => {
    if (f.departurePort) set.add(f.departurePort);
    if (f.arrivalPort) set.add(f.arrivalPort);
  });

  POPULAR_ROUTES.forEach((r) => {
    if (r.from) set.add(r.from);
    if (r.to) set.add(r.to);
  });

  return Array.from(set).sort();
}
