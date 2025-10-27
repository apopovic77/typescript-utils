export enum LogLevel {
  Debug = 'Debug',
  Info = 'Info',
  Warn = 'Warn',
  Error = 'Error',
}

export interface LogMessage {
  level: LogLevel;
  message: string;
  timestamp: number;
  category?: string;
  id: string;
}

export interface LogFilter {
  levels?: LogLevel[];
  categories?: string[];
  searchText?: string;
  startTime?: number;
  endTime?: number;
}

export interface LoggerConfig {
  showInConsole: boolean;
  showInUI: boolean;
  maxMessages: number;
  enabledLevels: LogLevel[];
  enabledCategories: string[];
}

export type LogCallback = (logMessage: LogMessage) => void;

/**
 * A singleton Logger class that allows subscribing to log messages.
 * Provides a clean, globally accessible logging interface.
 * Usage: //Logger.Instance.Debug("My debug message");
 */
export class Logger {
  private static _instance: Logger;
  private subscribers: LogCallback[] = [];
  private messages: LogMessage[] = [];
  private config: LoggerConfig = {
    showInConsole: true,
    showInUI: true,
    maxMessages: 1000,
    enabledLevels: [LogLevel.Debug, LogLevel.Info, LogLevel.Warn, LogLevel.Error],
    enabledCategories: []
  };

  private constructor() {
    // Private constructor ensures singleton pattern.
  }

  /**
   * Gets the single instance of the Logger.
   */
  public static get Instance(): Logger {
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
  public subscribe(callback: LogCallback): () => void {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }

  /**
   * Configure the logger behavior
   */
  public configure(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  public getConfig(): LoggerConfig {
    return { ...this.config };
  }

  /**
   * Get all messages with optional filtering
   */
  public getMessages(filter?: LogFilter): LogMessage[] {
    let filtered = [...this.messages];

    if (filter?.levels) {
      filtered = filtered.filter(msg => filter.levels!.includes(msg.level));
    }

    if (filter?.categories) {
      filtered = filtered.filter(msg => 
        msg.category && filter.categories!.includes(msg.category)
      );
    }

    if (filter?.searchText) {
      const search = filter.searchText.toLowerCase();
      filtered = filtered.filter(msg => 
        msg.message.toLowerCase().includes(search) ||
        (msg.category && msg.category.toLowerCase().includes(search))
      );
    }

    if (filter?.startTime) {
      filtered = filtered.filter(msg => msg.timestamp >= filter.startTime!);
    }

    if (filter?.endTime) {
      filtered = filtered.filter(msg => msg.timestamp <= filter.endTime!);
    }

    return filtered;
  }

  /**
   * Clear all messages
   */
  public clearMessages(): void {
    this.messages = [];
  }

  /**
   * Get available categories
   */
  public getAvailableCategories(): string[] {
    const categories = new Set<string>();
    this.messages.forEach(msg => {
      if (msg.category) categories.add(msg.category);
    });
    return Array.from(categories).sort();
  }

  private log(level: LogLevel, message: string, category?: string): void {
    // Check if level is enabled
    if (!this.config.enabledLevels.includes(level)) {
      return;
    }

    // Check if category is enabled (if categories filter is active)
    if (this.config.enabledCategories.length > 0 && category && 
        !this.config.enabledCategories.includes(category)) {
      return;
    }

    const logMessage: LogMessage = {
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
          case LogLevel.Debug: console.debug(`[${level}] ${categoryPrefix}${message}`); break;
          case LogLevel.Info: console.info(`[${level}] ${categoryPrefix}${message}`); break;
          case LogLevel.Warn: console.warn(`[${level}] ${categoryPrefix}${message}`); break;
          case LogLevel.Error: console.error(`[${level}] ${categoryPrefix}${message}`); break;
      }
    }

    // Notify UI subscribers if enabled
    if (this.config.showInUI) {
      this.subscribers.forEach(callback => callback(logMessage));
    }
  }

  public Debug(message: string, category?: string): void {
    this.log(LogLevel.Debug, message, category);
  }

  public Info(message: string, category?: string): void {
    this.log(LogLevel.Info, message, category);
  }

  public Warn(message: string, category?: string): void {
    this.log(LogLevel.Warn, message, category);
  }

  public Error(message: string, category?: string): void {
    this.log(LogLevel.Error, message, category);
  }
} 