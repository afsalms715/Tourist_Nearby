import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Compass, AlertCircle } from 'lucide-react';
import '../App.css'; // Reuse existing styles

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    
    try {
      setError('');
      setLoading(true);
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError('Failed to log in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-container full-screen-center">
      <div className="auth-card glass-panel animate-fade-in">
        <div className="auth-header text-center mb-6 text-dark flex flex-col items-center">
          <Compass className="brand-icon mb-2" size={40} />
          <h2>Welcome Back</h2>
          <p className="text-light text-sm">Log in to view your saved places</p>
        </div>
        
        {error && (
          <div className="auth-error flex items-center gap-2 mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form flex flex-col gap-4">
          <div className="form-group flex flex-col gap-1">
            <label className="text-sm font-semibold text-dark">Email</label>
            <input 
              type="email" 
              className="auth-input p-3 border border-gray-300 rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
            />
          </div>

          <div className="form-group flex flex-col gap-1">
            <label className="text-sm font-semibold text-dark">Password</label>
            <input 
              type="password" 
              className="auth-input p-3 border border-gray-300 rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />
          </div>

          <button disabled={loading} type="submit" className="btn-primary mt-2 flex justify-center w-full">
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <div className="auth-footer text-center mt-6 text-sm text-light">
          Don't have an account? <Link to="/signup" className="text-blue-500 font-semibold hover:underline">Sign up</Link>
        </div>
      </div>
    </div>
  );
}
