import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL(".", import.meta.url)) } },
  test: { env: { NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co" } },
});
