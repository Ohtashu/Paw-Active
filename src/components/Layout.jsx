import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useApp, CLINICS } from '../context/AppContext';
import {
  IcHome, IcBook, IcHistory, IcWallet, IcProfile,
  IcBell, IcLogout, IcPaw, IcMenu, IcClose,
} from './Icons';

const NOTIF_ICONS = { pending: '📋', confirmed: '✅', 'picked-up': '🚗', 'at-clinic': '🏥', completed: '🎉', cancelled: '❌' };
const NOTIF_COLORS = {
  pending: 'bg-amber-50 border-amber-100',
  confirmed: 'bg-blue-50 border-blue-100',
  'picked-up': 'bg-indigo-50 border-indigo-100',
  'at-clinic': 'bg-purple-50 border-purple-100',
  completed: 'bg-emerald-50 border-emerald-100',
  cancelled: 'bg-red-50 border-red-100',
};

const NAV = [
  { label: 'Home',     path: '/home',    Icon: IcHome,    mobileNav: true  },
  { label: 'Book',     path: '/book',    Icon: IcBook,    mobileNav: true  },
  { label: 'History',  path: '/history', Icon: IcHistory, mobileNav: true  },
  { label: 'My Pets',  path: '/pets',    Icon: IcPaw,     mobileNav: true  },
  { label: 'Wallet',   path: '/wallet',  Icon: IcWallet,  mobileNav: false },
  { label: 'Profile',  path: '/profile', Icon: IcProfile, mobileNav: true  },
];

