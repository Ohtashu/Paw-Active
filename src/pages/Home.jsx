import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { useApp, CLINICS } from '../context/AppContext';
import { IcLocation, IcClock, IcStar, IcBook, IcHistory, IcWallet, IcProfile } from '../components/Icons';

// ─── Clinic card ─────────────────────────────────────────────────────────────
function ClinicCard({ clinic }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      <div className={`h-32 bg-gradient-to-br ${clinic.color} relative flex items-center justify-center`}>
        <svg viewBox="0 0 64 64" className="w-16 h-16 fill-white/25">
          <ellipse cx="10" cy="20" rx="6" ry="8" transform="rotate(-20 10 20)" />
          <ellipse cx="22" cy="12" rx="5.5" ry="7.5" transform="rotate(-8 22 12)" />
          <ellipse cx="42" cy="12" rx="5.5" ry="7.5" transform="rotate(8 42 12)" />
          <ellipse cx="54" cy="20" rx="6" ry="8" transform="rotate(20 54 20)" />
          <ellipse cx="32" cy="42" rx="16" ry="14" />
        </svg>
        <span className="absolute top-3 right-3 bg-white/90 text-emerald-600 text-xs font-semibold px-2.5 py-1 rounded-full">Open</span>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-800 text-sm leading-tight">{clinic.name}</h3>
          <div className="flex items-center gap-1 shrink-0 ml-2">
            <IcStar className="w-3.5 h-3.5 fill-yellow-400" />
            <span className="text-xs font-medium text-gray-600">{clinic.rating}</span>
          </div>
        </div>
        <div className="space-y-1 mb-3">
          <div className="flex items-center gap-1.5"><IcLocation className="w-3 h-3 fill-gray-400" /><span className="text-xs text-gray-500">{clinic.location}</span></div>
          <div className="flex items-center gap-1.5"><IcClock className="w-3 h-3 fill-gray-400" /><span className="text-xs text-gray-500">{clinic.hours}</span></div>
        </div>
        <div className="flex flex-wrap gap-1 mb-3">
          {clinic.tags.map(tag => <span key={tag} className="bg-blue-50 text-blue-600 text-[10px] font-medium px-2 py-0.5 rounded-full">{tag}</span>)}
        </div>
        <Link to="/book" className="block text-center bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-semibold py-2 rounded-xl transition-all">Book Now</Link>
      </div>
    </div>
  );
}

const STATUS_BADGE = {
  pending:     'bg-amber-100 text-amber-700',
  confirmed:   'bg-blue-100 text-blue-700',
  'picked-up': 'bg-indigo-100 text-indigo-700',
  'at-clinic': 'bg-purple-100 text-purple-700',
};

const QUICK = [
  { label: 'Book Now', path: '/book',    bg: 'bg-blue-50',    text: 'text-blue-600',    Icon: IcBook    },
  { label: 'History',  path: '/history', bg: 'bg-emerald-50', text: 'text-emerald-600', Icon: IcHistory },
  { label: 'Wallet',   path: '/wallet',  bg: 'bg-violet-50',  text: 'text-violet-600',  Icon: IcWallet  },
  { label: 'Profile',  path: '/profile', bg: 'bg-orange-50',  text: 'text-orange-500',  Icon: IcProfile },
];

// ─── Main page ───────────────────────────────────────────────────────────────
export default function Home() {
  const { user, wallet, bookings, pets } = useApp();
  const activeBookings = bookings.filter(b => !['completed', 'cancelled'].includes(b.status));
  const greet = () => { const h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'; };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Hero / Wallet card */}
        <div className="relative bg-gradient-to-r from-blue-700 via-blue-600 to-blue-500 rounded-2xl p-6 overflow-hidden text-white shadow-lg shadow-blue-200">
          <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/10 rounded-full" />
          <div className="absolute -bottom-10 right-16 w-28 h-28 bg-white/10 rounded-full" />
          <div className="relative flex items-end justify-between gap-4">
            <div>
              <p className="text-blue-200 text-sm mb-1">{greet()}, {user.name.split(' ')[0]}! 👋</p>
              <p className="text-2xl font-bold">Welcome back!</p>
              <p className="text-blue-100 text-sm mt-1">Your pets deserve the best care.</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-blue-200 text-xs uppercase tracking-wide mb-1">Wallet</p>
              <p className="text-2xl sm:text-3xl font-bold">₱{wallet.balance.toLocaleString()}<span className="text-base sm:text-lg text-blue-200 font-normal">.00</span></p>
              <Link to="/wallet" className="mt-2 inline-block bg-white/20 hover:bg-white/30 text-white text-xs font-semibold px-4 py-1.5 rounded-lg transition">+ Top Up</Link>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {QUICK.map(({ label, path, bg, text, Icon }) => (
            <Link key={label} to={path} className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group">
              <div className={`w-12 h-12 ${bg} ${text} rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform`}>
                <Icon className="w-5 h-5 fill-current" />
              </div>
              <span className="text-xs font-medium text-gray-600">{label}</span>
            </Link>
          ))}
        </div>

        {/* On-going bookings */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-800">On-Going Bookings</h2>
            <Link to="/history" className="text-xs text-blue-600 font-medium hover:underline">View all</Link>
          </div>
          {activeBookings.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-gray-200 py-10 flex flex-col items-center gap-3">
              <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center">
                <IcBook className="w-6 h-6 fill-gray-400" />
              </div>
              <p className="text-sm text-gray-400 font-medium">No on-going bookings</p>
              <Link to="/book" className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-5 py-2 rounded-xl transition active:scale-95">Book an Appointment</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {activeBookings.map(b => {
                const pet = pets.find(p => p.id === b.petId);
                const clinic = CLINICS.find(c => c.id === b.clinicId);
                return (
                  <Link key={b.id} to={`/history/${b.id}`} className="flex items-center gap-4 bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0" style={{ backgroundColor: pet?.color ?? '#e5e7eb' }}>
                      {pet?.species === 'Dog' ? '🐶' : pet?.species === 'Cat' ? '🐱' : '🐾'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 text-sm">{pet?.name ?? 'Pet'}</p>
                      <p className="text-xs text-gray-400 truncate">{b.service} · {clinic?.name}</p>
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${STATUS_BADGE[b.status] ?? 'bg-gray-100 text-gray-500'}`}>
                      {b.status.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* Promo banner */}
        <div className="relative bg-gradient-to-r from-orange-400 to-pink-500 rounded-2xl p-5 overflow-hidden text-white shadow-md shadow-orange-100 flex items-center justify-between">
          <div className="absolute -top-6 -right-6 w-32 h-32 bg-white/10 rounded-full" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-white/70 mb-1">Limited offer</p>
            <p className="text-xl font-bold">Get 12% off</p>
            <p className="text-orange-100 text-sm">on your first booking!</p>
          </div>
          <button className="shrink-0 bg-white text-orange-500 font-bold text-sm px-5 py-2.5 rounded-xl shadow hover:scale-105 transition-transform active:scale-95">Claim Now</button>
        </div>

        {/* Clinics near you */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-800">Clinics Near You</h2>
            <button className="text-xs text-blue-600 font-medium hover:underline">See more</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {CLINICS.map(clinic => <ClinicCard key={clinic.id} clinic={clinic} />)}
          </div>
        </section>

      </div>
    </Layout>
  );
}

