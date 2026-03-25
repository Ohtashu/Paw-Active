import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  signInWithEmailAndPassword,
  signInWithPopup,
} from 'firebase/auth';
import {
  auth,
  googleProvider,
  twitterProvider,
  facebookProvider,
} from '../firebase';

// ---------------------------------------------------------------------------
// Social icon SVGs (inline, no external dependency needed)
// ---------------------------------------------------------------------------

const GoogleIcon = () => (
  <svg viewBox="0 0 48 48" className="w-6 h-6" aria-hidden="true">
    <path fill="#EA4335" d="M24 9.5c3.14 0 5.95 1.08 8.17 2.85l6.08-6.08C34.42 3.08 29.46 1 24 1 14.8 1 7.02 6.7 3.82 14.72l7.06 5.49C12.6 13.66 17.84 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.52 24.5c0-1.56-.14-3.06-.4-4.5H24v8.5h12.66c-.55 2.93-2.2 5.41-4.68 7.08l7.18 5.58C43.44 37.06 46.52 31.26 46.52 24.5z"/>
    <path fill="#FBBC05" d="M10.88 28.79A14.54 14.54 0 0 1 9.5 24c0-1.68.29-3.3.8-4.79L3.24 13.72A23.94 23.94 0 0 0 1 24c0 3.88.93 7.55 2.57 10.79l7.31-5.99z"/>
    <path fill="#34A853" d="M24 47c5.46 0 10.04-1.81 13.38-4.93l-7.18-5.58c-1.99 1.33-4.54 2.01-6.2 2.01-6.16 0-11.4-4.16-13.12-9.71l-7.31 5.99C7.02 41.3 14.8 47 24 47z"/>
    <path fill="none" d="M1 1h46v46H1z"/>
  </svg>
);

const TwitterIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6 fill-[#1DA1F2]" aria-hidden="true">
    <path d="M22.46 6c-.77.35-1.6.58-2.46.69a4.27 4.27 0 0 0 1.88-2.36 8.54 8.54 0 0 1-2.71 1.04 4.26 4.26 0 0 0-7.26 3.88A12.09 12.09 0 0 1 3.16 4.87a4.26 4.26 0 0 0 1.32 5.69 4.23 4.23 0 0 1-1.93-.53v.05a4.26 4.26 0 0 0 3.42 4.18 4.28 4.28 0 0 1-1.92.07 4.27 4.27 0 0 0 3.98 2.96A8.54 8.54 0 0 1 2 19.54a12.07 12.07 0 0 0 6.54 1.92c7.85 0 12.14-6.5 12.14-12.14l-.01-.55A8.66 8.66 0 0 0 22.46 6z"/>
  </svg>
);

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6 fill-[#1877F2]" aria-hidden="true">
    <path d="M22 12a10 10 0 1 0-11.562 9.876V15.09h-2.54v-3.09h2.54v-2.36c0-2.508 1.492-3.894 3.777-3.894 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 3.09H13.563v6.786A10.003 10.003 0 0 0 22 12z"/>
  </svg>
);

// ---------------------------------------------------------------------------
// PawLogo — simple inline SVG paw print for the header badge
// ---------------------------------------------------------------------------
const PawLogo = () => (
  <svg viewBox="0 0 64 64" className="w-12 h-12" fill="white" aria-label="Paw Active logo">
    {/* Left outer toe */}
    <ellipse cx="10" cy="20" rx="6" ry="8" transform="rotate(-20 10 20)" />
    {/* Left inner toe */}
    <ellipse cx="22" cy="12" rx="5.5" ry="7.5" transform="rotate(-8 22 12)" />
    {/* Right inner toe */}
    <ellipse cx="42" cy="12" rx="5.5" ry="7.5" transform="rotate(8 42 12)" />
    {/* Right outer toe */}
    <ellipse cx="54" cy="20" rx="6" ry="8" transform="rotate(20 54 20)" />
    {/* Main paw pad */}
    <ellipse cx="32" cy="42" rx="16" ry="14" />
  </svg>
);

