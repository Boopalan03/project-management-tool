import React, { useState, useEffect, useMemo, useRef } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  FiCalendar,
  FiClock,
  FiAlertTriangle,
  FiCheckCircle,
  FiEdit3,
  FiSave,
  FiRefreshCw,
  FiFolder,
  FiLayers,
  FiChevronLeft,
  FiChevronRight
} from 'react-icons/fi';
import './GanttChart.css';

const STATUS_THEMES = {
  'Completed': {
    track: '#dcfce7',
    fill: '#16a34a',
    badge: '#15803d',
    text: '#ffffff',
    border: '#15803d'
  },
  'In Progress': {
    track: '#dbeafe',
    fill: '#2563eb',
    badge: '#1d4ed8',
    text: '#ffffff',
    border: '#1d4ed8'
  },
  'In Review': {
    track: '#f3e8ff',
    fill: '#9333ea',
    badge: '#7e22ce',
    text: '#ffffff',
    border: '#7e22ce'
  },
  'On Hold': {
    track: '#ffedd5',
    fill: '#ea580c',
    badge: '#c2410c',
    text: '#ffffff',
    border: '#ea580c'
  },
  'To Do': {
    track: '#f1f5f9',
    fill: '#475569',
    badge: '#334155',
    text: '#ffffff',
    border: '#475569'
  }
};

