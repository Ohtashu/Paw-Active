import { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { useApp, CLINICS } from '../context/AppContext';
import { IcBook, IcLocation, IcClock, IcChevR } from '../components/Icons';

const STATUS_META = {
  pending:   { label: 'Pending',    color: 'bg-amber-100 text-amber-700',   dot: 'bg-amber-400'  },
  confirmed: { label: 'Confirmed',  color: 'bg-blue-100 text-blue-700',     dot: 'bg-blue-500'   },
  'picked-up': { label: 'Picked Up', color: 'bg-indigo-100 text-indigo-700', dot: 'bg-indigo-500' },
  'at-clinic': { label: 'At Clinic', color: 'bg-purple-100 text-purple-700', dot: 'bg-purple-500' },
  completed: { label: 'Completed',  color: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
  cancelled: { label: 'Cancelled',  color: 'bg-red-100 text-red-500',       dot: 'bg-red-400'   },
};

const FILTERS = ['All', 'Active', 'Completed', 'Cancelled'];

export default function History() {
  const { bookings, pets } = useApp();
  const [filter, setFilter] = useState('All');

  const filtered = bookings.filter(b => {
    if (filter === 'All')       return true;
    if (filter === 'Active')    return ['pending', 'confirmed', 'picked-up', 'at-clinic'].includes(b.status);
    if (filter === 'Completed') return b.status === 'completed';
    if (filter === 'Cancelled') return b.status === 'cancelled';
    return true;
  });

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-5">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Booking History</h1>
          <p className="text-sm text-gray-400">Track and manage all your pet transport bookings</p>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition ${filter === f ? 'bg-blue-600 text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-500 hover:border-gray-300'}`}>
              {f}
              {f === 'Active' && bookings.filter(b => ['pending','confirmed','picked-up','at-clinic'].includes(b.status)).length > 0 && (
                <span className="ml-1.5 bg-blue-200 text-blue-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {bookings.filter(b => ['pending','confirmed','picked-up','at-clinic'].includes(b.status)).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Booking list */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-gray-200 py-14 flex flex-col items-center gap-3">
            <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center">
              <IcBook className="w-6 h-6 fill-gray-300" />
            </div>
            <p className="text-sm text-gray-400 font-medium">No {filter.toLowerCase()} bookings</p>
            <Link to="/book" className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-5 py-2 rounded-xl transition active:scale-95">
              Book Now
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(booking => {
              const pet    = pets.find(p => p.id === booking.petId);
              const clinic = CLINICS.find(c => c.id === booking.clinicId);
              const meta   = STATUS_META[booking.status] ?? STATUS_META.pending;
              return (
                <Link key={booking.id} to={`/history/${booking.id}`}
                  className="block bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">
                  {/* Status accent bar */}
                  <div className={`h-1 w-full ${meta.dot}`} />

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        {pet && (
                          <div className="w-10 h-10 rounded-xl shrink-0 flex items-center justify-center text-lg"
                            style={{ backgroundColor: pet.color }}>
                            {pet.species === 'Dog' ? '🐶' : pet.species === 'Cat' ? '🐱' : '🐾'}
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-gray-800">{pet?.name ?? 'Pet'}</p>
                          <p className="text-xs text-gray-400">{booking.bookingNo}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${meta.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                          {meta.label}
                        </span>
                        <IcChevR className="w-4 h-4 fill-gray-300" />
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium text-gray-600">{booking.service}</span>
                        <span>·</span>
                        <span>{clinic?.name ?? 'Unknown Clinic'}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <IcClock className="w-3.5 h-3.5 fill-gray-400" />
                          <span>{booking.date} · {booking.time}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <IcLocation className="w-3.5 h-3.5 fill-gray-400" />
                        <span className="truncate">{booking.pickupAddress}</span>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
                      <span className="text-xs text-gray-400">Amount paid</span>
                      <span className="font-bold text-gray-800">₱{booking.price.toLocaleString()}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
