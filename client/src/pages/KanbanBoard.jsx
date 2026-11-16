import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  FiClock,
  FiAlertCircle,
  FiUser,
  FiPlus,
  FiRefreshCw,
  FiFilter,
  FiCheckCircle,
  FiFolder
} from 'react-icons/fi';
import './KanbanBoard.css';

const COLUMNS = [
  { id: 'To Do', label: 'To Do', color: '#64748b' },
  { id: 'In Progress', label: 'In Progress', color: '#3b82f6' },
  { id: 'In Review', label: 'In Review', color: '#8b5cf6' },
  { id: 'Completed', label: 'Completed', color: '#10b981' }
];

const KanbanBoard = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingTaskId, setUpdatingTaskId] = useState(null);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);

  // Filters
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      fetchTasks(selectedProjectId);
    }
  }, [selectedProjectId]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await api.get('/projects');
      setProjects(res.data.data);
      if (res.data.data.length > 0) {
        setSelectedProjectId(res.data.data[0]._id);
      } else {
        setLoading(false);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load projects');
      setLoading(false);
    }
  };

  const fetchTasks = async (projectId) => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/tasks/project/${projectId}`);
      setTasks(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  // Drag and Drop Handlers
  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedTaskId(taskId);
  };

  const handleDragOver = (e, columnId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColumn !== columnId) {
      setDragOverColumn(columnId);
    }
  };

  const handleDragLeave = (e, columnId) => {
    if (dragOverColumn === columnId) {
      setDragOverColumn(null);
    }
  };

  const handleDrop = async (e, targetColumnId) => {
    e.preventDefault();
    setDragOverColumn(null);
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    setDraggedTaskId(null);

    if (!taskId) return;

    const taskToMove = tasks.find((t) => t._id === taskId);
    if (!taskToMove || taskToMove.status === targetColumnId) {
      return;
    }

    const previousTasks = [...tasks];

    // Optimistic UI update
    setTasks((prevTasks) =>
      prevTasks.map((t) =>
        t._id === taskId ? { ...t, status: targetColumnId } : t
      )
    );

    setUpdatingTaskId(taskId);
    setError(null);

    try {
      const res = await api.patch(`/tasks/${taskId}/status`, {
        status: targetColumnId
      });

      setTasks((prevTasks) =>
        prevTasks.map((t) => (t._id === taskId ? res.data.data : t))
      );

      setSuccessMessage(`Moved "${taskToMove.title}" to ${targetColumnId}`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('[Kanban Drag Error]:', err);
      setTasks(previousTasks);
      setError(
        err.response?.data?.message ||
          `Failed to move task to ${targetColumnId}. Restored previous state.`
      );
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesPriority =
      priorityFilter === 'All' || task.priority === priorityFilter;
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description &&
        task.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesPriority && matchesSearch;
  });

  return (
    <div className="kanban-board-page">
      <div className="app-container">
        {/* Top Header & Filters */}
        <div className="kanban-toolbar mb-4">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
            <div className="kanban-header-left">
              <h1 className="page-title">Kanban Board</h1>
              <div className="d-flex align-items-center gap-2">
                <FiFolder className="text-primary d-none d-sm-block" />
                <select
                  className="form-select form-select-sm project-select"
                  style={{ minWidth: '220px', maxWidth: '320px' }}
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                >
                  {projects.map((proj) => (
                    <option key={proj._id} value={proj._id}>
                      {proj.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="d-flex flex-wrap align-items-center gap-2">
              <div className="input-group input-group-sm" style={{ width: '200px' }}>
                <span className="input-group-text bg-white border-end-0">
                  <FiFilter />
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <select
                className="form-select form-select-sm"
                style={{ width: '130px' }}
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
              >
                <option value="All">All Priorities</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>

              <button
                className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
                onClick={() => selectedProjectId && fetchTasks(selectedProjectId)}
                title="Refresh tasks"
              >
                <FiRefreshCw className={loading ? 'spin-icon' : ''} />
                <span className="d-none d-md-inline">Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* Notifications */}
        {error && (
          <div className="alert alert-danger alert-dismissible fade show d-flex align-items-center gap-2 mb-3" role="alert">
            <FiAlertCircle size={18} />
            <div>{error}</div>
            <button type="button" className="btn-close" onClick={() => setError(null)}></button>
          </div>
        )}

        {successMessage && (
          <div className="alert alert-success alert-dismissible fade show d-flex align-items-center gap-2 mb-3" role="alert">
            <FiCheckCircle size={18} />
            <div>{successMessage}</div>
            <button type="button" className="btn-close" onClick={() => setSuccessMessage('')}></button>
          </div>
        )}

        {/* Responsive Grid Columns */}
        <div className="kanban-board-grid">
          {COLUMNS.map((col) => {
            const colTasks = filteredTasks.filter((t) => t.status === col.id);
            const isOver = dragOverColumn === col.id;

            return (
              <div key={col.id} className="kanban-column-wrapper">
                <div
                  className={`kanban-column ${isOver ? 'column-drag-over' : ''}`}
                  onDragOver={(e) => handleDragOver(e, col.id)}
                  onDragLeave={(e) => handleDragLeave(e, col.id)}
                  onDrop={(e) => handleDrop(e, col.id)}
                >
                  {/* Column Header */}
                  <div className="column-header">
                    <div className="column-title-group">
                      <span
                        className="column-indicator"
                        style={{ backgroundColor: col.color }}
                      ></span>
                      <h2 className="column-title">{col.label}</h2>
                    </div>
                    <span className="column-counter">{colTasks.length}</span>
                  </div>

                  {/* Task List */}
                  <div className="task-card-list">
                    {colTasks.map((task) => {
                      const isSaving = updatingTaskId === task._id;
                      return (
                        <div
                          key={task._id}
                          className={`task-card ${isSaving ? 'card-updating' : ''}`}
                          draggable={!isSaving}
                          onDragStart={(e) => handleDragStart(e, task._id)}
                        >
                          <div className="d-flex justify-content-between align-items-center">
                            <span className={`priority-pill priority-${task.priority}`}>
                              {task.priority}
                            </span>
                            {isSaving && (
                              <span className="spinner-border spinner-border-sm text-warning" role="status"></span>
                            )}
                          </div>

                          <h3 className="task-card-title">{task.title}</h3>

                          {task.description && (
                            <p className="task-card-desc">{task.description}</p>
                          )}

                          {task.labels && task.labels.length > 0 && (
                            <div className="task-tags">
                              {task.labels.map((lbl, idx) => (
                                <span key={idx} className="task-tag-badge">
                                  #{lbl}
                                </span>
                              ))}
                            </div>
                          )}

                          <div className="task-card-footer">
                            <div className="footer-item">
                              <FiUser size={13} />
                              <span>{task.assignedTo ? task.assignedTo.name : 'Unassigned'}</span>
                            </div>
                            {task.dueDate && (
                              <div className="footer-item">
                                <FiClock size={13} />
                                <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {colTasks.length === 0 && !loading && (
                      <div className="empty-column-state">
                        <small>No tasks in this stage</small>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default KanbanBoard;