const GanttChart = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('weekly'); // 'weekly' or 'monthly'
  const [timelineOffsetWeeks, setTimelineOffsetWeeks] = useState(0); // For Prev/Next navigation
  const [editingTask, setEditingTask] = useState(null);
  const [editForm, setEditForm] = useState({ startDate: '', dueDate: '', progress: 0, status: 'To Do' });
  const [saveLoading, setSaveLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const scrollPaneRef = useRef(null);
  const canEdit = user && (user.role === 'Admin' || user.role === 'Project Manager');

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
      const res = await api.get('/projects');
      setProjects(res.data.data);
      if (res.data.data.length > 0) {
        setSelectedProjectId(res.data.data[0]._id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTasks = async (projectId) => {
    try {
      setLoading(true);
      const res = await api.get(`/tasks/project/${projectId}`);
      // Chronological sort: by startDate ascending, then by dueDate ascending
      const sorted = (res.data.data || []).sort((a, b) => {
        const timeA = a.startDate ? new Date(a.startDate).getTime() : 0;
        const timeB = b.startDate ? new Date(b.startDate).getTime() : 0;
        if (timeA !== timeB) return timeA - timeB;
        const dueA = a.dueDate ? new Date(a.dueDate).getTime() : 0;
        const dueB = b.dueDate ? new Date(b.dueDate).getTime() : 0;
        return dueA - dueB;
      });
      setTasks(sorted);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Timeline Boundaries & Grid Calculations
  const { timelineStart, timelineEnd, totalSpanMs, intervals, todayOffsetPercent } = useMemo(() => {
    const stepDays = viewMode === 'weekly' ? 7 : 14;
    const stepMs = stepDays * 86400000;

    let baseMinTs = Date.now();
    let baseMaxTs = Date.now() + 30 * 86400000;

    if (tasks.length > 0) {
      const startTimes = tasks.map((t) => (t.startDate ? new Date(t.startDate).getTime() : Date.now()));
      const endTimes = tasks.map((t) => (t.dueDate ? new Date(t.dueDate).getTime() : Date.now() + 7 * 86400000));
      baseMinTs = Math.min(...startTimes);
      baseMaxTs = Math.max(...endTimes);
    }

    // Align start to the nearest Monday midnight for standard business weeks
    const anchor = new Date(baseMinTs);
    anchor.setHours(0, 0, 0, 0);
    const dayOfWeek = anchor.getDay(); // 0 is Sunday, 1 is Monday
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    anchor.setDate(anchor.getDate() + diffToMonday);

    // Apply manual timeline navigation offset
    anchor.setDate(anchor.getDate() + timelineOffsetWeeks * 7);

    // Span needed to cover max date + buffer
    const spanNeeded = Math.max(stepMs * 3, (baseMaxTs + 7 * 86400000) - anchor.getTime());
    const numIntervals = Math.max(viewMode === 'weekly' ? 6 : 4, Math.ceil(spanNeeded / stepMs));
    const totalSpan = numIntervals * stepMs;
    const endAnchor = new Date(anchor.getTime() + totalSpan);

    const intervalArr = [];
    for (let i = 0; i < numIntervals; i++) {
      const segStart = new Date(anchor.getTime() + i * stepMs);
      const segEnd = new Date(anchor.getTime() + (i + 1) * stepMs);

      const label =
        viewMode === 'weekly'
          ? `${segStart.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - ${segEnd.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`
          : segStart.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });

      intervalArr.push({
        label,
        leftPercent: (i / numIntervals) * 100,
        widthPercent: (1 / numIntervals) * 100
      });
    }

    // Calculate current day marker position if inside range
    const nowMs = Date.now();
    let todayPercent = null;
    if (nowMs >= anchor.getTime() && nowMs <= endAnchor.getTime()) {
      todayPercent = ((nowMs - anchor.getTime()) / totalSpan) * 100;
    }

    return {
      timelineStart: anchor,
      timelineEnd: endAnchor,
      totalSpanMs: totalSpan,
      intervals: intervalArr,
      todayOffsetPercent: todayPercent
    };
  }, [tasks, viewMode, timelineOffsetWeeks]);

  const handleOpenEdit = (task) => {
    if (!canEdit) return;
    setEditingTask(task);
    setEditForm({
      startDate: task.startDate ? new Date(task.startDate).toISOString().split('T')[0] : '',
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
      progress: task.progress || 0,
      status: task.status || 'To Do'
    });
  };

  const handleSaveTimeline = async (e) => {
    e.preventDefault();
    if (!editingTask) return;

    if (new Date(editForm.dueDate) < new Date(editForm.startDate)) {
      setMessage({ type: 'danger', text: 'Due date cannot be earlier than start date.' });
      return;
    }

    try {
      setSaveLoading(true);
      const res = await api.put(`/tasks/${editingTask._id}`, {
        startDate: editForm.startDate,
        dueDate: editForm.dueDate,
        progress: Number(editForm.progress),
        status: editForm.status
      });

      setTasks((prev) => {
        const updated = prev.map((t) => (t._id === editingTask._id ? res.data.data : t));
        return updated.sort((a, b) => {
          const timeA = a.startDate ? new Date(a.startDate).getTime() : 0;
          const timeB = b.startDate ? new Date(b.startDate).getTime() : 0;
          if (timeA !== timeB) return timeA - timeB;
          const dueA = a.dueDate ? new Date(a.dueDate).getTime() : 0;
          const dueB = b.dueDate ? new Date(b.dueDate).getTime() : 0;
          return dueA - dueB;
        });
      });

      setMessage({ type: 'success', text: `Timeline saved for "${editingTask.title}"` });
      setEditingTask(null);
      setTimeout(() => setMessage(null), 3500);
    } catch (err) {
      setMessage({
        type: 'danger',
        text: err.response?.data?.message || 'Failed to persist timeline in MongoDB'
      });
    } finally {
      setSaveLoading(false);
    }
  };

  const handleNavigate = (direction) => {
    const delta = viewMode === 'weekly' ? 1 : 2;
    setTimelineOffsetWeeks((prev) => (direction === 'prev' ? prev - delta : prev + delta));
  };

  const handleResetToday = () => {
    setTimelineOffsetWeeks(0);
  };

  return (
    <div className="gantt-view-container">
      <div className="app-container">
        {/* Top Control Bar */}
        <div className="gantt-control-panel mb-4">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
            <div className="d-flex align-items-center gap-3 flex-wrap">
              <div className="d-flex align-items-center gap-2">
                <div className="gantt-icon-badge">
                  <FiCalendar size={18} />
                </div>
                <div>
                  <h1 className="gantt-title">Project Timeline & Gantt Chart</h1>
                  <span className="gantt-subtitle">Interactive project schedules, milestones, and progress</span>
                </div>
              </div>

              <div className="d-flex align-items-center gap-2 ms-lg-3">
                <FiFolder className="text-muted d-none d-sm-inline" />
                <select
                  className="form-select form-select-sm gantt-project-select"
                  value={selectedProjectId}
                  onChange={(e) => {
                    setSelectedProjectId(e.target.value);
                    setTimelineOffsetWeeks(0);
                  }}
                >
                  {projects.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Navigation & View Controls */}
            <div className="d-flex align-items-center gap-2 flex-wrap">
              {/* Prev / Today / Next Cluster */}
              <div className="nav-cluster">
                <button
                  className="timeline-nav-btn"
                  onClick={() => handleNavigate('prev')}
                  title="Shift timeline earlier"
                >
                  <FiChevronLeft size={16} />
                </button>
                <button
                  className="timeline-nav-btn today-btn"
                  onClick={handleResetToday}
                  title="Align to current project start"
                >
                  Reset
                </button>
                <button
                  className="timeline-nav-btn"
                  onClick={() => handleNavigate('next')}
                  title="Shift timeline later"
                >
                  <FiChevronRight size={16} />
                </button>
              </div>

              {/* View Mode Switcher */}
              <div className="view-mode-pill-group">
                <button
                  type="button"
                  className={`pill-btn ${viewMode === 'weekly' ? 'active' : ''}`}
                  onClick={() => setViewMode('weekly')}
                >
                  Weekly View
                </button>
                <button
                  type="button"
                  className={`pill-btn ${viewMode === 'monthly' ? 'active' : ''}`}
                  onClick={() => setViewMode('monthly')}
                >
                  Monthly View
                </button>
              </div>

              <button
                className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1 refresh-button"
                onClick={() => selectedProjectId && fetchTasks(selectedProjectId)}
                title="Reload tasks from database"
              >
                <FiRefreshCw className={loading ? 'spin-icon' : ''} />
                <span className="d-none d-sm-inline">Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* Feedback Alert */}
        {message && (
          <div className={`alert alert-${message.type} alert-dismissible fade show d-flex align-items-center gap-2 mb-3`} role="alert">
            <FiCheckCircle size={18} />
            <div>{message.text}</div>
            <button type="button" className="btn-close" onClick={() => setMessage(null)}></button>
          </div>
        )}

        {/* Main Gantt Canvas Card */}
        <div className="gantt-canvas-card">
          <div className="gantt-scroll-pane" ref={scrollPaneRef}>
            <div className="gantt-table-layout">
              {/* Header Timeline Row (Sticky) */}
              <div className="gantt-header-band">
                <div className="task-meta-heading">
                  <FiLayers size={14} className="text-primary me-2" />
                  <span>Tasks & Assignees</span>
                </div>
                <div className="timeline-scale-heading">
                  {intervals.map((seg, idx) => (
                    <div
                      key={idx}
                      className="timeline-header-tick"
                      style={{
                        left: `${seg.leftPercent}%`,
                        width: `${seg.widthPercent}%`
                      }}
                    >
                      <span>{seg.label}</span>
                    </div>
                  ))}

                  {/* Today Marker in Header */}
                  {todayOffsetPercent !== null && (
                    <div className="today-marker-badge" style={{ left: `${todayOffsetPercent}%` }}>
                      Today
                    </div>
                  )}
                </div>
              </div>

              {/* Task Rows Container */}
              <div className="gantt-rows-container">
                {/* Global Today Vertical Red Indicator Line */}
                {todayOffsetPercent !== null && (
                  <div
                    className="today-marker-line"
                    style={{ left: `calc(320px + (100% - 320px) * ${todayOffsetPercent / 100})` }}
                  ></div>
                )}

                {tasks.map((task) => {
                  const startMs = task.startDate ? new Date(task.startDate).getTime() : timelineStart.getTime();
                  const dueMs = task.dueDate ? new Date(task.dueDate).getTime() : startMs + 5 * 86400000;
                  const durationDays = Math.max(1, Math.round((dueMs - startMs) / 86400000));

                  // Precise Mathematical Offset on the Aligned Scale
                  const offsetMs = startMs - timelineStart.getTime();
                  const spanMs = Math.max(86400000, dueMs - startMs);

                  const rawLeftPercent = (offsetMs / totalSpanMs) * 100;
                  const rawWidthPercent = (spanMs / totalSpanMs) * 100;

                  // Bound rendering inside visible grid area
                  const renderLeft = Math.max(0, Math.min(98, rawLeftPercent));
                  const maxAllowedWidth = Math.max(2, 99.5 - renderLeft);
                  const renderWidth = Math.min(maxAllowedWidth, Math.max(3.5, rawWidthPercent));

                  const isOverdue = dueMs < Date.now() && task.status !== 'Completed';
                  const theme = STATUS_THEMES[task.status] || STATUS_THEMES['To Do'];
                  const priorityClass = `priority-${task.priority || 'Medium'}`;

                  return (
                    <div key={task._id} className="gantt-task-row">
                      {/* Left: Metadata Cell (Sticky Left) */}
                      <div className="task-meta-cell">
                        <div className="d-flex align-items-center justify-content-between mb-1">
                          <span className="task-title-text" title={task.title}>
                            {task.title}
                          </span>
                          {canEdit && (
                            <button
                              className="edit-timeline-btn"
                              onClick={() => handleOpenEdit(task)}
                              title="Edit dates, status & progress in MongoDB"
                            >
                              <FiEdit3 size={13} />
                            </button>
                          )}
                        </div>

                        <div className="task-subline">
                          <span className="task-assignee-name" title={task.assignedTo ? task.assignedTo.name : 'Unassigned'}>
                            {task.assignedTo ? task.assignedTo.name : 'Unassigned'}
                          </span>
                          <span className="dot-sep">•</span>
                          <span className="task-duration-badge">{durationDays}d</span>
                          <span className="dot-sep">•</span>
                          <span className={`priority-mini-badge ${priorityClass}`}>
                            {task.priority || 'Med'}
                          </span>
                          <span className="dot-sep">•</span>
                          <span className={`status-pill status-${(task.status || 'To Do').replace(/\s+/g, '')}`}>
                            {task.status}
                          </span>
                          {isOverdue && (
                            <span className="overdue-tag">
                              <FiAlertTriangle size={11} /> Overdue
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right: Timeline Track Cell */}
                      <div className="timeline-track-cell">
                        {/* Vertical grid lines matching header ticks */}
                        {intervals.map((seg, idx) => (
                          <div
                            key={idx}
                            className="track-vertical-guide"
                            style={{ left: `${seg.leftPercent}%` }}
                          ></div>
                        ))}

                        {/* Interactive Pill Bar with precise margin clearance */}
                        <div
                          className="gantt-bar-item"
                          style={{
                            left: `calc(${renderLeft}% + 2px)`,
                            width: `calc(${renderWidth}% - 4px)`,
                            backgroundColor: theme.track,
                            borderColor: theme.border
                          }}
                          onClick={() => handleOpenEdit(task)}
                          title={`${task.title}\nAssignee: ${task.assignedTo ? task.assignedTo.name : 'Unassigned'}\nDuration: ${durationDays} days (${new Date(task.startDate).toLocaleDateString()} - ${new Date(task.dueDate).toLocaleDateString()})\nProgress: ${task.progress || 0}%\nStatus: ${task.status}`}
                        >
                          {/* Inner Fill representing Completion Progress */}
                          <div
                            className="gantt-bar-fill"
                            style={{
                              width: `${task.progress || 0}%`,
                              backgroundColor: theme.fill
                            }}
                          ></div>

                          <div className="gantt-bar-label">
                            <span
                              className="percentage-text"
                              style={{ color: task.progress > 25 ? '#ffffff' : '#1e293b' }}
                            >
                              {task.progress || 0}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {tasks.length === 0 && !loading && (
                  <div className="p-5 text-center text-muted">
                    No task timelines configured for this project yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Drawer / Modal for Timeline Changes */}
      {editingTask && (
        <div className="gantt-modal-overlay">
          <div className="gantt-modal-card">
            <div className="gantt-modal-header">
              <h2 className="modal-heading">Adjust Task Schedule</h2>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setEditingTask(null)}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveTimeline}>
              <div className="gantt-modal-body">
                <div className="task-preview-banner mb-3">
                  <span className="text-muted small">Task Title:</span>
                  <div className="fw-semibold text-dark">{editingTask.title}</div>
                </div>

                <div className="row g-3 mb-3">
                  <div className="col-6">
                    <label className="form-label small fw-semibold text-secondary">Start Date</label>
                    <input
                      type="date"
                      className="form-control form-control-sm"
                      required
                      value={editForm.startDate}
                      onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })}
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label small fw-semibold text-secondary">Due Date</label>
                    <input
                      type="date"
                      className="form-control form-control-sm"
                      required
                      value={editForm.dueDate}
                      onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold text-secondary">Task Status</label>
                  <select
                    className="form-select form-select-sm"
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  >
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="In Review">In Review</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div className="mb-2">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <label className="form-label small fw-semibold text-secondary m-0">Completion Progress</label>
                    <span className="badge bg-primary px-2">{editForm.progress}%</span>
                  </div>
                  <input
                    type="range"
                    className="form-range"
                    min="0"
                    max="100"
                    step="5"
                    value={editForm.progress}
                    onChange={(e) => setEditForm({ ...editForm, progress: e.target.value })}
                  />
                </div>
              </div>

              <div className="gantt-modal-footer">
                <button
                  type="button"
                  className="btn btn-sm btn-light border"
                  onClick={() => setEditingTask(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-sm btn-primary d-flex align-items-center gap-1"
                  disabled={saveLoading}
                >
                  <FiSave size={14} />
                  <span>{saveLoading ? 'Saving to DB...' : 'Save Timeline'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GanttChart;
