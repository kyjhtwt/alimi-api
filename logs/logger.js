const winston = require('winston');
require('winston-daily-rotate-file');
const { combine, timestamp, printf, splat } = winston.format;

const customFormat = printf(info => {
    return `${info.timestamp} ${info.level}: ${info.message}`;
});

const logger = winston.createLogger({
    format: combine(
        timestamp({
            format: 'YYYY-MM-DD HH:mm:ss',
        }),
        customFormat,
        splat()
    ),
    transports: [

        new winston.transports.DailyRotateFile({
            level: 'info',
            datePattern: 'YYYY-MM-DD',
            dirname: './logs',
            filename: `conbined.log`,
            maxSize: '20m',
            maxFiles: '3d',
            zippedArchive: true,
        }),
        new winston.transports.DailyRotateFile({
            level: 'error',
            datePattern: 'YYYY-MM-DD',
            dirname: '../logs',
            filename: `server_%DATE%.error.log`,
            maxSize: '20m',
            maxFiles: '7d',
            zippedArchive: true,
        }),
    ],
});


if (process.env.NODE_ENV !== 'production') {
    logger.add(
      new winston.transports.Console({
        format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
      }),
    );
  }

module.exports = { logger };