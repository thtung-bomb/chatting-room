import type { Config } from "@react-router/dev/config";

export default {
  // Disable SSR for Netlify deployment (SPA mode)
  ssr: false,
  // Base path for the app
  basename: "/",
} satisfies Config;
