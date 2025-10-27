export declare enum LogLevel {
    Debug = "Debug",
    Info = "Info",
    Warn = "Warn",
    Error = "Error"
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
export declare class Logger {
    private static _instance;
    private subscribers;
    private messages;
    private config;
    private constructor();
    /**
     * Gets the single instance of the Logger.
     */
    static get Instance(): Logger;
    /**
     * Subscribes a callback function to log messages.
     * @param callback The function to call when a new message is logged.
     * @returns An unsubscribe function to remove the subscription.
     */
    subscribe(callback: LogCallback): () => void;
    /**
     * Configure the logger behavior
     */
    configure(config: Partial<LoggerConfig>): void;
    /**
     * Get current configuration
     */
    getConfig(): LoggerConfig;
    /**
     * Get all messages with optional filtering
     */
    getMessages(filter?: LogFilter): LogMessage[];
    /**
     * Clear all messages
     */
    clearMessages(): void;
    /**
     * Get available categories
     */
    getAvailableCategories(): string[];
    private log;
    Debug(message: string, category?: string): void;
    Info(message: string, category?: string): void;
    Warn(message: string, category?: string): void;
    Error(message: string, category?: string): void;
}
