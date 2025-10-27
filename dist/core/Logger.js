export var LogLevel;
(function (LogLevel) {
    LogLevel["Debug"] = "Debug";
    LogLevel["Info"] = "Info";
    LogLevel["Warn"] = "Warn";
    LogLevel["Error"] = "Error";
})(LogLevel || (LogLevel = {}));
/**
 * A singleton Logger class that allows subscribing to log messages.
 * Provides a clean, globally accessible logging interface.
 * Usage: //Logger.Instance.Debug("My debug message");
 */
export class Logger {
    constructor() {
        this.subscribers = [];
        this.messages = [];
        this.config = {
            showInConsole: true,
            showInUI: true,
            maxMessages: 1000,
            enabledLevels: [LogLevel.Debug, LogLevel.Info, LogLevel.Warn, LogLevel.Error],
            enabledCategories: []
        };
        // Private constructor ensures singleton pattern.
    }
    /**
     * Gets the single instance of the Logger.
     */
    static get Instance() {
        if (!Logger._instance) {
            Logger._instance = new Logger();
        }
        return Logger._instance;
    }
    /**
     * Subscribes a callback function to log messages.
     * @param callback The function to call when a new message is logged.
     * @returns An unsubscribe function to remove the subscription.
     */
    subscribe(callback) {
        this.subscribers.push(callback);
        return () => {
            this.subscribers = this.subscribers.filter(sub => sub !== callback);
        };
    }
    /**
     * Configure the logger behavior
     */
    configure(config) {
        this.config = { ...this.config, ...config };
    }
    /**
     * Get current configuration
     */
    getConfig() {
        return { ...this.config };
    }
    /**
     * Get all messages with optional filtering
     */
    getMessages(filter) {
        let filtered = [...this.messages];
        if (filter?.levels) {
            filtered = filtered.filter(msg => filter.levels.includes(msg.level));
        }
        if (filter?.categories) {
            filtered = filtered.filter(msg => msg.category && filter.categories.includes(msg.category));
        }
        if (filter?.searchText) {
            const search = filter.searchText.toLowerCase();
            filtered = filtered.filter(msg => msg.message.toLowerCase().includes(search) ||
                (msg.category && msg.category.toLowerCase().includes(search)));
        }
        if (filter?.startTime) {
            filtered = filtered.filter(msg => msg.timestamp >= filter.startTime);
        }
        if (filter?.endTime) {
            filtered = filtered.filter(msg => msg.timestamp <= filter.endTime);
        }
        return filtered;
    }
    /**
     * Clear all messages
     */
    clearMessages() {
        this.messages = [];
    }
    /**
     * Get available categories
     */
    getAvailableCategories() {
        const categories = new Set();
        this.messages.forEach(msg => {
            if (msg.category)
                categories.add(msg.category);
        });
        return Array.from(categories).sort();
    }
    log(level, message, category) {
        // Check if level is enabled
        if (!this.config.enabledLevels.includes(level)) {
            return;
        }
        // Check if category is enabled (if categories filter is active)
        if (this.config.enabledCategories.length > 0 && category &&
            !this.config.enabledCategories.includes(category)) {
            return;
        }
        const logMessage = {
            level,
            message,
            timestamp: Date.now(),
            category,
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        };
        // Store message
        this.messages.push(logMessage);
        // Limit stored messages
        if (this.messages.length > this.config.maxMessages) {
            this.messages = this.messages.slice(-this.config.maxMessages);
        }
        // Log to console if enabled
        if (this.config.showInConsole) {
            const categoryPrefix = category ? `[${category}] ` : '';
            switch (level) {
                case LogLevel.Debug:
                    console.debug(`[${level}] ${categoryPrefix}${message}`);
                    break;
                case LogLevel.Info:
                    console.info(`[${level}] ${categoryPrefix}${message}`);
                    break;
                case LogLevel.Warn:
                    console.warn(`[${level}] ${categoryPrefix}${message}`);
                    break;
                case LogLevel.Error:
                    console.error(`[${level}] ${categoryPrefix}${message}`);
                    break;
            }
        }
        // Notify UI subscribers if enabled
        if (this.config.showInUI) {
            this.subscribers.forEach(callback => callback(logMessage));
        }
    }
    Debug(message, category) {
        this.log(LogLevel.Debug, message, category);
    }
    Info(message, category) {
        this.log(LogLevel.Info, message, category);
    }
    Warn(message, category) {
        this.log(LogLevel.Warn, message, category);
    }
    Error(message, category) {
        this.log(LogLevel.Error, message, category);
    }
}
