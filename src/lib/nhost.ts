import { createClient } from "@nhost/nhost-js";

// Uses Astro's environment variables (PUBLIC_ prefixed variables are available in the client)
export const nhost = createClient({
  subdomain: import.meta.env.PUBLIC_NHOST_SUBDOMAIN || "xxxx-yyyy-zzzz",
  region: import.meta.env.PUBLIC_NHOST_REGION || "us-east-1",
});
