export const configurationFactory = () => {
  return {
    nodeEnv: process.env.NODE_ENV || "development",

    appPort: +(process.env.APP_PORT || 3000),
    logLvl: process.env.LOG_LVL || "error",
    allowedCors: process.env.CORS_ALLOWED_ORIGINS || /^(.*)/,

    httpTimeoutInMilliseconds: 100000,
    httpMaxRedirect: 5,

    useAuth: process.env.USE_AUTH === "true",
    credentialSecret: process.env.CREDENTIAL_SECRET || "RfUjXn2r5u8x/A?D",
    orgId: process.env.ORGANIZATION_ID || "default",

    clerkSecretKey: process.env.CLERK_SECRET_KEY,

    segmentWriteKey: process.env.SEGMENT_WRITE_KEY,
  };
};
