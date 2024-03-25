// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://6de844c387d48b97662e3226e96f225d@o4504181531672576.ingest.sentry.io/4506666996596736",

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 1,
  environment: process.env.NEXT_PUBLIC_APP_ENV || "development",

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
});
