import { getBackendBaseUrl } from "@/lib/env";

export function backendUrl(path: string) {
  const base = getBackendBaseUrl();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalizedPath}`;
}

