import React, { useState, useContext } from 'react';
import { FaFacebookF, FaGoogle, FaLinkedinIn } from 'react-icons/fa';
import toast, { Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { generateOTP, sendOtpEmail } from './emailService';

// Secura Custom Slate Toast Styling
const toastConfig = {
  style: {
    background: '#18181B',
    color: '#F4F4F5',
    border: '1px solid #27272A',
    fontSize: '12.5px',
    fontFamily: 'Inter, sans-serif',
    borderRadius: '10px',
    padding: '10px 14px',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
  },
  success: {
    iconTheme: {
      primary: '#10B981',
      secondary: '#18181B',
    },
  },
  error: {
    iconTheme: {
      primary: '#EF4444',
      secondary: '#18181B',
    },
  },
};

export default function SlidingAuthCard() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isRightActive, setIsRightActive] = useState(false);

  // Sign Up State
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpOtpInput, setSignUpOtpInput] = useState('');
  const [generatedSignUpOtp, setGeneratedSignUpOtp] = useState(null);
  const [isSignUpOtpSent, setIsSignUpOtpSent] = useState(false);
  const [signUpBtnText, setSignUpBtnText] = useState('Send OTP');

  // Sign In State
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [signInOtpInput, setSignInOtpInput] = useState('');
  const [generatedSignInOtp, setGeneratedSignInOtp] = useState(null);
  const [isSignInOtpSent, setIsSignInOtpSent] = useState(false);
  const [signInBtnText, setSignInBtnText] = useState('Send OTP');

  // Handle OTP Trigger with DB Check
  const handleSendOtp = async (email, isSignUp) => {
    if (!email.trim() || !email.includes('@')) {
      toast.error('Please enter a valid email address.');
      return;
    }

    try {
      const res = await fetch('http://localhost:3000/api/auth/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      
      if (isSignUp && data.exists) {
        toast.error('You already have an account! Switching to Sign In.', toastConfig);
        setIsRightActive(false); // Switch to Sign In
        setSignInEmail(email);
        return;
      }
      
      if (!isSignUp && !data.exists) {
        toast.error('No account found! Switching to Sign Up.', toastConfig);
        setIsRightActive(true); // Switch to Sign Up
        setSignUpEmail(email);
        return;
      }
    } catch (err) {
      console.error('Failed to check user status', err);
    }

    const newOtp = generateOTP();
    const setBtnText = isSignUp ? setSignUpBtnText : setSignInBtnText;
    const setIsSent = isSignUp ? setIsSignUpOtpSent : setIsSignInOtpSent;
    const setStoredOtp = isSignUp ? setGeneratedSignUpOtp : setGeneratedSignInOtp;

    setBtnText('Sending...');
    setStoredOtp(newOtp);

    await toast.promise(
      sendOtpEmail(email, newOtp),
      {
        loading: 'Dispatching secure verification code...',
        success: () => {
          setBtnText('Sent!');
          setIsSent(true);
          setTimeout(() => setBtnText('Resend OTP'), 30000);
          return `Verification OTP sent to ${email}`;
        },
        error: (err) => {
          setBtnText('Send OTP');
          return 'Failed to send OTP. Check email service configuration.';
        },
      },
      toastConfig
    );
  };

  // Sign Up Form Submit
  const onSignUpSubmit = async (e) => {
    e.preventDefault();
    if (!signUpOtpInput.trim()) {
      toast.error('Please enter the OTP sent to your email!', toastConfig);
      return;
    }
    if (signUpOtpInput.trim() !== generatedSignUpOtp) {
      toast.error('Wrong OTP! Please check your inbox and retry.', toastConfig);
      return;
    }

    try {
      const res = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: signUpEmail, password: signUpPassword, name: signUpName })
      });
      const data = await res.json();
      
      if (res.ok) {
        toast.success('Account created successfully!', toastConfig);
        login(data.user.email, data.user.name); // or login(data.token) depending on your auth provider
        navigate('/');
      } else {
        toast.error(data.error || 'Registration failed', toastConfig);
      }
    } catch (err) {
      toast.error('Server error during registration', toastConfig);
    }
  };

  // Sign In Form Submit
  const onSignInSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: signInEmail, password: signInPassword })
      });
      const data = await res.json();
      
      if (res.ok) {
        toast.success('Signed in successfully!', toastConfig);
        login(data.user.email, data.user.name);
        navigate('/');
      } else {
        toast.error(data.error || 'Invalid credentials', toastConfig);
      }
    } catch (err) {
      toast.error('Server error during login', toastConfig);
    }
  };

  return (
    <div
      className={`bg-white rounded-[30px] shadow-[0_14px_28px_rgba(0,0,0,0.25),0_10px_10px_rgba(0,0,0,0.22)] relative overflow-hidden w-[768px] max-w-full min-h-[490px] font-sans ${
        isRightActive ? 'right-panel-active' : ''
      }`}
    >
      {/* Embedded Toaster with Top-Center Position */}
      <Toaster position="top-center" toastOptions={toastConfig} />

      {/* ================= SIGN UP PANEL ================= */}
      <div
        className={`absolute top-0 left-0 w-1/2 h-full transition-all duration-1000 ease-[cubic-bezier(0.77,0,0.175,1)] ${
          isRightActive
            ? 'translate-x-full opacity-100 z-[5]'
            : 'opacity-0 z-[1]'
        }`}
      >
        <form
          onSubmit={onSignUpSubmit}
          className="bg-white flex flex-col items-center justify-center px-12 h-full text-center"
        >
          <h1 className="font-bold text-2xl text-[#1a1a1a] mb-1">Create Account</h1>

          {/* Social Icons */}
          <div className="my-4 flex items-center justify-center">
            <button
              type="button"
              onClick={() => toast('Social registration coming soon!', { icon: 'ℹ️', ...toastConfig })}
              className="w-10 h-10 mx-1 bg-gray-100 rounded-full inline-flex items-center justify-center text-gray-700 hover:text-[#1a1a1a] hover:bg-gray-200 transition-all"
            >
              <FaFacebookF className="text-sm" />
            </button>
            <button
              type="button"
              onClick={() => toast('Google authentication coming soon!', { icon: 'ℹ️', ...toastConfig })}
              className="w-10 h-10 mx-1 bg-gray-100 rounded-full inline-flex items-center justify-center text-gray-700 hover:text-[#1a1a1a] hover:bg-gray-200 transition-all"
            >
              <FaGoogle className="text-sm" />
            </button>
            <button
              type="button"
              onClick={() => toast('LinkedIn authentication coming soon!', { icon: 'ℹ️', ...toastConfig })}
              className="w-10 h-10 mx-1 bg-gray-100 rounded-full inline-flex items-center justify-center text-gray-700 hover:text-[#1a1a1a] hover:bg-gray-200 transition-all"
            >
              <FaLinkedinIn className="text-sm" />
            </button>
          </div>

          <span className="text-xs text-gray-500 mb-2">or use your email for registration</span>

          <input
            type="text"
            placeholder="Full Name"
            value={signUpName}
            onChange={(e) => setSignUpName(e.target.value)}
            required
            className="bg-gray-100 border border-transparent px-4 py-3 my-1 w-full rounded-lg text-xs outline-none focus:border-[#1a1a1a] focus:bg-white transition-all"
          />

          <input
            type="email"
            placeholder="Email Address"
            value={signUpEmail}
            onChange={(e) => setSignUpEmail(e.target.value)}
            required
            className="bg-gray-100 border border-transparent px-4 py-3 my-1 w-full rounded-lg text-xs outline-none focus:border-[#1a1a1a] focus:bg-white transition-all"
          />

          {/* OTP Input & Dispatch */}
          <div className="flex w-full items-center justify-between gap-2.5 my-1">
            <input
              type="text"
              placeholder="Enter 4-digit OTP"
              value={signUpOtpInput}
              onChange={(e) => setSignUpOtpInput(e.target.value)}
              disabled={!isSignUpOtpSent}
              required
              className="bg-gray-100 border border-transparent px-4 py-3 w-full rounded-lg text-xs font-mono outline-none focus:border-[#1a1a1a] focus:bg-white disabled:bg-gray-100/60 disabled:cursor-not-allowed transition-all m-0"
            />
            <button
              type="button"
              onClick={() => handleSendOtp(signUpEmail, true)}
              className="px-4 py-3 m-0 rounded-lg bg-[#1a1a1a] text-white text-xs font-bold whitespace-nowrap border border-[#1a1a1a] hover:shadow-[0_4px_15px_rgba(26,26,26,0.4)] active:scale-95 transition-all cursor-pointer"
            >
              {signUpBtnText}
            </button>
          </div>

          <input
            type="password"
            placeholder="Password"
            value={signUpPassword}
            onChange={(e) => setSignUpPassword(e.target.value)}
            required
            className="bg-gray-100 border border-transparent px-4 py-3 my-1 w-full rounded-lg text-xs outline-none focus:border-[#1a1a1a] focus:bg-white transition-all"
          />

          <button
            type="submit"
            className="rounded-full border border-[#1a1a1a] bg-[#1a1a1a] text-white text-xs font-bold py-3 px-11 tracking-wider uppercase transition-all mt-3 hover:shadow-[0_4px_15px_rgba(26,26,26,0.4)] active:scale-95 cursor-pointer"
          >
            Sign Up
          </button>
        </form>
      </div>

      {/* ================= SIGN IN PANEL ================= */}
      <div
        className={`absolute top-0 left-0 w-1/2 h-full z-[2] transition-all duration-1000 ease-[cubic-bezier(0.77,0,0.175,1)] ${
          isRightActive ? 'translate-x-full' : ''
        }`}
      >
        <form
          onSubmit={onSignInSubmit}
          className="bg-white flex flex-col items-center justify-center px-12 h-full text-center"
        >
          <h1 className="font-bold text-2xl text-[#1a1a1a] mb-1">Sign In</h1>

          <div className="my-4 flex items-center justify-center">
            <button
              type="button"
              onClick={() => toast('Social login coming soon!', { icon: 'ℹ️', ...toastConfig })}
              className="w-10 h-10 mx-1 bg-gray-100 rounded-full inline-flex items-center justify-center text-gray-700 hover:text-[#1a1a1a] hover:bg-gray-200 transition-all"
            >
              <FaFacebookF className="text-sm" />
            </button>
            <button
              type="button"
              onClick={() => toast('Google login coming soon!', { icon: 'ℹ️', ...toastConfig })}
              className="w-10 h-10 mx-1 bg-gray-100 rounded-full inline-flex items-center justify-center text-gray-700 hover:text-[#1a1a1a] hover:bg-gray-200 transition-all"
            >
              <FaGoogle className="text-sm" />
            </button>
            <button
              type="button"
              onClick={() => toast('LinkedIn login coming soon!', { icon: 'ℹ️', ...toastConfig })}
              className="w-10 h-10 mx-1 bg-gray-100 rounded-full inline-flex items-center justify-center text-gray-700 hover:text-[#1a1a1a] hover:bg-gray-200 transition-all"
            >
              <FaLinkedinIn className="text-sm" />
            </button>
          </div>

          <span className="text-xs text-gray-500 mb-2">or use your account</span>

          <input
            type="email"
            placeholder="Email Address"
            value={signInEmail}
            onChange={(e) => setSignInEmail(e.target.value)}
            required
            className="bg-gray-100 border border-transparent px-4 py-3 my-1 w-full rounded-lg text-xs outline-none focus:border-[#1a1a1a] focus:bg-white transition-all"
          />

          <input
            type="password"
            placeholder="Password"
            value={signInPassword}
            onChange={(e) => setSignInPassword(e.target.value)}
            required
            className="bg-gray-100 border border-transparent px-4 py-3 my-1 w-full rounded-lg text-xs outline-none focus:border-[#1a1a1a] focus:bg-white transition-all"
          />

          <a
            href="#"
            className="text-gray-500 text-xs mt-3 mb-2 hover:text-[#1a1a1a] underline decoration-gray-300 underline-offset-2 transition-all"
          >
            Forgot your password?
          </a>

          <button
            type="submit"
            className="rounded-full border border-[#1a1a1a] bg-[#1a1a1a] text-white text-xs font-bold py-3 px-11 tracking-wider uppercase transition-all mt-1 hover:shadow-[0_4px_15px_rgba(26,26,26,0.4)] active:scale-95 cursor-pointer"
          >
            Sign In
          </button>
        </form>
      </div>

      {/* ================= SLIDING OVERLAY ================= */}
      <div
        className={`absolute top-0 left-1/2 w-1/2 h-full overflow-hidden z-[100] transition-all duration-1000 ease-[cubic-bezier(0.77,0,0.175,1)] ${
          isRightActive
            ? '-translate-x-full rounded-r-[150px] rounded-l-none'
            : 'rounded-l-[150px] rounded-r-none'
        }`}
      >
        <div
          className={`bg-[#1a1a1a] text-white relative -left-full h-full w-[200%] transition-transform duration-1000 ease-[cubic-bezier(0.77,0,0.175,1)] ${
            isRightActive ? 'translate-x-1/2' : 'translate-x-0'
          }`}
        >
          {/* Overlay Left */}
          <div
            className={`absolute top-0 left-0 w-1/2 h-full flex flex-col items-center justify-center px-10 text-center transition-transform duration-1000 ease-[cubic-bezier(0.77,0,0.175,1)] ${
              isRightActive ? 'translate-x-0' : '-translate-x-[20%]'
            }`}
          >
            <h1 className="font-bold text-2xl text-white">Welcome Back!</h1>
            <p className="text-xs font-light leading-5 tracking-wide text-gray-200 my-5">
              To keep connected with us please login with your personal info
            </p>
            <button
              type="button"
              onClick={() => {
                setIsRightActive(false);
                toast('Switched to Sign In mode', toastConfig);
              }}
              className="rounded-full border border-white bg-transparent text-white text-xs font-bold py-3 px-11 tracking-wider uppercase hover:bg-white/10 hover:shadow-[0_4px_15px_rgba(255,255,255,0.2)] active:scale-95 transition-all cursor-pointer"
            >
              Sign In
            </button>
          </div>

          {/* Overlay Right */}
          <div
            className={`absolute top-0 right-0 w-1/2 h-full flex flex-col items-center justify-center px-10 text-center transition-transform duration-1000 ease-[cubic-bezier(0.77,0,0.175,1)] ${
              isRightActive ? 'translate-x-[20%]' : 'translate-x-0'
            }`}
          >
            <h1 className="font-bold text-2xl text-white">Hello, Friend!</h1>
            <p className="text-xs font-light leading-5 tracking-wide text-gray-200 my-5">
              Enter your personal details and start journey with us
            </p>
            <button
              type="button"
              onClick={() => {
                setIsRightActive(true);
                toast('Switched to Create Account mode', toastConfig);
              }}
              className="rounded-full border border-white bg-transparent text-white text-xs font-bold py-3 px-11 tracking-wider uppercase hover:bg-white/10 hover:shadow-[0_4px_15px_rgba(255,255,255,0.2)] active:scale-95 transition-all cursor-pointer"
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
