import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { IcPaw } from '../components/Icons';

export default function SignUp() {
  const navigate = useNavigate();
  const [step, setStep]     = useState(1); // 1 = details, 2 = verify (mock OTP)
  const [form, setForm]     = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [otp,  setOtp]      = useState('');
  const [loading, setLoad]  = useState(false);
  const [error, setError]   = useState('');
  const [success, setSucc]  = useState('');

  const set = (k) => (e) => { setError(''); setForm(f => ({ ...f, [k]: e.target.value })); };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.email || !form.phone || !form.password || !form.confirm)
      return setError('All fields are required.');
    if (form.password.length < 6)
      return setError('Password must be at least 6 characters.');
    if (form.password !== form.confirm)
      return setError('Passwords do not match.');

    setLoad(true);
    try {
      const { user } = await createUserWithEmailAndPassword(auth, form.email, form.password);
      await updateProfile(user, { displayName: form.name });
      // Create Firestore user profile + wallet
      await setDoc(doc(db, 'users', user.uid), {
        name: form.name,
        email: form.email,
        phone: form.phone,
        address: '',
        createdAt: new Date().toISOString().slice(0, 10),
      });
      await setDoc(doc(db, 'users', user.uid, 'wallet', 'main'), {
        balance: 0,
        transactions: [],
      });
      setStep(2);
    } catch (err) {
      console.error('Registration error:', err.code, err.message);
      if (err.code === 'auth/email-already-in-use') setError('Email already registered.');
      else if (err.code === 'auth/invalid-email')   setError('Invalid email address.');
      else setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoad(false);
    }
  };

  const handleVerify = (e) => {
    e.preventDefault();
    setError('');
    if (otp !== '123456') return setError('Incorrect OTP. Use 123456 for demo.');
    navigate('/home');
  };

  const inputCls = 'w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 placeholder-gray-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200';
  const labelCls = 'block text-sm font-medium text-gray-600 mb-1';

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
          <p className="relative z-10 mt-3 text-white font-bold text-xl tracking-wide">Paw<span className="text-blue-200">Active</span></p>
        </div>

        <div className="px-8 pt-6 pb-8">
          {step === 1 ? (
            <>
              <h2 className="text-center text-gray-800 font-semibold text-lg mb-1">Create Account</h2>
              <p className="text-center text-xs text-gray-400 mb-5">Join thousands of furparents today</p>

              {error && <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-600 text-center">{error}</div>}

              <form onSubmit={handleRegister} noValidate className="space-y-4">
                <div>
                  <label className={labelCls}>Full Name</label>
                  <input className={inputCls} placeholder="Juan Dela Cruz" value={form.name} onChange={set('name')} />
                </div>
                <div>
                  <label className={labelCls}>Email Address</label>
                  <input className={inputCls} type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} />
                </div>
                <div>
                  <label className={labelCls}>Phone Number</label>
                  <input className={inputCls} type="tel" placeholder="+63 912 345 6789" value={form.phone} onChange={set('phone')} />
                </div>
                <div>
                  <label className={labelCls}>Password</label>
                  <input className={inputCls} type="password" placeholder="Min. 6 characters" value={form.password} onChange={set('password')} />
                </div>
                <div>
                  <label className={labelCls}>Confirm Password</label>
                  <input className={inputCls} type="password" placeholder="Repeat password" value={form.confirm} onChange={set('confirm')} />
                </div>
                <button type="submit" disabled={loading}
                  className="w-full mt-2 rounded-xl bg-blue-600 py-3 text-white font-semibold text-sm tracking-wide shadow-md transition hover:bg-blue-700 active:scale-95 disabled:opacity-60">
                  {loading ? 'Creating account…' : 'Create Account'}
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="text-center mb-6">
                <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">📱</span>
                </div>
                <h2 className="text-gray-800 font-semibold text-lg">Verify Your Account</h2>
                <p className="text-xs text-gray-400 mt-1">Enter the 6-digit OTP sent to<br /><strong>{form.phone || form.email}</strong></p>
                <p className="text-xs text-amber-600 mt-2 font-medium">Demo OTP: <strong>123456</strong></p>
              </div>

              {error && <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-600 text-center">{error}</div>}

              <form onSubmit={handleVerify} className="space-y-4">
                <input
                  className={`${inputCls} text-center text-2xl tracking-[0.5rem] font-bold`}
                  maxLength={6} placeholder="000000"
                  value={otp} onChange={(e) => { setError(''); setOtp(e.target.value); }}
                />
                <button type="submit"
                  className="w-full rounded-xl bg-blue-600 py-3 text-white font-semibold text-sm transition hover:bg-blue-700 active:scale-95">
                  Verify & Continue
                </button>
                <button type="button" onClick={() => setStep(1)} className="w-full text-xs text-gray-400 hover:text-gray-600 py-1">
                  ← Back
                </button>
              </form>
            </>
          )}

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/" className="font-semibold text-blue-600 hover:underline">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
