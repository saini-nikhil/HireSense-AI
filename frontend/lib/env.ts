type PublicEnv = {
  NEXT_PUBLIC_BACKEND_URL?: string;
};

type ServerEnv = PublicEnv & {
  BACKEND_URL?: string;
  GROQ_API_KEY?: string;
};

function isServer() {
  return typeof window === "undefined";
}

export function getBackendBaseUrl() {
  const env = process.env as ServerEnv;

  const value =
    (isServer() ? env.BACKEND_URL : undefined) ?? env.NEXT_PUBLIC_BACKEND_URL;

  if (value) return value.replace(/\/+$/, "");

  if (process.env.NODE_ENV !== "production") return "http://localhost:3001";

  throw new Error(
    "Missing backend URL. Set BACKEND_URL (server) and NEXT_PUBLIC_BACKEND_URL (client).",
  );
}

export function getGoogleOAuthUrl() {
  return `${getBackendBaseUrl()}/auth/google`;
}

export function getGroqApiKey() {
  const key = process.env.GROQ_API_KEY;

  if (!key) {
    throw new Error("GROQ_API_KEY is not set");
  }

  return key;
}
