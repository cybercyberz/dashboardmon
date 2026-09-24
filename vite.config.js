import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  // Hanya URL dan publishable key yang disuntikkan ke bundle browser.
  // SUPABASE_SECRET_KEY sengaja tidak pernah dibaca di sini.
  const env = loadEnv(mode, process.cwd(), "SUPABASE_");
  return {
    plugins: [react()],
    define: {
      "import.meta.env.SUPABASE_URL": JSON.stringify(env.SUPABASE_URL ?? ""),
      "import.meta.env.SUPABASE_PUBLISHABLE_KEY": JSON.stringify(env.SUPABASE_PUBLISHABLE_KEY ?? ""),
    },
  };
});
