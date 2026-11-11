import React, { useState } from 'react';

import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Leaf
} from 'lucide-react';

import api from '../services/api';
import '../styles/Login.css';
import Register from './Register';

export default function Login({ onLogin }) {

  // Login states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Registration navigation state
  const [showRegister, setShowRegister] = useState(false);


  // LOGIN FUNCTION
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }

    setLoading(true);

    try {

      const response = await api('/api/auth/login', {
        method: 'POST',

        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password
        })
      });

      if (!response.token || !response.user) {
        throw new Error('Invalid login response from server.');
      }

      // Store authentication details
      localStorage.setItem(
        'ayurdhara_token',
        response.token
      );

      localStorage.setItem(
        'ayurdhara_user',
        JSON.stringify(response.user)
      );

      // Navigate to dashboard
      onLogin(response.user);

    } catch (err) {

      setError(
        err.message || 'Login failed. Please try again.'
      );

    } finally {

      setLoading(false);

    }
  };


  // GOOGLE LOGIN
  const handleGoogleLogin = () => {
    setError('Google sign-in is not configured yet.');
  };


  // FORGOT PASSWORD
  const handleForgotPassword = () => {
    setError('Password recovery is not configured yet.');
  };


  // OPEN REGISTRATION PAGE
  const handleCreateAccount = () => {
    setError('');
    setShowRegister(true);
  };


  // BACK TO LOGIN
  const handleBackToLogin = () => {
    setShowRegister(false);
    setError('');
  };


  // DISPLAY REGISTRATION PAGE
  if (showRegister) {
    return (
      <Register
        onBackToLogin={handleBackToLogin}
      />
    );
  }


  // LOGIN PAGE
  return (

    <main className="login-page">

      {/* BACKGROUND */}
      <div
        className="login-background"
        aria-hidden="true"
      >

        <picture>

          <source
            media="(max-width: 767px)"
            srcSet="/ayurdhara-bg-mobile.png"
          />

          <source
            media="(max-width: 1100px)"
            srcSet="/ayurdhara-bg-tablet.png"
          />

          <img
            src="/ayurdhara-bg-desktop.png"
            alt=""
          />

        </picture>

      </div>


      {/* LOGIN CARD */}
      <section
        className="login-content"
        aria-label="Sign in to AyurDhara"
      >

        <div className="login-card">


          {/* HEADING */}
          <div className="login-heading">

            <span
              className="login-heading-mark"
              aria-hidden="true"
            >
              <Leaf
                size={23}
                fill="currentColor"
              />
            </span>

            <h1>Welcome Back</h1>

            <p>
              Sign in to your account
            </p>

          </div>


          {/* LOGIN FORM */}
          <form
            onSubmit={handleSubmit}
            className="login-form"
          >

            {/* EMAIL */}
            <label htmlFor="login-email">
              Email
            </label>

            <div className="login-input-wrapper">

              <Mail
                size={20}
                aria-hidden="true"
              />

              <input
                id="login-email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                autoComplete="username"
                required
              />

            </div>


            {/* PASSWORD */}
            <label htmlFor="login-password">
              Password
            </label>

            <div className="login-input-wrapper">

              <Lock
                size={20}
                aria-hidden="true"
              />

              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                autoComplete="current-password"
                required
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
                aria-label={
                  showPassword
                    ? 'Hide password'
                    : 'Show password'
                }
              >

                {showPassword
                  ? <EyeOff size={19} />
                  : <Eye size={19} />
                }

              </button>

            </div>


            {/* LOGIN OPTIONS */}
            <div className="login-options">

              <label className="remember-option">

                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) =>
                    setRememberMe(event.target.checked)
                  }
                />

                <span>
                  Remember me
                </span>

              </label>


              <button
                type="button"
                className="forgot-password"
                onClick={handleForgotPassword}
              >
                Forgot password?
              </button>

            </div>


            {/* ERROR MESSAGE */}
            {error && (

              <div
                className="login-error"
                role="alert"
              >
                {error}
              </div>

            )}


            {/* SIGN IN BUTTON */}
            <button
              type="submit"
              className="login-submit"
              disabled={loading}
            >

              <span>
                {loading
                  ? 'Signing in...'
                  : 'Sign In'
                }
              </span>

              <ArrowRight size={19} />

            </button>

          </form>


          {/* DIVIDER */}
          <div className="login-divider">

            <span />

            OR

            <span />

          </div>


          {/* GOOGLE LOGIN */}
          <button
            type="button"
            className="google-login-btn"
            onClick={handleGoogleLogin}
          >

            {/* GOOGLE LOGO */}
            <svg
              className="google-logo"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >

              <path
                fill="#EA4335"
                d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z"
              />

              <path
                fill="#4285F4"
                d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.73 7.18l7.2 5.59c4.2-3.88 6.57-9.6 6.57-17.24Z"
              />

              <path
                fill="#FBBC05"
                d="M10.53 28.59a14.4 14.4 0 0 1 0-9.18l-7.98-6.19a23.96 23.96 0 0 0 0 21.56l7.98-6.19Z"
              />

              <path
                fill="#34A853"
                d="M24 48c6.48 0 11.94-2.13 15.91-5.79l-7.2-5.59c-2 1.35-4.55 2.15-8.71 2.15-6.26 0-11.57-4.22-13.46-9.91l-7.98 6.19C6.51 42.69 14.62 48 24 48Z"
              />

            </svg>

            <span>
              Continue with Google
            </span>

          </button>


          {/* CREATE PATIENT ACCOUNT */}
          <p className="login-contact">

            New to AyurDhara?{' '}

            <button
              type="button"
              onClick={handleCreateAccount}
            >

              Create a patient account

              <ArrowRight size={16} />

            </button>

          </p>

        </div>

      </section>

    </main>

  );

}