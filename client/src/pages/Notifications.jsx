import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { FiBell, FiCheck, FiCheckCircle, FiInbox } from 'react-icons/fi';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/notifications');
      setNotifications(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="notifications-page p-4 bg-light min-vh-100">
      <div className="card shadow-sm border-0 mb-4 p-3 bg-white">
        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-3">
            <h4 className="m-0 fw-bold text-dark d-flex align-items-center gap-2">
              <FiBell className="text-primary" />
              <span>Activity & Notifications</span>
            </h4>
            {unreadCount > 0 && (
              <span className="badge rounded-pill bg-danger">{unreadCount} unread</span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
              onClick={handleMarkAllRead}
            >
              <FiCheck />
              <span>Mark All as Read</span>
            </button>
          )}
        </div>
      </div>

      <div className="card shadow-sm border-0 bg-white">
        <div className="list-group list-group-flush">
          {notifications.map((item) => (
            <div
              key={item._id}
              className={`list-group-item p-3 d-flex justify-content-between align-items-center ${
                !item.isRead ? 'bg-light' : ''
              }`}
            >
              <div>
                <div className="d-flex align-items-center gap-2 mb-1">
                  {!item.isRead && (
                    <span className="badge bg-primary p-1 rounded-circle" style={{ width: '8px', height: '8px' }}></span>
                  )}
                  <span className="fw-semibold text-dark">{item.message}</span>
                </div>
                <div className="small text-muted d-flex align-items-center gap-2">
                  <span>{new Date(item.createdAt).toLocaleDateString()} at {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  {item.project && <span>• Project: {item.project.title}</span>}
                </div>
              </div>

              {!item.isRead && (
                <button
                  className="btn btn-sm btn-light border text-muted"
                  onClick={() => handleMarkAsRead(item._id)}
                  title="Mark as read"
                >
                  <FiCheckCircle />
                </button>
              )}
            </div>
          ))}

          {notifications.length === 0 && !loading && (
            <div className="p-5 text-center text-muted">
              <FiInbox size={36} className="mb-2 text-secondary" />
              <p className="m-0">No notifications yet. You are all caught up!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;

