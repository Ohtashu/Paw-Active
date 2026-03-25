import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase';
import { IcPaw } from '../components/Icons';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step,    setStep]  = useState(1); // 1=email, 2=otp, 3=new password, 4=done
  const [email,   setEmail] = useState('');
  const [otp,     setOtp]   = useState('');
  const [pw,      setPw]    = useState({ new: '', confirm: '' });
  const [loading, setLoad]  = useState(false);
  const [error,   setError] = useState('');

  const inputCls = 'w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 placeholder-gray-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200';

  const handleSendEmail = async (e) => {
    e.preventDefault();
    setError('');
    if (!email) return setError('Please enter your email.');
    setLoad(true);
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err) {
      // Proceed in mock mode even if Firebase throws (e.g. user not found)
    } finally {
      setLoad(false);
      setStep(2);
    }
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    setError('');
    if (otp !== '654321') return setError('Incorrect OTP. Use 654321 for demo.');
    setStep(3);
  };

  const handleResetPw = (e) => {
    e.preventDefault();
    setError('');
    if (!pw.new || !pw.confirm) return setError('Please fill in both fields.');
    if (pw.new.length < 6) return setError('Password must be at least 6 characters.');
    if (pw.new !== pw.confirm) return setError('Passwords do not match.');
    setStep(4);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10"
      style={{ background: 'linear-gradient(160deg, #1e40af 0%, #2563eb 45%, #e0f2fe 100%)' }}>
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="relative bg-blue-700 pb-12 pt-8 flex flex-col items-center">
          <div className="absolute inset-x-0 bottom-0 h-12 bg-white" style={{ borderRadius: '50% 50% 0 0 / 100% 100% 0 0' }} />
          <div className="relative z-10 bg-blue-600 rounded-full p-4 shadow-lg ring-4 ring-blue-400/40">
            <IcPaw className="w-10 h-10 fill-white" />
          </div>
          <p className="relative z-10 mt-3 text-white font-bold text-xl">Paw<span className="text-blue-200">Active</span></p>
        </div>

        <div className="px-8 pt-6 pb-8">

          {/* Step 1 — Enter email */}
          {step === 1 && (
            <>
              <div className="text-center mb-6">
                <div className="text-3xl mb-2">🔐</div>
                <h2 className="text-gray-800 font-semibold text-lg">Reset Password</h2>
                <p className="text-xs text-gray-400 mt-1">Enter your registered email and we'll send you a reset code.</p>
              </div>
              {error && <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-600 text-center">{error}</div>}
              <form onSubmit={handleSendEmail} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Email Address</label>
                  <input className={inputCls} type="email" placeholder="you@example.com" value={email} onChange={(e) => { setError(''); setEmail(e.target.value); }} />
                </div>
                <button type="submit" disabled={loading}
                  className="w-full rounded-xl bg-blue-600 py-3 text-white font-semibold text-sm transition hover:bg-blue-700 active:scale-95 disabled:opacity-60">
                  {loading ? 'Sending…' : 'Send Reset Code'}
                </button>
              </form>
            </>
          )}

          {/* Step 2 — OTP */}
          {step === 2 && (
            <>
              <div className="text-center mb-6">
                <div className="text-3xl mb-2">📩</div>
                <h2 className="text-gray-800 font-semibold text-lg">Check Your Email</h2>
                <p className="text-xs text-gray-400 mt-1">Enter the 6-digit code sent to<br /><strong>{email}</strong></p>
                <p className="text-xs text-amber-600 mt-2 font-medium">Demo OTP: <strong>654321</strong></p>
              </div>
              {error && <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-600 text-center">{error}</div>}
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <input className={`${inputCls} text-center text-2xl tracking-[0.5rem] font-bold`}
                  maxLength={6} placeholder="000000" value={otp}
                  onChange={(e) => { setError(''); setOtp(e.target.value); }} />
                <button type="submit"
                  className="w-full rounded-xl bg-blue-600 py-3 text-white font-semibold text-sm transition hover:bg-blue-700 active:scale-95">
                  Verify Code
                </button>
              </form>
            </>
          )}

          {/* Step 3 — New password */}
          {step === 3 && (
            <>
              <div className="text-center mb-6">
                <div className="text-3xl mb-2">🔑</div>
                <h2 className="text-gray-800 font-semibold text-lg">Create New Password</h2>
                <p className="text-xs text-gray-400 mt-1">Your new password must be at least 6 characters.</p>
              </div>
              {error && <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-600 text-center">{error}</div>}
              <form onSubmit={handleResetPw} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">New Password</label>
                  <input className={inputCls} type="password" placeholder="••••••••" value={pw.new}
                    onChange={(e) => { setError(''); setPw(p => ({ ...p, new: e.target.value })); }} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Confirm Password</label>
                  <input className={inputCls} type="password" placeholder="••••••••" value={pw.confirm}
                    onChange={(e) => { setError(''); setPw(p => ({ ...p, confirm: e.target.value })); }} />
                </div>
                <button type="submit"
                  className="w-full rounded-xl bg-blue-600 py-3 text-white font-semibold text-sm transition hover:bg-blue-700 active:scale-95">
                  Reset Password
                </button>
              </form>
            </>
          )}

          {/* Step 4 — Done */}
          {step === 4 && (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">✅</span>
              </div>
              <h2 className="text-gray-800 font-semibold text-lg mb-2">Password Reset!</h2>
              <p className="text-sm text-gray-500 mb-6">Your password has been updated. You can now sign in.</p>
              <button onClick={() => navigate('/')}
                className="w-full rounded-xl bg-blue-600 py-3 text-white font-semibold text-sm transition hover:bg-blue-700 active:scale-95">
                Back to Login
              </button>
            </div>
          )}

          {step < 4 && (
            <p className="mt-6 text-center text-sm text-gray-500">
              Remember your password?{' '}
              <Link to="/" className="font-semibold text-blue-600 hover:underline">Sign In</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
