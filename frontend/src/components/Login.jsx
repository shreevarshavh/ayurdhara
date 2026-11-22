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

    <main className="relative isolate grid max-[767px]:flex max-[767px]:flex-col grid-cols-[minmax(0,1fr)] w-full min-h-screen min-h-[100dvh] overflow-hidden max-[767px]:overflow-visible bg-[#f5f5e8] max-[767px]:bg-[#f4f5e9]">

      {/* BACKGROUND */}
      <div
        className="absolute max-[767px]:relative inset-0 max-[767px]:inset-auto -z-1 max-[767px]:z-0 overflow-hidden w-full max-[767px]:h-auto max-[767px]:bg-[#eef2d9]"
        aria-hidden="true"
      >

        <picture className="block w-full h-full max-[767px]:h-auto">

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
            className="block w-full h-full max-[767px]:h-auto object-cover max-[767px]:object-contain object-center"
          />

        </picture>

      </div>


      {/* LOGIN CARD */}
      <section
        className="flex max-[767px]:block items-center justify-end w-full min-h-screen min-h-[100dvh] max-[767px]:min-h-0 p-[18px_clamp(24px,4vw,65px)] max-[1100px]:p-[20px] max-[767px]:p-[0_16px_28px] max-[767px]:-mt-[10px] max-[767px]:relative max-[767px]:z-1 max-[380px]:px-[12px]"
        aria-label="Sign in to AyurDhara"
      >

        <div className="w-[min(100%,540px)] max-[1100px]:w-[min(48%,440px)] max-[767px]:w-full max-[767px]:max-w-[520px] max-[767px]:mx-auto p-[34px_40px] max-[1100px]:p-[23px_24px] max-[767px]:p-[30px_24px] max-[380px]:p-[21px_17px] rounded-[30px] max-[1100px]:rounded-[24px] max-[767px]:rounded-[24px] border border-[rgba(255,255,255,0.88)] bg-[rgba(255,255,248,0.95)] shadow-[0_18px_50px_rgba(39,69,35,0.15)] max-[767px]:shadow-[0_12px_36px_rgba(39,69,35,0.13)] backdrop-blur-[12px]">


          {/* HEADING */}
          <div className="m-[0_0_18px] max-[1100px]:mb-[16px] text-center">

            <span
              className="hidden"
              aria-hidden="true"
            >
              <Leaf
                size={23}
                fill="currentColor"
              />
            </span>

            <h1 className="m-0 text-[#104a32] font-['Cormorant_Garamond',Georgia,serif] text-[clamp(36px,3vw,44px)] max-[1100px]:text-[36px] max-[767px]:text-[36px] max-[380px]:text-[33px] font-bold leading-[1.05]">Welcome Back</h1>

            <p className="mt-[5px] text-[#59695d] font-['Cormorant_Garamond',Georgia,serif] text-[17px] max-[767px]:text-[16px]">
              Sign in to your account
            </p>

          </div>


          {/* LOGIN FORM */}
          <form
            onSubmit={handleSubmit}
            className="flex flex-col"
          >

            {/* EMAIL */}
            <label htmlFor="login-email" className="m-[0_0_6px] text-[#294b38] text-[13px] font-bold">
              Email
            </label>

            <div className="flex items-center gap-[12px] min-h-[49px] max-[1100px]:min-h-[46px] max-[767px]:min-h-[49px] transition-all duration-200 mb-[13px] max-[1100px]:mb-[11px] px-[15px] border border-[#d9e1ce] rounded-[16px] text-[#36764a] bg-[rgba(255,255,255,0.85)] focus-within:border-[#398354] focus-within:ring-3 focus-within:ring-[#398354]/12">

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
                className="w-full min-w-0 border-0 outline-none text-[#243d2e] bg-transparent text-[14px] placeholder:text-[#929b91]"
              />

            </div>


            {/* PASSWORD */}
            <label htmlFor="login-password" className="m-[0_0_6px] text-[#294b38] text-[13px] font-bold">
              Password
            </label>

            <div className="flex items-center gap-[12px] min-h-[49px] max-[1100px]:min-h-[46px] max-[767px]:min-h-[49px] transition-all duration-200 mb-[13px] max-[1100px]:mb-[11px] px-[15px] border border-[#d9e1ce] rounded-[16px] text-[#36764a] bg-[rgba(255,255,255,0.85)] focus-within:border-[#398354] focus-within:ring-3 focus-within:ring-[#398354]/12">

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
                className="w-full min-w-0 border-0 outline-none text-[#243d2e] bg-transparent text-[14px] placeholder:text-[#929b91]"
              />

              <button
                type="button"
                className="grid place-items-center shrink-0 p-[4px] border-0 text-[#286341] bg-transparent cursor-pointer"
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
            <div className="flex items-center justify-between gap-[12px] my-[3px_17px] max-[1100px]:mb-[15px] max-[767px]:mb-[17px] text-[12px] max-[380px]:items-start">

              <label className="inline-flex items-center gap-[8px] text-[#536458] cursor-pointer">

                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) =>
                    setRememberMe(event.target.checked)
                  }
                  className="w-[16px] h-[16px] accent-[#176342]"
                />

                <span>
                  Remember me
                </span>

              </label>


              <button
                type="button"
                className="p-0 border-0 text-[#075638] bg-transparent font-bold cursor-pointer hover:underline"
                onClick={handleForgotPassword}
              >
                Forgot password?
              </button>

            </div>


            {/* ERROR MESSAGE */}
            {error && (

              <div
                className="-mt-[7px] mb-[12px] text-[#a12d2d] text-[13px]"
                role="alert"
              >
                {error}
              </div>

            )}


            {/* SIGN IN BUTTON */}
            <button
              type="submit"
              className="flex items-center justify-center gap-[16px] w-full min-h-[53px] max-[1100px]:min-h-[50px] max-[767px]:min-h-[51px] border-0 rounded-[17px] text-white bg-[linear-gradient(100deg,#08613e,#064b34)] hover:bg-[linear-gradient(100deg,#08734a,#07583b)] shadow-[0_8px_18px_rgba(7,86,56,0.15)] hover:shadow-[0_12px_24px_rgba(7,86,56,0.22)] hover:-translate-y-px hover:brightness-[1.06] text-[17px] font-bold cursor-pointer transition-all duration-200 disabled:opacity-60 disabled:cursor-wait"
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
          <div className="flex items-center gap-[14px] my-[15px] max-[1100px]:my-[13px] text-[#7d857b] text-[12px]">

            <span className="flex-1 h-px bg-[#dce3d3]" />

            OR

            <span className="flex-1 h-px bg-[#dce3d3]" />

          </div>


          {/* GOOGLE LOGIN */}
          <button
            type="button"
            className="w-full min-h-[55px] max-[1100px]:min-h-[46px] max-[767px]:min-h-[49px] flex items-center justify-center gap-[12px] bg-white hover:bg-[#f7faf5] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] active:scale-[0.99] border-2 border-[#18251e] rounded-[20px] text-[#194b35] text-[18px] font-bold cursor-pointer transition-all duration-200 focus-visible:outline-3 focus-visible:outline-[#91b99b] focus-visible:outline-offset-3"
            onClick={handleGoogleLogin}
          >

            {/* GOOGLE LOGO */}
            <svg
              className="w-[22px] h-[22px] block shrink-0"
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
          <p className="flex items-center justify-center flex-wrap gap-[7px] mt-[15px] max-[1100px]:mt-[13px] max-[767px]:mt-[21px] text-[#788174] font-['Cormorant_Garamond',Georgia,serif] text-[16px] max-[1100px]:text-[14px] max-[767px]:text-[15px]">

            New to AyurDhara?{' '}

            <button
              type="button"
              onClick={handleCreateAccount}
              className="inline-flex items-center gap-[7px] p-0 border-0 text-[#075638] bg-transparent font-['Lato',sans-serif] text-[13px] font-bold cursor-pointer hover:underline"
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
