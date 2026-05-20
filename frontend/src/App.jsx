import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = 'http://task-manager-app-production-f89c.up.railway.app';

export default function App() {
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);
    const [token, setToken] = useState(localStorage.getItem('token') || '');

    const login = (userData, tokenData) => {
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', tokenData);
        setUser(userData);
        setToken(tokenData);
    };

    const logout = () => {
        localStorage.clear();
        setUser(null);
        setToken('');
    };

    return (
        <Router>
            {token && (
                <nav className="navbar">
                    <h2>Team Task Manager ({user?.role})</h2>
                    <div>
                        <Link to="/dashboard" style={{ marginRight: '20px', fontWeight: '500' }}>Dashboard</Link>
                        <button onClick={logout} className="btn" style={{ background: '#ef4444', width: 'auto', display: 'inline-block' }}>Logout</button>
                    </div>
                </nav>
            )}
            <Routes>
                <Route path="/login" element={!token ? <Login onLogin={login} /> : <Navigate to="/dashboard" />} />
                <Route path="/signup" element={!token ? <Signup onLogin={login} /> : <Navigate to="/dashboard" />} />
                <Route path="/dashboard" element={token ? <Dashboard user={user} token={token} /> : <Navigate to="/login" />} />
                <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
        </Router>
    );
}

function Login({ onLogin }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${API_URL}/auth/login`, { email, password });
            onLogin(res.data.user, res.data.token);
        } catch (err) {
            alert(err.response?.data?.message || 'Login failed! Check backend logs.');
        }
    };

    return (
        <div className="auth-box">
            <h2>Account Login</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Email Address</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
                <div className="form-group">
                    <label>Password</label>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                </div>
                <button type="submit" className="btn">Sign In</button>
            </form>
            <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem', color: '#64748b' }}>
                New Team Member? <Link to="/signup">Create Account</Link>
            </p>
        </div>
    );
}

function Signup({ onLogin }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('MEMBER');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${API_URL}/auth/signup`, { name, email, password, role });
            onLogin(res.data.user, res.data.token);
        } catch (err) {
            alert(err.response?.data || 'Signup processing break context anomaly.');
        }
    };

    return (
        <div className="auth-box">
            <h2>Register Member</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Full Name</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} required />
                </div>
                <div className="form-group">
                    <label>Email Address</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
                <div className="form-group">
                    <label>Password</label>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                </div>
                <div className="form-group">
                    <label>Organizational Role</label>
                    <select value={role} onChange={e => setRole(e.target.value)}>
                        <option value="MEMBER">Member (Developer/Analyst)</option>
                        <option value="ADMIN">Admin (Project Manager)</option>
                    </select>
                </div>
                <button type="submit" className="btn">Register Team</button>
            </form>
            <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem', color: '#64748b' }}>
                Already registered? <Link to="/login">Login here</Link>
            </p>
        </div>
    );
}

function Dashboard({ user, token }) {
    const [tasks, setTasks] = useState([]);
    const config = { headers: { Authorization: `Bearer ${token}` } };

    const fetchTasks = async () => {
        try {
            const res = await axios.get(`${API_URL}/tasks`, config);
            setTasks(res.data);
        } catch (err) {
            console.error('Data pull break context tracker execution.', err);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const handleStatusChange = async (id, newStatus) => {
        try {
            await axios.put(`${API_URL}/tasks/${id}`, { status: newStatus }, config);
            fetchTasks();
        } catch (err) {
            alert('Unauthorized status manipulation sequence bound break.');
        }
    };

    const getStatusClass = (status) => {
        if (status === 'TO_DO') return 'todo';
        if (status === 'IN_PROGRESS') return 'progress';
        return 'done';
    };

    return (
        <div className="container">
            <h3 style={{ color: '#64748b', fontWeight: '400', marginBottom: '0.5rem' }}>DASHBOARD OVERVIEW</h3>
            <h1 style={{ marginTop: 0, marginBottom: '2rem' }}>Welcome Back, {user.name}!</h1>

            <div className="metrics-container">
                <div className="metric-card" style={{ borderLeftColor: '#6366f1' }}>
                    <h4>Total Pipeline Tasks</h4>
                    <p>{tasks.length}</p>
                </div>
                <div className="metric-card" style={{ borderLeftColor: '#f59e0b' }}>
                    <h4>Active Workloads</h4>
                    <p>{tasks.filter(t => t.status !== 'DONE').length}</p>
                </div>
                <div className="metric-card" style={{ borderLeftColor: '#10b981' }}>
                    <h4>Completed Workloads</h4>
                    <p>{tasks.filter(t => t.status === 'DONE').length}</p>
                </div>
            </div>

            <h2>Operational Task Matrix</h2>
            {tasks.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                    No synchronization models allocated to your current operational pool. Array database returned empty dataset.
                </div>
            ) : (
                <div className="grid">
                    {tasks.map(task => (
                        <div key={task.id} className="card">
                            <h3 style={{ margin: '0 0 0.75rem 0' }}>{task.title}</h3>
                            <p style={{ color: '#64748b', fontSize: '0.95rem', margin: '0 0 1rem 0' }}>{task.description}</p>
                            <p style={{ fontSize: '0.9rem', margin: '0 0 1.5rem 0' }}>
                                <strong>Deadline Vector:</strong> {task.dueDate}
                            </p>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className={`status-badge ${getStatusClass(task.status)}`}>
                  {task.status.replace('_', ' ')}
                </span>
                                <select
                                    value={task.status}
                                    onChange={(e) => handleStatusChange(task.id, e.target.value)}
                                    style={{ padding: '0.35rem', borderRadius: '4px', border: '1px solid var(--border)' }}
                                >
                                    <option value="TO_DO">To Do</option>
                                    <option value="IN_PROGRESS">In Progress</option>
                                    <option value="DONE">Done</option>
                                </select>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}