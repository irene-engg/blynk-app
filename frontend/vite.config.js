import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: process.env.VITE_BACKEND_URL || "http://backend-alb-221559160.ca-central-1.elb.amazonaws.com:5000", // Fallback for development
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
