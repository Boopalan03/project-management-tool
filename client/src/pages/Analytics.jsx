import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  FiCheckCircle,
  FiTrendingUp,
  FiClock,
  FiAlertCircle,
  FiBarChart2,
  FiPieChart,
  FiUsers,
  FiRefreshCw
} from 'react-icons/fi';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    fetchAnalytics(selectedProjectId);
  }, [selectedProjectId]);

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAnalytics = async (projectId) => {
    try {
      setLoading(true);
      const url = projectId ? `/analytics?projectId=${projectId}` : '/analytics';
      const res = await api.get(url);
      setAnalytics(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !analytics) {
    return (
      <div className="d-flex justify-content-center align-items-center p-5">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  const { summary, statusData, priorityData, workloadData } = analytics || {};

  return (
    <div className="analytics-page p-4 bg-light min-vh-100">
      {/* Header bar */}
      <div className="card shadow-sm border-0 mb-4 p-3 bg-white">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
          <div className="d-flex align-items-center gap-3">
            <h4 className="m-0 fw-bold text-dark d-flex align-items-center gap-2">
              <FiBarChart2 className="text-primary" />
              <span>Project Analytics & Intelligence</span>
            </h4>
            <select
              className="form-select form-select-sm"
              style={{ width: '230px' }}
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
            >
              <option value="">All Accessible Projects</option>
              {projects.map((p) => (
                <option key={p._id} value={p._id}>
                  📁 {p.title}
                </option>
              ))}
            </select>
          </div>

          <button
            className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
            onClick={() => fetchAnalytics(selectedProjectId)}
          >
            <FiRefreshCw className={loading ? 'spin-icon' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card shadow-sm border-0 p-3 bg-white h-100 border-start border-4 border-primary">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <span className="text-muted small fw-medium">Total Tasks</span>
                <h3 className="fw-bold my-1 text-dark">{summary?.totalTasks || 0}</h3>
                <small className="text-success fw-medium">Real-time DB query</small>
              </div>
              <div className="p-3 bg-primary bg-opacity-10 text-primary rounded-circle">
                <FiBarChart2 size={24} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card shadow-sm border-0 p-3 bg-white h-100 border-start border-4 border-success">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <span className="text-muted small fw-medium">Completed</span>
                <h3 className="fw-bold my-1 text-success">{summary?.completedTasks || 0}</h3>
                <small className="text-muted">{summary?.completionRate || 0}% Completion Rate</small>
              </div>
              <div className="p-3 bg-success bg-opacity-10 text-success rounded-circle">
                <FiCheckCircle size={24} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card shadow-sm border-0 p-3 bg-white h-100 border-start border-4 border-info">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <span className="text-muted small fw-medium">In Progress</span>
                <h3 className="fw-bold my-1 text-primary">{summary?.inProgressTasks || 0}</h3>
                <small className="text-muted">Active execution</small>
              </div>
              <div className="p-3 bg-info bg-opacity-10 text-info rounded-circle">
                <FiTrendingUp size={24} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card shadow-sm border-0 p-3 bg-white h-100 border-start border-4 border-danger">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <span className="text-muted small fw-medium">Overdue Tasks</span>
                <h3 className="fw-bold my-1 text-danger">{summary?.overdueTasks || 0}</h3>
                <small className="text-danger fw-medium">Requires immediate action</small>
              </div>
              <div className="p-3 bg-danger bg-opacity-10 text-danger rounded-circle">
                <FiAlertCircle size={24} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Charts Row */}
      <div className="row g-4 mb-4">
        {/* Status Distribution */}
        <div className="col-12 col-lg-6">
          <div className="card shadow-sm border-0 p-3 bg-white h-100">
            <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
              <FiPieChart className="text-primary" />
              <span>Task Status Breakdown</span>
            </h6>
            <div style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {statusData?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Priority Breakdown */}
        <div className="col-12 col-lg-6">
          <div className="card shadow-sm border-0 p-3 bg-white h-100">
            <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
              <FiBarChart2 className="text-primary" />
              <span>Priority Distribution</span>
            </h6>
            <div style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={priorityData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Workload Breakdown */}
      <div className="card shadow-sm border-0 p-4 bg-white">
        <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
          <FiUsers className="text-primary" />
          <span>Team Workload Allocation</span>
        </h6>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Team Member</th>
                <th>Total Assigned</th>
                <th>Completed</th>
                <th>Pending</th>
                <th>Capacity Status</th>
              </tr>
            </thead>
            <tbody>
              {workloadData?.map((member, idx) => (
                <tr key={idx}>
                  <td className="fw-semibold text-dark">{member.userName}</td>
                  <td>
                    <span className="badge bg-light text-dark border px-2 py-1">{member.total} tasks</span>
                  </td>
                  <td>
                    <span className="badge bg-success bg-opacity-10 text-success px-2 py-1">
                      {member.completed} done
                    </span>
                  </td>
                  <td>
                    <span className="badge bg-warning bg-opacity-10 text-dark px-2 py-1">
                      {member.pending} open
                    </span>
                  </td>
                  <td>
                    <div className="progress" style={{ height: '8px', width: '160px' }}>
                      <div
                        className="progress-bar bg-primary"
                        style={{
                          width: `${member.total > 0 ? (member.completed / member.total) * 100 : 0}%`
                        }}
                      ></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Analytics;

