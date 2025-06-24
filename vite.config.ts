import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: [
      { find: "@components", replacement: "/src/components" },
      { find: "@utils", replacement: "/src/utils" },
      { find: "@hooks", replacement: "/src/hooks" },
      { find: "@style", replacement: "/src/style" },
      { find: "@", replacement: "/src" },
    ],
  },
});
