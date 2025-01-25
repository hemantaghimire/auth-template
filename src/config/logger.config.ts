import { createLogger, format, transports, Logger } from "winston";
import path from "path";
import fs from "fs";

const { combine, timestamp, printf, json, colorize, label } = format;

const logDir = path.join(path.resolve(), "logs");

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const getLogger = (labelValue: string): Logger => {
  const consoleLogFormat = combine(
    colorize(),
    label({ label: labelValue }),
    timestamp(),
    printf(
      ({ timestamp, level, message, label }) =>
        `${timestamp} [${label}] ${level}: ${message}`
    )
  );

  const fileLogFormat = combine(
    label({ label: labelValue }),
    timestamp(),
    printf(
      ({ timestamp, level, message, label }) =>
        `${timestamp} [${label}] ${level}: ${message}`
    )
  );

  return createLogger({
    level: "info", // default level
    format: combine(
      label({ label: labelValue }),
      timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      json()
    ),
    transports: [
      new transports.Console({
        level: "info",
        format: consoleLogFormat
      }),
      new transports.File({
        filename: path.join(logDir, "error.log"),
        level: "error",
        format: fileLogFormat
      })
    ]
  });
};

export default getLogger;
