import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: process.env.GITHUB_ACTIONS === "true" ? "/RMA1/" : "/",
  plugins: [react()],
  test: {
    environment: "jsdom",
    restoreMocks: true,
    setupFiles: ["./src/testSetup.ts"],
  },
});
