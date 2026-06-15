/**
 * Main application logic
 * Handles UI interactions and state management
 */

const App = (() => {
    // DOM Elements
    const elements = {
        currentProject: document.getElementById('currentProject'),
        projectDisplay: document.querySelector('.project-display'),
        timer: document.getElementById('timer'),
        clockOutBtn: document.getElementById('clockOutBtn'),
        projectsList: document.getElementById('projectsList'),
        addProjectBtn: document.getElementById('addProjectBtn'),
        weekTime: document.getElementById('weekTime'),
        monthTime: document.getElementById('monthTime'),
        allTimeTime: document.getElementById('allTimeTime'),
        projectModal: document.getElementById('projectModal'),
        projectForm: document.getElementById('projectForm'),
        projectName: document.getElementById('projectName'),
        projectColor: document.getElementById('projectColor'),
        colorPreview: document.getElementById('colorPreview'),
        modalTitle: document.getElementById('modalTitle'),
        closeModalBtn: document.getElementById('closeModalBtn'),
        cancelBtn: document.getElementById('cancelBtn'),
        deleteModal: document.getElementById('deleteModal'),
        deleteMessage: document.getElementById('deleteMessage'),
        deleteCancelBtn: document.getElementById('deleteCancelBtn'),
        deleteConfirmBtn: document.getElementById('deleteConfirmBtn')
    };

    // State
    let state = {
        currentEditingProjectId: null,
        pendingDeleteProjectId: null,
        timerInterval: null,
        uiUpdateInterval: null
    };

    /**
     * Initialize the application
     */
    function init() {
        setupEventListeners();
        render();
        startTimerUpdates();
        startUIUpdates();
    }

    /**
     * Setup all event listeners
     */
    function setupEventListeners() {
        // Clock out button
        elements.clockOutBtn.addEventListener('click', handleClockOut);

        // Add project button
        elements.addProjectBtn.addEventListener('click', openProjectModal);

        // Modal controls
        elements.closeModalBtn.addEventListener('click', closeProjectModal);
        elements.cancelBtn.addEventListener('click', closeProjectModal);
        elements.projectForm.addEventListener('submit', handleProjectFormSubmit);

        // Color picker preview
        elements.projectColor.addEventListener('change', (e) => {
            elements.colorPreview.style.backgroundColor = e.target.value;
        });

        // Delete modal controls
        elements.deleteCancelBtn.addEventListener('click', closeDeleteModal);
        elements.deleteConfirmBtn.addEventListener('click', confirmDelete);

        // Close modals on background click
        elements.projectModal.addEventListener('click', (e) => {
            if (e.target === elements.projectModal) closeProjectModal();
        });
        elements.deleteModal.addEventListener('click', (e) => {
            if (e.target === elements.deleteModal) closeDeleteModal();
        });
    }

    /**
     * Render the entire UI
     */
    function render() {
        renderCurrentStatus();
        renderProjectsList();
        updateStats();
    }

    /**
     * Render the current clock-in status
     */
    function renderCurrentStatus() {
        const activeSession = StorageManager.getActiveSession();

        if (activeSession) {
            const project = StorageManager.getProject(activeSession.projectId);
            if (project) {
                elements.projectDisplay.innerHTML = `
                    <div class="project-name" style="color: ${project.color};">
                        ● ${project.name}
                    </div>
                `;
                elements.clockOutBtn.disabled = false;
            }
        } else {
            elements.projectDisplay.innerHTML = '<p class="idle-message">No project active</p>';
            elements.clockOutBtn.disabled = true;
        }
    }

    /**
     * Render the projects list
     */
    function renderProjectsList() {
        const projects = StorageManager.getProjects();
        const activeSession = StorageManager.getActiveSession();

        if (projects.length === 0) {
            elements.projectsList.innerHTML = '<p class="empty-message">No projects yet. Create one to get started!</p>';
            return;
        }

        elements.projectsList.innerHTML = projects.map(project => {
            const isActive = activeSession && activeSession.projectId === project.id;
            const currentTime = StorageManager.getProjectCurrentTime(project.id);
            const formattedTime = TimeCalculations.formatTimeShort(currentTime);
            const projectStats = TimeCalculations.getProjectStats(project.id);

            return `
                <div class="project-card ${isActive ? 'active' : ''}" style="--project-color: ${project.color};">
                    <div class="project-card-title" style="color: ${project.color};">
                        ● ${project.name}
                    </div>
                    <div class="project-time">${formattedTime}</div>
                    <div class="project-time-label">Total time tracked</div>
                    <div class="project-stats-breakdown">
                        <div class="stat-row">
                            <span class="stat-label">This Week:</span>
                            <span class="stat-value">${TimeCalculations.formatTimeShort(projectStats.thisWeek)}</span>
                        </div>
                        <div class="stat-row">
                            <span class="stat-label">This Month:</span>
                            <span class="stat-value">${TimeCalculations.formatTimeShort(projectStats.thisMonth)}</span>
                        </div>
                        <div class="stat-row">
                            <span class="stat-label">All Time:</span>
                            <span class="stat-value">${TimeCalculations.formatTimeShort(projectStats.allTime)}</span>
                        </div>
                    </div>
                    <div class="project-actions">
                        <button class="btn btn-primary btn-small" data-action="${isActive ? 'clock-out' : 'clock-in'}" data-project-id="${project.id}">
                            ${isActive ? '' : 'Clock In'}
                        </button>
                        <button class="btn btn-secondary btn-small" data-action="edit" data-project-id="${project.id}">
                            ✏️ Edit
                        </button>
                        <button class="btn btn-danger btn-small" data-action="delete" data-project-id="${project.id}">
                            🗑️ Delete
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        // Add event listeners to project buttons
        document.querySelectorAll('[data-action="clock-in"]').forEach(btn => {
            btn.addEventListener('click', handleClockIn);
        });
        document.querySelectorAll('[data-action="clock-out"]').forEach(btn => {
            btn.addEventListener('click', handleClockOut);
        });
        document.querySelectorAll('[data-action="edit"]').forEach(btn => {
            btn.addEventListener('click', handleEditProject);
        });
        document.querySelectorAll('[data-action="delete"]').forEach(btn => {
            btn.addEventListener('click', handleDeleteProject);
        });
    }

    /**
     * Update statistics display
     */
    function updateStats() {
        const stats = TimeCalculations.getAllStats();

        elements.weekTime.textContent = TimeCalculations.formatTimeShort(stats.thisWeek);
        elements.monthTime.textContent = TimeCalculations.formatTimeShort(stats.thisMonth);
        elements.allTimeTime.textContent = TimeCalculations.formatTimeShort(stats.allTime);
    }

    /**
     * Start updating the timer every second
     */
    function startTimerUpdates() {
        // Update immediately
        updateTimer();

        // Update every second
        state.timerInterval = setInterval(updateTimer, 1000);
    }

    /**
     * Update the timer display
     */
    function updateTimer() {
        const activeSession = StorageManager.getActiveSession();

        if (activeSession) {
            const elapsed = Date.now() - activeSession.startTime;
            elements.timer.textContent = TimeCalculations.formatTimer(elapsed);
        } else {
            elements.timer.textContent = '00:00:00';
        }
    }

    /**
     * Start updating UI elements every 5 seconds
     */
    function startUIUpdates() {
        state.uiUpdateInterval = setInterval(() => {
            renderProjectsList();
            updateStats();
        }, 5000);
    }

    /**
     * Handle clocking in to a project
     */
    function handleClockIn(event) {
        const projectId = event.target.dataset.projectId;
        const project = StorageManager.getProject(projectId);

        if (project) {
            StorageManager.startSession(projectId);
            render();
        }
    }

    /**
     * Handle clocking out
     */
    function handleClockOut(event) {
        event.preventDefault();
        const activeSession = StorageManager.getActiveSession();

        if (activeSession) {
            StorageManager.endSession(activeSession.id);
            render();
        }
    }

    /**
     * Open project modal for creating new project
     */
    function openProjectModal() {
        state.currentEditingProjectId = null;
        elements.modalTitle.textContent = 'New Project';
        elements.projectName.value = '';
        elements.projectColor.value = '#3498db';
        elements.colorPreview.style.backgroundColor = '#3498db';
        elements.projectForm.dataset.mode = 'create';
        elements.projectModal.classList.remove('hidden');
        elements.projectName.focus();
    }

    /**
     * Close project modal
     */
    function closeProjectModal() {
        elements.projectModal.classList.add('hidden');
        elements.projectForm.reset();
        state.currentEditingProjectId = null;
    }

    /**
     * Open project modal for editing
     */
    function openEditModal(projectId) {
        const project = StorageManager.getProject(projectId);
        if (!project) return;

        state.currentEditingProjectId = projectId;
        elements.modalTitle.textContent = 'Edit Project';
        elements.projectName.value = project.name;
        elements.projectColor.value = project.color;
        elements.colorPreview.style.backgroundColor = project.color;
        elements.projectForm.dataset.mode = 'edit';
        elements.projectModal.classList.remove('hidden');
        elements.projectName.focus();
    }

    /**
     * Handle project form submission
     */
    function handleProjectFormSubmit(event) {
        event.preventDefault();

        const name = elements.projectName.value.trim();
        const color = elements.projectColor.value;
        const mode = elements.projectForm.dataset.mode;

        if (!name) {
            alert('Please enter a project name');
            return;
        }

        try {
            if (mode === 'create') {
                StorageManager.createProject(name, color);
            } else if (mode === 'edit' && state.currentEditingProjectId) {
                StorageManager.updateProject(state.currentEditingProjectId, {
                    name: name,
                    color: color
                });
            }

            closeProjectModal();
            render();
        } catch (error) {
            alert('Error saving project: ' + error.message);
        }
    }

    /**
     * Handle edit project button click
     */
    function handleEditProject(event) {
        const projectId = event.target.closest('button').dataset.projectId;
        openEditModal(projectId);
    }

    /**
     * Handle delete project button click
     */
    function handleDeleteProject(event) {
        const projectId = event.target.closest('button').dataset.projectId;
        const project = StorageManager.getProject(projectId);

        if (project) {
            state.pendingDeleteProjectId = projectId;
            elements.deleteMessage.textContent = `Are you sure you want to delete "${project.name}"? This cannot be undone.`;
            elements.deleteModal.classList.remove('hidden');
        }
    }

    /**
     * Close delete modal
     */
    function closeDeleteModal() {
        elements.deleteModal.classList.add('hidden');
        state.pendingDeleteProjectId = null;
    }

    /**
     * Confirm and execute project deletion
     */
    function confirmDelete() {
        if (state.pendingDeleteProjectId) {
            try {
                StorageManager.deleteProject(state.pendingDeleteProjectId);
                closeDeleteModal();
                render();
            } catch (error) {
                alert('Error deleting project: ' + error.message);
            }
        }
    }

    /**
     * Cleanup on unload
     */
    function cleanup() {
        if (state.timerInterval) {
            clearInterval(state.timerInterval);
        }
        if (state.uiUpdateInterval) {
            clearInterval(state.uiUpdateInterval);
        }
    }

    // Public API
    return {
        init,
        cleanup
    };
})();

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    App.cleanup();
});
