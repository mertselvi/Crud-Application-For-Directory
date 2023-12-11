const winston = require('winston');

const loggerSchema = winston.createLogger(
    {
    level : 'info',
    format : winston.format.combine (winston.format.timestamp(),winston.format.json()),
    transports : [
        new winston.transports.Console(),
        new winston.transports.File({filename:'info.log'}),
    ]
    },
    {
        level : 'error',
        format : winston.format.combine (winston.format.timestamp(),winston.format.json()),
    
        transports : [
            new winston.transports.Console(),
            new winston.transports.File({filename:'error.log'}),
        ]
        }
    )

module.exports = {loggerSchema};