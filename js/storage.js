/**
 * Storage module for managing persistent data using localStorage
 * Handles all CRUD operations for projects and time tracking data
 */

const StorageManager = (() => {
    const STORAGE_KEY = 'timeclock_projects';
    const SESSIONS_KEY = 'timeclock_sessions';

    /**
     * Project structure:
     * {
     *   id: string (timestamp-based),
     *   name: string,
     *   color: string (hex),
     *   createdAt: number (timestamp),
     *   totalTime: number (milliseconds)
     * }
     */

    /**
     * Session structure:
     * {
     *   id: string,
     *   projectId: string,
     *   startTime: number (timestamp),
     *   endTime: number (timestamp or null if active)
     * }
     */

    /**
     * Generate unique ID based on timestamp and random number
     */
    function generateId() {
        return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Get all projects from storage
     */
    function getProjects() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error reading projects from storage:', error);
            return [];
        }
    }

    /**
     * Get a single project by ID
     */
    function getProject(projectId) {
        const projects = getProjects();
        return projects.find(p => p.id === projectId);
    }

    /**
     * Create a new project
     */
    function createProject(name, color = '#3498db') {
        const projects = getProjects();
        const newProject = {
            id: generateId(),
            name: name.trim(),
            color: color,
            createdAt: Date.now(),
            totalTime: 0
        };
        projects.push(newProject);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
        return newProject;
    }

    /**
     * Update an existing project
     */
    function updateProject(projectId, updates) {
        const projects = getProjects();
        const projectIndex = projects.findIndex(p => p.id === projectId);

        if (projectIndex === -1) {
            throw new Error('Project not found');
        }

        // Only allow updating certain fields
        const allowedFields = ['name', 'color'];
        allowedFields.forEach(field => {
            if (field in updates) {
                projects[projectIndex][field] = updates[field];
            }
        });

        localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
        return projects[projectIndex];
    }

    /**
     * Delete a project and all its sessions
     */
    function deleteProject(projectId) {
        const projects = getProjects();
        const filtered = projects.filter(p => p.id !== projectId);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));

        // Also delete all sessions for this project
        const sessions = getSessions();
        const filteredSessions = sessions.filter(s => s.projectId !== projectId);
        localStorage.setItem(SESSIONS_KEY, JSON.stringify(filteredSessions));
    }

    /**
     * Get all sessions from storage
     */
    function getSessions() {
        try {
            const data = localStorage.getItem(SESSIONS_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error reading sessions from storage:', error);
            return [];
        }
    }

    /**
     * Get active session (if any)
     */
    function getActiveSession() {
        const sessions = getSessions();
        return sessions.find(s => s.endTime === null);
    }

    /**
     * Get sessions for a specific project
     */
    function getProjectSessions(projectId) {
        const sessions = getSessions();
        return sessions.filter(s => s.projectId === projectId);
    }

    /**
     * Start a new time tracking session
     */
    function startSession(projectId) {
        const project = getProject(projectId);
        if (!project) {
            throw new Error('Project not found');
        }

        // End any active session
        const activeSession = getActiveSession();
        if (activeSession) {
            endSession(activeSession.id);
        }

        // Create new session
        const sessions = getSessions();
        const newSession = {
            id: generateId(),
            projectId: projectId,
            startTime: Date.now(),
            endTime: null
        };
        sessions.push(newSession);
        localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
        return newSession;
    }

    /**
     * End the active session
     */
    function endSession(sessionId) {
        const sessions = getSessions();
        const session = sessions.find(s => s.id === sessionId);

        if (!session) {
            throw new Error('Session not found');
        }

        session.endTime = Date.now();

        // Update project total time
        const duration = session.endTime - session.startTime;
        const projects = getProjects();
        const project = projects.find(p => p.id === session.projectId);
        if (project) {
            project.totalTime += duration;
        }

        localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
        return session;
    }

    /**
     * Get total time for a project
     */
    function getProjectTotalTime(projectId) {
        const project = getProject(projectId);
        if (!project) return 0;
        return project.totalTime;
    }

    /**
     * Calculate cumulative time for a project including active session
     */
    function getProjectCurrentTime(projectId) {
        let total = getProjectTotalTime(projectId);
        const activeSession = getActiveSession();

        if (activeSession && activeSession.projectId === projectId) {
            const elapsed = Date.now() - activeSession.startTime;
            total += elapsed;
        }

        return total;
    }

    /**
     * Get total time across all projects
     */
    function getTotalTimeAllProjects() {
        const projects = getProjects();
        let total = projects.reduce((sum, project) => sum + project.totalTime, 0);

        // Add active session time if any
        const activeSession = getActiveSession();
        if (activeSession) {
            const elapsed = Date.now() - activeSession.startTime;
            total += elapsed;
        }

        return total;
    }

    /**
     * Clear all data (for testing/reset)
     */
    function clearAll() {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(SESSIONS_KEY);
    }

    // Public API
    return {
        getProjects,
        getProject,
        createProject,
        updateProject,
        deleteProject,
        getSessions,
        getActiveSession,
        getProjectSessions,
        startSession,
        endSession,
        getProjectTotalTime,
        getProjectCurrentTime,
        getTotalTimeAllProjects,
        clearAll
    };
})();