// ---------------------------------------------------------------------------
// Login component
// ---------------------------------------------------------------------------
export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setError('');
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  /** Map a Firebase auth error code to a friendly message. */
  const friendlyError = (code) => {
    switch (code) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Invalid email or password.';
      case 'auth/too-many-requests':
        return 'Too many attempts. Please try again later.';
      case 'auth/user-disabled':
        return 'This account has been disabled.';
      case 'auth/popup-closed-by-user':
        return 'Sign-in popup was closed. Please try again.';
      case 'auth/account-exists-with-different-credential':
        return 'An account already exists with a different sign-in method.';
      default:
        return 'Login failed. Please try again.';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.email || !form.password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);

    try {
      const { user } = await signInWithEmailAndPassword(auth, form.email, form.password);
      console.log('Signed in:', user.email);
      navigate('/home');
    } catch (err) {
      setError(friendlyError(err.code));
    } finally {
      setLoading(false);
    }
  };

  /** Social (OAuth) login via Firebase popup. */
  const handleSocialLogin = async (providerName) => {
    const providerMap = {
      Google:   googleProvider,
      Twitter:  twitterProvider,
      Facebook: facebookProvider,
    };
    const provider = providerMap[providerName];
    if (!provider) return;

    setError('');
    try {
      const { user } = await signInWithPopup(auth, provider);
      console.log(`Signed in with ${providerName}:`, user.displayName);
      navigate('/home');
    } catch (err) {
      setError(friendlyError(err.code));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10"
         style={{ background: 'linear-gradient(160deg, #1e40af 0%, #2563eb 45%, #e0f2fe 100%)' }}>

      {/* ── Card ─────────────────────────────────────────────────── */}
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden">

        {/* ── Blue header with logo ─────────────────────────────── */}
        <div className="relative bg-blue-700 pb-14 pt-8 flex flex-col items-center">
          {/* Curved bottom edge */}
          <div
            className="absolute inset-x-0 bottom-0 h-14 bg-white"
            style={{ borderRadius: '50% 50% 0 0 / 100% 100% 0 0' }}
          />

          {/* Logo badge */}
          <div className="relative z-10 bg-blue-600 rounded-full p-4 shadow-lg ring-4 ring-blue-400/40">
            <PawLogo />
          </div>

          {/* App name */}
          <p className="relative z-10 mt-3 text-white font-bold text-xl tracking-wide">
            Paw Active
          </p>
        </div>

        {/* ── Form body ─────────────────────────────────────────── */}
        <div className="px-8 pt-6 pb-8">
          <h2 className="text-center text-gray-800 font-semibold text-lg mb-6">
            Sign in to your account
          </h2>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-600 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <div className="mb-4">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-600 mb-1"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 placeholder-gray-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
            </div>

            {/* Password */}
            <div className="mb-6">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-600 mb-1"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 placeholder-gray-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
            </div>

            {/* Login button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-blue-600 py-3 text-white font-semibold text-sm tracking-wide shadow-md transition hover:bg-blue-700 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in…' : 'Login'}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <hr className="flex-1 border-gray-200" />
            <span className="text-xs text-gray-400 font-medium">Or</span>
            <hr className="flex-1 border-gray-200" />
          </div>

          {/* Social buttons */}
          <div className="flex justify-center gap-4">
            {[
              { label: 'Google',   Icon: GoogleIcon   },
              { label: 'Twitter',  Icon: TwitterIcon  },
              { label: 'Facebook', Icon: FacebookIcon },
            ].map(({ label, Icon }) => (
              <button
                key={label}
                type="button"
                onClick={() => handleSocialLogin(label)}
                aria-label={`Sign in with ${label}`}
                className="flex items-center justify-center w-12 h-12 rounded-full border border-gray-200 bg-gray-50 shadow-sm transition hover:border-blue-300 hover:bg-white active:scale-95"
              >
                <Icon />
              </button>
            ))}
          </div>

          {/* Forgot password link */}
          <div className="text-right -mt-1">
            <Link to="/forgot-password" className="text-xs text-blue-600 hover:underline font-medium">Forgot password?</Link>
          </div>

          {/* Sign-up footer */}
          <p className="mt-6 text-center text-sm text-gray-500">
            Don&apos;t have an account?{' '}
            <Link to="/signup" className="font-semibold text-blue-600 hover:underline">Sign Up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
