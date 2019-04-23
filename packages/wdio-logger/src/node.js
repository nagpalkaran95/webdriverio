import fs from 'fs'
import log from 'loglevel'
import util from 'util'
import chalk from 'chalk'
import prefix from 'loglevel-plugin-prefix'
import ansiStrip from 'strip-ansi'

const DEFAULT_LEVEL = 0
const COLORS = {
    error: 'red',
    warn: 'yellow',
    info: 'cyanBright',
    debug: 'green',
    trace: 'cyan'
}

const matches = {
    COMMAND: 'COMMAND',
    DATA: 'DATA',
    RESULT: 'RESULT'
}

const SERIALIZERS = [{
    /**
     * display error stack
     */
    matches: (err) => err instanceof Error,
    serialize: (err) => err.stack
}, {
    /**
     * color commands blue
     */
    matches: (log) => log === matches.COMMAND,
    serialize: (log) => chalk.magenta(log)
}, {
    /**
     * color data yellow
     */
    matches: (log) => log === matches.DATA,
    serialize: (log) => chalk.yellow(log)
}, {
    /**
     * color result cyan
     */
    matches: (log) => log === matches.RESULT,
    serialize: (log) => chalk.cyan(log)
}]

const loggers = {}
let logLevelsConfig = {}
const logCache = new Set()
let logFile

const originalFactory = log.methodFactory
log.methodFactory = function (methodName, logLevel, loggerName) {
    const rawMethod = originalFactory(methodName, logLevel, loggerName)
    return (...args) => {
        /**
         * create logFile lazily
         */
        if (!logFile && process.env.WDIO_LOG_PATH) {
            logFile = fs.createWriteStream(process.env.WDIO_LOG_PATH)
        }

        /**
         * split `prefixer: value` sting to `prefixer: ` and `value`
         * so that SERIALIZERS can match certain string
         */
        const match = Object.values(matches).filter(x => args[0].endsWith(`: ${x}`))[0]
        if (match) {
            const prefixStr = args.shift().slice(0, -match.length - 1)
            args.unshift(prefixStr, match)
        }

        args = args.map((arg) => {
            for (const s of SERIALIZERS) {
                if (s.matches(arg)) {
                    return s.serialize(arg)
                }
            }
            return arg
        })

        const logText = ansiStrip(`${util.format.apply(this, args)}\n`)
        if (logFile) {
            /**
             * empty logging cache if stuff got logged before
             */
            if (logCache.size) {
                logCache.forEach((log) => logFile.write(log))
                logCache.clear()
            }

            return logFile.write(logText)
        }

        logCache.add(logText)
        rawMethod(...args)
    }
}

prefix.apply(log, {
    template: '%t %l %n:',
    timestampFormatter: (date) => chalk.gray(date.toISOString()),
    levelFormatter: (level) => chalk[COLORS[level]](level.toUpperCase()),
    nameFormatter: (name) => chalk.whiteBright(name)
})

export default function getLogger (name) {
    /**
     * check if logger was already initiated
     */
    if (loggers[name]) {
        return loggers[name]
    }

    let logLevel = process.env.WDIO_LOG_LEVEL || DEFAULT_LEVEL
    const logLevelName = getLogLevelName(name)
    if (logLevelsConfig[logLevelName]) {
        logLevel = logLevelsConfig[logLevelName]
    }

    loggers[name] = log.getLogger(name)
    loggers[name].setLevel(logLevel)
    return loggers[name]
}

getLogger.setLevel = (name, level) => loggers[name].setLevel(level)
getLogger.setLogLevelsConfig = (logLevels = {}) => {
    logLevelsConfig = {}

    Object.keys(logLevels).forEach(loggerName => {
        const logLevelName = getLogLevelName(loggerName)
        logLevelsConfig[logLevelName] = logLevels[loggerName]
    })

    Object.keys(loggers).forEach(loggerName => {
        const logLevelName = getLogLevelName(loggerName)

        if (logLevelsConfig[logLevelName] !== undefined) {
            loggers[loggerName].setLevel(logLevelsConfig[logLevelName])
        }
    })
}
const getLogLevelName = (logName) => logName.split(':').shift()
