const { Transform } = require(`stream`)
const { red, yellow, bold, green, dim } = require(`chalk`)
const noop = () => {}

const stringify = require(`./stringify`)
const format = require(`./format`)
const _ = require(`../l10n`)

const prefixes = {
  log: `       `,
  info: green.bold(`INFO:  `),
  warn: yellow.bold(`WARN:  `),
  error: red.bold(`ERROR: `),
  debug: bold(`DEBUG: `)
}

/**
 * Format args and output them in tty
 *
 * @param {WriteStream} tty A TTY writable stream
 * @param {string} prefix A prefix to add to the formated output string
 * @param {boolean} overwrite Indicate if the string should overwrite the last one
 * @param {...any} args The args to log
 */
function log (tty, prefix, overwrite, ...args) {
  const length = tty.columns || 80

  const lines = format(args
    .reduce((arr, val) => [...arr, stringify(val)], [])
    .join(`\n`), prefix, length)

  if (overwrite) {
    tty.clearLine(0)
    tty.cursorTo(0)
  }

  lines.forEach(line => {
    tty.write(`${line}${overwrite ? ` ` : `\n`}`)
  })
}

function streamLog (tty, prefix, debug) {
  const length = tty.columns || 80
  let count = 0

  return new Transform({
    transform (chunck, enc, next) {
      if (debug) {
        format(String(chunck), prefix, length).forEach(line => this.push(dim(line + `\n`)))
        return next()
      }

      tty.clearLine(0)
      tty.cursorTo(0)
      next(null, `${prefix}${_(`Operations in progress: %s`, count += 1)}`)
    }
  })
}

class NoopStream extends Transform {
  constructor () {
    super({
      transform: noop
    })
  }
}

const logger = (overwrite) => (opt) => {
  return {
    log: opt.verbose || opt.debug ? log.bind(null, process.stdout, prefixes.log, overwrite) : noop,
    info: opt.verbose || opt.debug ? log.bind(null, process.stdout, prefixes.info, overwrite) : noop,
    warn: opt.verbose || opt.debug ? log.bind(null, process.stdout, prefixes.warn, overwrite) : noop,
    error: opt.verbose || opt.debug ? log.bind(null, process.stderr, prefixes.error, overwrite) : noop,
    debug: opt.debug ? log.bind(null, process.stdout, prefixes.debug, overwrite) : noop,
    nl: () => { process.stdout.write(`\n`) }
  }
}

const transformer = (opt) => {
  return {
    log: opt.verbose || opt.debug ? streamLog.bind(null, process.stdout, prefixes.log, opt.debug)() : new NoopStream(),
    info: opt.verbose || opt.debug ? streamLog.bind(null, process.stdout, prefixes.info, opt.debug)() : new NoopStream(),
    warn: opt.verbose || opt.debug ? streamLog.bind(null, process.stdout, prefixes.warn, opt.debug)() : new NoopStream(),
    error: opt.verbose || opt.debug ? streamLog.bind(null, process.stderr, prefixes.error, opt.debug)() : new NoopStream(),
    debug: opt.debug ? streamLog.bind(null, process.stdout, prefixes.debug, opt.debug)() : new NoopStream()
  }
}

module.exports = { logger: logger(false), overwrite: logger(true), transformer }