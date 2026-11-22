import React, { useEffect, useState } from 'react';

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
  const [googleLoading, setGoogleLoading] = useState(false);

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


  // GOOGLE SIGN-IN: Google Identity Services returns an ID token.
  // The backend verifies that token and creates/logs in PATIENT accounts only.
  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const container = document.getElementById('google-signin-container');

    if (!clientId || !container) return;

    let cancelled = false;

    const initializeGoogle = () => {
      if (cancelled || !window.google?.accounts?.id) return;

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (googleResponse) => {
          if (!googleResponse?.credential) {
            setError('Google sign-in could not be completed. Please try again.');
            return;
          }

          setError('');
          setGoogleLoading(true);

          try {
            const response = await api('/api/auth/google', {
              method: 'POST',
              body: JSON.stringify({ credential: googleResponse.credential })
            });

            if (!response.token || !response.user || response.user.role !== 'patient') {
              throw new Error('Google sign-in is available for patient accounts only.');
            }

            localStorage.setItem('ayurdhara_token', response.token);
            localStorage.setItem('ayurdhara_user', JSON.stringify(response.user));
            onLogin(response.user);
          } catch (err) {
            setError(err.message || 'Google sign-in failed. Please try again.');
          } finally {
            setGoogleLoading(false);
          }
        },
        auto_select: false,
        context: 'signin'
      });

      container.innerHTML = '';
      window.google.accounts.id.renderButton(container, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text: 'continue_with',
        shape: 'rectangular',
        logo_alignment: 'left',
        width: Math.min(container.clientWidth || 380, 420)
      });
    };

    if (window.google?.accounts?.id) {
      initializeGoogle();
    } else {
      let script = document.querySelector('script[data-google-identity="true"]');
      if (!script) {
        script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.dataset.googleIdentity = 'true';
        document.head.appendChild(script);
      }
      script.addEventListener('load', initializeGoogle);
      script.addEventListener('error', () => {
        if (!cancelled) setError('Could not load Google sign-in. Check your internet connection.');
      });
    }

    return () => {
      cancelled = true;
    };
  }, [onLogin]);

  const handleGoogleLogin = () => {
    if (!import.meta.env.VITE_GOOGLE_CLIENT_ID) {
      setError('Google sign-in setup is incomplete. Add VITE_GOOGLE_CLIENT_ID to frontend/.env.');
      return;
    }
    if (googleLoading) return;
    setError('Please use the Google button below to continue.');
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


          {/* GOOGLE SIGN-IN — rendered securely by Google Identity Services */}
          <div className="google-signin-area">
            <div
              id="google-signin-container"
              className="google-signin-container"
              aria-label="Continue with Google"
            />
            {googleLoading && (
              <p className="google-signin-status" role="status">
                Signing in with Google…
              </p>
            )}
          </div>


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