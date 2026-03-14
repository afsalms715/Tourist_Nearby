import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Compass, AlertCircle } from 'lucide-react';
import '../App.css'; // Reuse existing styles

export default function SignUp() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signup } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    
    if (password.length < 6) {
      return setError('Password must be at least 6 characters');
    }

    try {
      setError('');
      setLoading(true);
      await signup(email, password, username);
      navigate('/');
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists.');
      } else {
        setError('Failed to create an account. ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-container full-screen-center">
      <div className="auth-card glass-panel animate-fade-in">
        <div className="auth-header text-center mb-6 text-dark flex flex-col items-center">
          <Compass className="brand-icon mb-2" size={40} />
          <h2>Create an Account</h2>
          <p className="text-light text-sm">Discover and save nearby places</p>
        </div>
        
        {error && (
          <div className="auth-error flex items-center gap-2 mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form flex flex-col gap-4">
          <div className="form-group flex flex-col gap-1">
            <label className="text-sm font-semibold text-dark">Username</label>
            <input 
              type="text" 
              className="auth-input p-3 border border-gray-300 rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500" 
              required 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="johndoe"
            />
          </div>
          
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
              placeholder="Min 6 characters"
            />
          </div>

          <button disabled={loading} type="submit" className="btn-primary mt-2 flex justify-center w-full">
            {loading ? 'Creating...' : 'Sign Up'}
          </button>
        </form>

        <div className="auth-footer text-center mt-6 text-sm text-light">
          Already have an account? <Link to="/login" className="text-blue-500 font-semibold hover:underline">Log in</Link>
        </div>
      </div>
    </div>
  );
}
