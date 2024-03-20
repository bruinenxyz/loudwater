export const configurationFactory = () => {
  // Default postgres values
  let postgresUser = "postgres";
  let postgresPassword = "postgres";
  let postgresHost = "localhost";
  let postgresPort = 5432;
  let postgresDb = "backenddb";

  // If DATABASE_URL is set, use it to override the default postgres values
  if (process.env.DATABASE_URL) {
    const postgresParts = process.env.DATABASE_URL?.split("://")[1].split(":");
    postgresUser = postgresParts[0];
    postgresPassword = postgresParts[1].split("@")[0];
    postgresHost = postgresParts[1].split("@")[1];
    postgresPort = +postgresParts[2].split("/")[0];
    postgresDb = postgresParts[2].split("/")[1].split("?")[0];
  }

  return {
    nodeEnv: process.env.NODE_ENV || "development",

    database: {
      dialect: "postgres",
      username: postgresUser,
      password: postgresPassword,
      host: postgresHost,
      port: postgresPort,
      database: postgresDb,
      logging: process.env.SQL_LOGGING === "true",
      define: {
        underscored: true,
        freezeTableName: true,
      },
    },

    appPort: +(process.env.APP_PORT || 3000),
    logLvl: process.env.LOG_LVL || "error",
    allowedCors: process.env.CORS_ALLOWED_ORIGINS || /^(.*)/,

    httpTimeoutInMilliseconds: 100000,
    httpMaxRedirect: 5,
    useAuth: process.env.USE_AUTH === "true",

    credentialSecret: process.env.CREDENTIAL_SECRET || "RfUjXn2r5u8x/A?D",

    clerkSecretKey: process.env.CLERK_SECRET_KEY,

    segmentWriteKey: process.env.SEGMENT_WRITE_KEY,
  };
};
