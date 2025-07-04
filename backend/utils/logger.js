const fs = require('fs');
const path = require('path');

/**
 * Advanced logging utility with file rotation and structured logging
 */
class Logger {
  constructor() {
    this.logLevels = {
      ERROR: 0,
      WARN: 1,
      INFO: 2,
      DEBUG: 3
    };
    
    this.currentLevel = process.env.LOG_LEVEL || 'INFO';
    this.logDir = path.join(__dirname, '../logs');
    this.maxFileSize = 5 * 1024 * 1024; // 5MB
    this.maxFiles = 5;
    
    this.ensureLogDirectory();
  }

  /**
   * Ensure log directory exists
   */
  ensureLogDirectory() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  /**
   * Get current timestamp
   */
  getTimestamp() {
    return new Date().toISOString();
  }

  /**
   * Get log file path for today
   */
  getLogFilePath() {
    const today = new Date().toISOString().split('T')[0];
    return path.join(this.logDir, `app-${today}.log`);
  }

  /**
   * Rotate log files if needed
   */
  rotateLogFile() {
    const logFile = this.getLogFilePath();
    
    if (fs.existsSync(logFile)) {
      const stats = fs.statSync(logFile);
      
      if (stats.size > this.maxFileSize) {
        // Rotate existing files
        for (let i = this.maxFiles - 1; i > 0; i--) {
          const oldFile = `${logFile}.${i}`;
          const newFile = `${logFile}.${i + 1}`;
          
          if (fs.existsSync(oldFile)) {
            if (i === this.maxFiles - 1) {
              fs.unlinkSync(oldFile);
            } else {
              fs.renameSync(oldFile, newFile);
            }
          }
        }
        
        // Rename current file
        fs.renameSync(logFile, `${logFile}.1`);
      }
    }
  }

  /**
   * Write log entry to file
   */
  writeToFile(level, message, data = null) {
    try {
      this.rotateLogFile();
      
      const logEntry = {
        timestamp: this.getTimestamp(),
        level: level,
        message: message,
        data: data,
        pid: process.pid,
        memory: process.memoryUsage()
      };

      const logLine = JSON.stringify(logEntry) + '\n';
      fs.appendFileSync(this.getLogFilePath(), logLine);
      
    } catch (error) {
      console.error('Error writing to log file:', error);
    }
  }

  /**
   * Format log message for console
   */
  formatConsoleMessage(level, message, data = null) {
    const timestamp = this.getTimestamp();
    const levelColors = {
      ERROR: '\x1b[31m', // Red
      WARN: '\x1b[33m',  // Yellow
      INFO: '\x1b[36m',  // Cyan
      DEBUG: '\x1b[35m'  // Magenta
    };
    const resetColor = '\x1b[0m';
    
    let formattedMessage = `${levelColors[level]}[${level}]${resetColor} ${timestamp} - ${message}`;
    
    if (data) {
      formattedMessage += `\n${JSON.stringify(data, null, 2)}`;
    }
    
    return formattedMessage;
  }

  /**
   * Check if log level should be logged
   */
  shouldLog(level) {
    return this.logLevels[level] <= this.logLevels[this.currentLevel];
  }

  /**
   * Log error message
   */
  error(message, data = null) {
    if (this.shouldLog('ERROR')) {
      const consoleMessage = this.formatConsoleMessage('ERROR', message, data);
      console.error(consoleMessage);
      this.writeToFile('ERROR', message, data);
    }
  }

  /**
   * Log warning message
   */
  warn(message, data = null) {
    if (this.shouldLog('WARN')) {
      const consoleMessage = this.formatConsoleMessage('WARN', message, data);
      console.warn(consoleMessage);
      this.writeToFile('WARN', message, data);
    }
  }

  /**
   * Log info message
   */
  info(message, data = null) {
    if (this.shouldLog('INFO')) {
      const consoleMessage = this.formatConsoleMessage('INFO', message, data);
      console.info(consoleMessage);
      this.writeToFile('INFO', message, data);
    }
  }

  /**
   * Log debug message
   */
  debug(message, data = null) {
    if (this.shouldLog('DEBUG')) {
      const consoleMessage = this.formatConsoleMessage('DEBUG', message, data);
      console.debug(consoleMessage);
      this.writeToFile('DEBUG', message, data);
    }
  }

  /**
   * Log HTTP request
   */
  logRequest(req, res, next) {
    const start = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - start;
      const logData = {
        method: req.method,
        url: req.url,
        status: res.statusCode,
        duration: `${duration}ms`,
        userAgent: req.get('User-Agent'),
        ip: req.ip || req.connection.remoteAddress,
        userId: req.user ? req.user._id : null
      };
      
      if (res.statusCode >= 400) {
        this.error(`${req.method} ${req.url} - ${res.statusCode}`, logData);
      } else {
        this.info(`${req.method} ${req.url} - ${res.statusCode}`, logData);
      }
    });
    
    next();
  }

  /**
   * Log database operation
   */
  logDatabase(operation, collection, duration, data = null) {
    const message = `DB ${operation} on ${collection} - ${duration}ms`;
    this.debug(message, data);
  }

  /**
   * Log authentication event
   */
  logAuth(event, userId, success, details = null) {
    const message = `Auth ${event} - User: ${userId} - Success: ${success}`;
    const data = { userId, success, event, details };
    
    if (success) {
      this.info(message, data);
    } else {
      this.warn(message, data);
    }
  }

  /**
   * Log appointment event
   */
  logAppointment(event, appointmentId, userId, details = null) {
    const message = `Appointment ${event} - ID: ${appointmentId} - User: ${userId}`;
    this.info(message, { appointmentId, userId, event, details });
  }

  /**
   * Get log statistics
   */
  getLogStats() {
    try {
      const logFile = this.getLogFilePath();
      
      if (!fs.existsSync(logFile)) {
        return { error: 'Log file not found' };
      }
      
      const stats = fs.statSync(logFile);
      const content = fs.readFileSync(logFile, 'utf8');
      const lines = content.split('\n').filter(line => line.trim());
      
      const levelCounts = {
        ERROR: 0,
        WARN: 0,
        INFO: 0,
        DEBUG: 0
      };
      
      lines.forEach(line => {
        try {
          const logEntry = JSON.parse(line);
          if (logEntry.level && levelCounts[logEntry.level] !== undefined) {
            levelCounts[logEntry.level]++;
          }
        } catch (e) {
          // Skip invalid JSON lines
        }
      });
      
      return {
        fileSize: stats.size,
        lineCount: lines.length,
        levelCounts,
        lastModified: stats.mtime
      };
      
    } catch (error) {
      return { error: error.message };
    }
  }

  /**
   * Clear old log files
   */
  clearOldLogs(daysToKeep = 30) {
    try {
      const files = fs.readdirSync(this.logDir);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
      
      files.forEach(file => {
        const filePath = path.join(this.logDir, file);
        const stats = fs.statSync(filePath);
        
        if (stats.mtime < cutoffDate) {
          fs.unlinkSync(filePath);
          this.info(`Deleted old log file: ${file}`);
        }
      });
      
    } catch (error) {
      this.error('Error clearing old logs', error);
    }
  }
}

// Create singleton instance
const logger = new Logger();

module.exports = logger; 