function SidebarContent({ pathname, onNav, onLogout, wallet, user }) {
  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-2.5">
        <div className="bg-blue-600 rounded-xl p-2 shrink-0">
          <IcPaw className="w-5 h-5 fill-white" />
        </div>
        <span className="font-bold text-gray-800 text-xl tracking-tight">
          Paw<span className="text-blue-600">Active</span>
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map(({ label, path, Icon }) => {
          const active = pathname === path || pathname.startsWith(path + '/');
          return (
            <Link
              key={path}
              to={path}
              onClick={onNav}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                active ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
              }`}
            >
              <Icon className={`w-5 h-5 fill-current ${active ? 'text-blue-600' : 'text-gray-400'}`} />
              {label}
              {label === 'History' && <span className="ml-auto bg-blue-100 text-blue-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">2</span>}
            </Link>
          );
        })}
      </nav>

      {/* Wallet mini-card */}
      <div className="mx-3 mb-3 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-4 text-white shadow-md shadow-blue-200">
        <p className="text-blue-200 text-xs mb-1 uppercase tracking-wide font-medium">Wallet Balance</p>
        <p className="text-2xl font-bold">
          ₱{wallet.balance.toLocaleString()}
          <span className="text-sm font-normal">.00</span>
        </p>
        <Link
          to="/wallet"
          onClick={onNav}
          className="mt-3 inline-flex items-center gap-1 bg-white/20 hover:bg-white/30 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition"
        >
          + Top Up
        </Link>
      </div>

      {/* User + Logout */}
      <div className="px-3 pb-4 border-t border-gray-100 pt-3 space-y-1">
        <div className="flex items-center gap-3 px-4 py-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-xs shrink-0">
            {user.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-700 truncate">{user.name}</p>
            <p className="text-xs text-gray-400 truncate">{user.email}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-500 transition-all duration-150"
        >
          <IcLogout className="w-5 h-5 fill-current" />
          Sign Out
        </button>
      </div>
    </div>
  );
}

export default function Layout({ children }) {
  const { user, wallet, authUser, bookings, pets } = useApp();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);

  // Prevent rendering layout when not authenticated (fixes back-button sidebar peek)
  if (!authUser) return null;

  const notifications = bookings
    .filter(b => b.statusHistory && b.statusHistory.length > 0)
    .map(b => {
      const latest = b.statusHistory[b.statusHistory.length - 1];
      const pet = pets.find(p => p.id === b.petId);
      const clinic = CLINICS.find(c => c.id === b.clinicId);
      return { bookingNo: b.bookingNo, bookingId: b.id, petName: pet?.name, clinicName: clinic?.name, ...latest };
    })
    .slice(0, 15);

  const handleLogout = async () => {
    await signOut(auth).catch(() => {});
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-100 fixed top-0 left-0 h-full z-20">
        <SidebarContent pathname={pathname} onNav={() => {}} onLogout={handleLogout} wallet={wallet} user={user} />
      </aside>

      {/* Mobile sidebar overlay */}
      {menuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMenuOpen(false)} />
          <aside className="relative z-50 w-64 bg-white h-full shadow-2xl">
            <button onClick={() => setMenuOpen(false)} className="absolute top-4 right-4 p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition">
              <IcClose className="w-4 h-4 fill-gray-500" />
            </button>
            <SidebarContent pathname={pathname} onNav={() => setMenuOpen(false)} onLogout={handleLogout} wallet={wallet} user={user} />
          </aside>
        </div>
      )}

      {/* Main area */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Topbar */}
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100 px-5 py-3.5 flex items-center gap-4">
          <button
            className="lg:hidden p-2 rounded-xl hover:bg-gray-100 transition"
            onClick={() => setMenuOpen(true)}
          >
            <IcMenu className="w-5 h-5 fill-gray-600" />
          </button>
          <div className="flex-1" />

          {/* Notification bell */}
          <div className="relative">
            <button onClick={() => setShowNotifs(prev => !prev)} className="relative p-2 rounded-xl bg-gray-50 hover:bg-gray-100 transition">
              <IcBell className="w-5 h-5 fill-gray-500" />
              {notifications.length > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />}
            </button>

            {showNotifs && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowNotifs(false)} />
                <div className="absolute right-0 top-12 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="font-bold text-gray-800 text-sm">Notifications</h3>
                    <span className="text-[10px] bg-blue-100 text-blue-600 font-semibold px-2 py-0.5 rounded-full">{notifications.length}</span>
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                    {notifications.length === 0 ? (
                      <div className="py-10 text-center">
                        <p className="text-3xl mb-2">🔔</p>
                        <p className="text-sm text-gray-400">No notifications yet</p>
                      </div>
                    ) : (
                      notifications.map((n, i) => (
                        <Link
                          key={i}
                          to={`/history/${n.bookingId}`}
                          onClick={() => setShowNotifs(false)}
                          className={`flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition ${NOTIF_COLORS[n.status] || ''}`}
                        >
                          <span className="text-xl mt-0.5">{NOTIF_ICONS[n.status] || '📋'}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-800 leading-tight">{n.label}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{n.petName && `${n.petName} · `}{n.bookingNo}</p>
                            <p className="text-[11px] text-gray-400 mt-0.5">{n.time}</p>
                          </div>
                        </Link>
                      ))
                    )}
                  </div>
                  {notifications.length > 0 && (
                    <Link to="/history" onClick={() => setShowNotifs(false)}
                      className="block text-center text-xs font-semibold text-blue-600 py-3 border-t border-gray-100 hover:bg-blue-50 transition">
                      View All Bookings
                    </Link>
                  )}
                </div>
              </>
            )}
          </div>

          {/* User profile avatar */}
          <button
            onClick={() => navigate('/profile')}
            className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-sm cursor-pointer hover:ring-2 hover:ring-blue-300 transition"
          >
            {user.name.charAt(0)}
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 px-4 sm:px-6 py-6 pb-24 lg:pb-8 max-w-5xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Mobile bottom nav — shows 5 items (Wallet accessible via Profile/Home) */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gray-100 z-20 flex safe-bottom">
        {NAV.filter(n => n.mobileNav).map(({ label, path, Icon }) => {
          const active = pathname === path || pathname.startsWith(path + '/');
          return (
            <Link key={path} to={path} className="flex-1 flex flex-col items-center gap-1 py-2.5 transition">
              <Icon className={`w-5 h-5 fill-current ${active ? 'text-blue-600' : 'text-gray-400'}`} />
              <span className={`text-[10px] font-medium ${active ? 'text-blue-600' : 'text-gray-400'}`}>{label.replace(' Now', '')}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
