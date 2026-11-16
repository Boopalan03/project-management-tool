import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import KanbanBoard from './pages/KanbanBoard';
import GanttChart from './pages/GanttChart';
import Analytics from './pages/Analytics';
import Notifications from './pages/Notifications';
import Login from './pages/Login';
import 'bootstrap/dist/css/bootstrap.min.css';

function MainApp() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('kanban');

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="app-layout">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      {activeTab === 'kanban' && <KanbanBoard />}
      {activeTab === 'gantt' && <GanttChart />}
      {activeTab === 'analytics' && <Analytics />}
      {activeTab === 'notifications' && <Notifications />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
