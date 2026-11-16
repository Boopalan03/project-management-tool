import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FiLock, FiMail, FiCheckSquare } from 'react-icons/fi';

const Login = () => {
  const [email, setEmail] = useState('pm@codec.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
      <div className="card shadow-sm border-0 p-4" style={{ maxWidth: '420px', width: '100%' }}>
        <div className="text-center mb-4">
          <div className="d-inline-flex p-3 rounded-circle bg-primary bg-opacity-10 text-primary mb-2">
            <FiCheckSquare size={36} />
          </div>
          <h4 className="fw-bold">Sign In to Codec Flow</h4>
          <p className="text-muted small">Access your project boards and tasks</p>
        </div>

        {error && <div className="alert alert-danger py-2 small">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label small fw-semibold">Email Address</label>
            <div className="input-group">
              <span className="input-group-text bg-white">
                <FiMail />
              </span>
              <input
                type="email"
                className="form-control"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label small fw-semibold">Password</label>
            <div className="input-group">
              <span className="input-group-text bg-white">
                <FiLock />
              </span>
              <input
                type="password"
                className="form-control"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100 py-2 fw-semibold"
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-4 p-3 bg-light rounded border text-muted small">
          <div className="fw-bold mb-1">Quick Demo Accounts:</div>
          <div>PM: <code>pm@codec.com</code> / <code>password123</code></div>
          <div>Dev: <code>alex@codec.com</code> / <code>password123</code></div>
        </div>
      </div>
    </div>
  );
};

export default Login;

