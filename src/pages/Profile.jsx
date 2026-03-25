import { useState } from 'react';
import { Link } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useApp } from '../context/AppContext';
import { IcEdit, IcCheck, IcPaw, IcWallet, IcLogout } from '../components/Icons';

export default function Profile() {
  const { user, updateUser, pets, wallet } = useApp();
  const navigate = useNavigate();
  const [editMode, setEditMode] = useState(false);
  const [form, setForm]         = useState({ ...user });
  const [toast, setToast]       = useState('');

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
  const inp = 'w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 placeholder-gray-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200';

  const save = () => {
    updateUser(form);
    setEditMode(false);
    setToast('Profile updated!');
    setTimeout(() => setToast(''), 3000);
  };

  const handleLogout = async () => {
    await signOut(auth).catch(() => {});
    navigate('/', { replace: true });
  };

  return (
    <Layout>
      <div className="max-w-lg mx-auto space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-800">My Profile</h1>
            <p className="text-sm text-gray-400">Manage your account information</p>
          </div>
        </div>

        {toast && (
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-sm text-emerald-700 font-medium">
            <IcCheck className="w-4 h-4 fill-emerald-500 shrink-0" /> {toast}
          </div>
        )}

        {/* Avatar + personal info card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Avatar section */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-8 text-center relative">
            <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-black text-3xl mx-auto mb-3 shadow-lg">
              {user.name.charAt(0)}
            </div>
            <p className="text-white font-bold text-lg">{user.name}</p>
            <p className="text-blue-200 text-sm">{user.email}</p>
          </div>

          {/* Info fields */}
          <div className="px-5 py-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-800 text-sm">Personal Information</h2>
              {!editMode && (
                <button onClick={() => { setForm({ ...user }); setEditMode(true); }}
                  className="flex items-center gap-1.5 text-blue-600 text-sm font-medium hover:bg-blue-50 px-3 py-1.5 rounded-xl transition">
                  <IcEdit className="w-4 h-4 fill-blue-600" /> Edit
                </button>
              )}
            </div>

            {editMode ? (
              <div className="space-y-3">
                {[
                  { label: 'Full Name',     key: 'name',    type: 'text',  ph: 'Juan Dela Cruz'       },
                  { label: 'Email Address', key: 'email',   type: 'email', ph: 'you@example.com'      },
                  { label: 'Phone Number',  key: 'phone',   type: 'tel',   ph: '+63 912 345 6789'     },
                  { label: 'Home Address',  key: 'address', type: 'text',  ph: '123 Rizal St, Bulacan'},
                ].map(({ label, key, type, ph }) => (
                  <div key={key}>
                    <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
                    <input className={inp} type={type} placeholder={ph} value={form[key] ?? ''} onChange={set(key)} />
                  </div>
                ))}
                <div className="flex gap-2 pt-1">
                  <button onClick={save}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl transition active:scale-95">
                    Save Changes
                  </button>
                  <button onClick={() => setEditMode(false)}
                    className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 transition">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                {[
                  { label: 'Full Name', value: user.name    },
                  { label: 'Email',     value: user.email   },
                  { label: 'Phone',     value: user.phone   },
                  { label: 'Address',   value: user.address },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                    <p className="text-gray-700 font-medium">{value || ''}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick links */}
        <div className="space-y-3">
          {/* My Pets */}
          <Link to="/pets"
            className="flex items-center gap-4 bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 hover:shadow-md hover:border-blue-100 transition group">
            <div className="w-11 h-11 bg-orange-50 rounded-xl flex items-center justify-center group-hover:bg-orange-100 transition">
              <IcPaw className="w-5 h-5 fill-orange-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-800 text-sm">My Pets</p>
              <p className="text-xs text-gray-400">{pets.length} pet{pets.length !== 1 ? 's' : ''} registered</p>
            </div>
            <svg className="w-4 h-4 fill-gray-300 group-hover:fill-blue-400 transition" viewBox="0 0 24 24">
              <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6-6-6z"/>
            </svg>
          </Link>

          {/* Wallet */}
          <Link to="/wallet"
            className="flex items-center gap-4 bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 hover:shadow-md hover:border-blue-100 transition group">
            <div className="w-11 h-11 bg-violet-50 rounded-xl flex items-center justify-center group-hover:bg-violet-100 transition">
              <IcWallet className="w-5 h-5 fill-violet-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-800 text-sm">Wallet</p>
              <p className="text-xs text-gray-400">Balance: <span className="font-semibold text-gray-600">{wallet.balance.toLocaleString()}</span></p>
            </div>
            <svg className="w-4 h-4 fill-gray-300 group-hover:fill-blue-400 transition" viewBox="0 0 24 24">
              <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6-6-6z"/>
            </svg>
          </Link>
        </div>

        {/* Sign out */}
        <button onClick={handleLogout}
          className="w-full flex items-center gap-4 bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 hover:bg-red-50 hover:border-red-100 transition group">
          <div className="w-11 h-11 bg-red-50 rounded-xl flex items-center justify-center group-hover:bg-red-100 transition">
            <IcLogout className="w-5 h-5 fill-red-500" />
          </div>
          <span className="text-sm font-semibold text-red-500">Sign Out</span>
        </button>

      </div>
    </Layout>
  );
}
