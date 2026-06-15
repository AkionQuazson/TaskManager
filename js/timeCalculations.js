/**
 * Time calculations module
 * Provides utilities for calculating and formatting time periods
 */

const TimeCalculations = (() => {
    /**
     * Format milliseconds into human-readable format
     * @param {number} milliseconds - Time in milliseconds
     * @returns {string} Formatted time (e.g., "1h 23m 45s")
     */
    function formatTime(milliseconds) {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        if (hours > 0) {
            return `${hours}h ${minutes}m ${seconds}s`;
        } else if (minutes > 0) {
            return `${minutes}m ${seconds}s`;
        } else {
            return `${seconds}s`;
        }
    }

    /**
     * Format milliseconds into short format (hours and minutes only)
     * @param {number} milliseconds - Time in milliseconds
     * @returns {string} Formatted time (e.g., "1h 23m")
     */
    function formatTimeShort(milliseconds) {
        const totalMinutes = Math.floor(milliseconds / 60000);
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;

        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        } else {
            return `${minutes}m`;
        }
    }

    /**
     * Format milliseconds into timer format (HH:MM:SS)
     * @param {number} milliseconds - Time in milliseconds
     * @returns {string} Timer format (e.g., "01:23:45")
     */
    function formatTimer(milliseconds) {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    /**
     * Get timestamp for start of day
     * @param {Date} date - Optional date (defaults to today)
     * @returns {number} Timestamp of start of day
     */
    function getStartOfDay(date = new Date()) {
        const newDate = new Date(date);
        newDate.setHours(0, 0, 0, 0);
        return newDate.getTime();
    }

    /**
     * Get timestamp for end of day
     * @param {Date} date - Optional date (defaults to today)
     * @returns {number} Timestamp of end of day
     */
    function getEndOfDay(date = new Date()) {
        const newDate = new Date(date);
        newDate.setHours(23, 59, 59, 999);
        return newDate.getTime();
    }

    /**
     * Get timestamp for start of week (Monday)
     * @param {Date} date - Optional date (defaults to today)
     * @returns {number} Timestamp of start of week
     */
    function getStartOfWeek(date = new Date()) {
        const newDate = new Date(date);
        const day = newDate.getDay();
        const diff = newDate.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
        newDate.setDate(diff);
        newDate.setHours(0, 0, 0, 0);
        return newDate.getTime();
    }

    /**
     * Get timestamp for end of week (Sunday)
     * @param {Date} date - Optional date (defaults to today)
     * @returns {number} Timestamp of end of week
     */
    function getEndOfWeek(date = new Date()) {
        const newDate = new Date(date);
        const day = newDate.getDay();
        const diff = newDate.getDate() - day + (day === 0 ? 0 : 7);
        newDate.setDate(diff);
        newDate.setHours(23, 59, 59, 999);
        return newDate.getTime();
    }

    /**
     * Get timestamp for start of month
     * @param {Date} date - Optional date (defaults to today)
     * @returns {number} Timestamp of start of month
     */
    function getStartOfMonth(date = new Date()) {
        const newDate = new Date(date);
        newDate.setDate(1);
        newDate.setHours(0, 0, 0, 0);
        return newDate.getTime();
    }

    /**
     * Get timestamp for end of month
     * @param {Date} date - Optional date (defaults to today)
     * @returns {number} Timestamp of end of month
     */
    function getEndOfMonth(date = new Date()) {
        const newDate = new Date(date);
        newDate.setMonth(newDate.getMonth() + 1);
        newDate.setDate(0);
        newDate.setHours(23, 59, 59, 999);
        return newDate.getTime();
    }

    /**
     * Calculate total time in a period for a project
     * @param {Array} sessions - Array of session objects
     * @param {number} startTime - Start timestamp
     * @param {number} endTime - End timestamp
     * @returns {number} Total time in milliseconds
     */
    function calculateTimeInPeriod(sessions, startTime, endTime) {
        return sessions.reduce((total, session) => {
            // Skip sessions that are entirely outside the period
            if (session.endTime < startTime || session.startTime > endTime) {
                return total;
            }

            // Calculate overlap
            const effectiveStart = Math.max(session.startTime, startTime);
            const effectiveEnd = Math.min(session.endTime || Date.now(), endTime);

            return total + (effectiveEnd - effectiveStart);
        }, 0);
    }

    /**
     * Get time statistics for a project
     * @param {string} projectId - Project ID
     * @returns {Object} Statistics object with week, month, and allTime
     */
    function getProjectStats(projectId) {
        const sessions = StorageManager.getProjectSessions(projectId);
        const now = new Date();

        return {
            thisWeek: calculateTimeInPeriod(sessions, getStartOfWeek(now), getEndOfWeek(now)),
            thisMonth: calculateTimeInPeriod(sessions, getStartOfMonth(now), getEndOfMonth(now)),
            allTime: sessions.reduce((total, session) => {
                const duration = (session.endTime || Date.now()) - session.startTime;
                return total + duration;
            }, 0)
        };
    }

    /**
     * Get aggregate statistics across all projects
     * @returns {Object} Statistics object with week, month, and allTime
     */
    function getAllStats() {
        const sessions = StorageManager.getSessions();
        const now = new Date();

        const stats = {
            thisWeek: calculateTimeInPeriod(sessions, getStartOfWeek(now), getEndOfWeek(now)),
            thisMonth: calculateTimeInPeriod(sessions, getStartOfMonth(now), getEndOfMonth(now)),
            allTime: sessions.reduce((total, session) => {
                const duration = (session.endTime || Date.now()) - session.startTime;
                return total + duration;
            }, 0)
        };

        // Add active session time if present
        const activeSession = StorageManager.getActiveSession();
        if (activeSession) {
            const elapsed = Date.now() - activeSession.startTime;
            const weekStart = getStartOfWeek(now);
            const weekEnd = getEndOfWeek(now);
            const monthStart = getStartOfMonth(now);
            const monthEnd = getEndOfMonth(now);

            if (activeSession.startTime <= weekEnd && Date.now() >= weekStart) {
                const effectiveStart = Math.max(activeSession.startTime, weekStart);
                const effectiveEnd = Math.min(Date.now(), weekEnd);
                stats.thisWeek += effectiveEnd - effectiveStart;
            }

            if (activeSession.startTime <= monthEnd && Date.now() >= monthStart) {
                const effectiveStart = Math.max(activeSession.startTime, monthStart);
                const effectiveEnd = Math.min(Date.now(), monthEnd);
                stats.thisMonth += effectiveEnd - effectiveStart;
            }

            stats.allTime += elapsed;
        }

        return stats;
    }

    /**
     * Check if timestamp is within today
     */
    function isToday(timestamp) {
        const date = new Date(timestamp);
        const today = new Date();
        return date.toDateString() === today.toDateString();
    }

    /**
     * Check if timestamp is within this week
     */
    function isThisWeek(timestamp) {
        const date = new Date(timestamp);
        const weekStart = getStartOfWeek();
        const weekEnd = getEndOfWeek();
        return timestamp >= weekStart && timestamp <= weekEnd;
    }

    /**
     * Check if timestamp is within this month
     */
    function isThisMonth(timestamp) {
        const date = new Date(timestamp);
        const today = new Date();
        return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
    }

    // Public API
    return {
        formatTime,
        formatTimeShort,
        formatTimer,
        getStartOfDay,
        getEndOfDay,
        getStartOfWeek,
        getEndOfWeek,
        getStartOfMonth,
        getEndOfMonth,
        calculateTimeInPeriod,
        getProjectStats,
        getAllStats,
        isToday,
        isThisWeek,
        isThisMonth
    };
})();
