/**
 * Simple logger utility for consistent logging
 */
class Logger {
  info(message, ...args) {
    console.log(`ℹ️  [INFO] ${new Date().toISOString()} - ${message}`, ...args);
  }

  error(message, ...args) {
    console.error(`❌ [ERROR] ${new Date().toISOString()} - ${message}`, ...args);
  }

  warn(message, ...args) {
    console.warn(`⚠️  [WARN] ${new Date().toISOString()} - ${message}`, ...args);
  }

  success(message, ...args) {
    console.log(`✅ [SUCCESS] ${new Date().toISOString()} - ${message}`, ...args);
  }

  debug(message, ...args) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`🐛 [DEBUG] ${new Date().toISOString()} - ${message}`, ...args);
    }
  }
}

export default new Logger();
