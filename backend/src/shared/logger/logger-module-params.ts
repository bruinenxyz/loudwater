import { LoggerModuleAsyncParams } from "nestjs-pino";
import { Level } from "pino";

import { ConfigModule, ConfigService } from "@nestjs/config";

import { HEADER } from "../constant/request";

const loggerModuleParams: LoggerModuleAsyncParams = {
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => ({
    pinoHttp: {
      level: configService.get<Level>("logLvl"),
      transport:
        configService.get<string>("nodeEnv") !== "production"
          ? {
              target: "pino-pretty",
              options: {
                singleLine: true,
                colorize: true,
                colorizeObjects: true,
                messageFormat:
                  "url:{req.method} {req.url} - {if res.statusCode}responseStatus:{res.statusCode}: {end}{msg}",
              },
            }
          : undefined,
      formatters: {
        level: (label: string) => ({ level: label }),
      },
      genReqId: (req) => req.headers[HEADER.X_REQUEST_ID] as string,
      serializers: {
        req(req) {
          const redactedReq = {
            id: req.id,
            method: req.method,
            url: req.url,
            query: req.query,
            params: req.param,
            headers: {},
            remoteAddress: req.remoteAddress,
            remotePort: req.remotePort,
            body: {},
          };
          for (const header in req.headers) {
            if (HEADER.REDACTEDS.includes(header)) {
              redactedReq.headers[header] = HEADER.REDACTED;
            } else {
              redactedReq.headers[header] = req.headers[header];
            }
          }
          const logLvl = configService.get<Level>("logLvl");
          if (logLvl === "debug" || logLvl === "trace") {
            redactedReq.body = req.raw.body;
          }
          return redactedReq;
        },
      },
      customReceivedMessage: (req) => {
        return "Request received: " + req.headers[HEADER.X_REQUEST_ID];
      },
      customSuccessMessage: (_req, res) => {
        return "Request completed: " + res.req.headers[HEADER.X_REQUEST_ID];
      },
      customErrorMessage: (_error, res) => {
        return "Request errored: " + res.req.headers[HEADER.X_REQUEST_ID];
      },
    },
  }),
};

export default loggerModuleParams;
