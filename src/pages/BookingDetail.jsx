import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { useApp, CLINICS } from '../context/AppContext';
import { IcChevL, IcCheck, IcClose, IcLocation, IcClock } from '../components/Icons';

const STATUS_ORDER = ['pending', 'confirmed', 'picked-up', 'at-clinic', 'completed'];

const STATUS_META = {
  pending:     { label: 'Booking Submitted',  icon: '📋', color: 'bg-amber-500'  },
  confirmed:   { label: 'Clinic Confirmed',   icon: '✅', color: 'bg-blue-500'   },
  'picked-up': { label: 'Pet Picked Up',      icon: '🚗', color: 'bg-indigo-500' },
  'at-clinic': { label: 'Arrived at Clinic',  icon: '🏥', color: 'bg-purple-500' },
  completed:   { label: 'Service Completed',  icon: '🎉', color: 'bg-emerald-500'},
  cancelled:   { label: 'Booking Cancelled',  icon: '❌', color: 'bg-red-400'    },
};

const BADGE = {
  pending:     'bg-amber-100 text-amber-700',
  confirmed:   'bg-blue-100 text-blue-700',
  'picked-up': 'bg-indigo-100 text-indigo-700',
  'at-clinic': 'bg-purple-100 text-purple-700',
  completed:   'bg-emerald-100 text-emerald-700',
  cancelled:   'bg-red-100 text-red-500',
};

export default function BookingDetail() {
  const { id }             = useParams();
  const navigate           = useNavigate();
  const { bookings, pets, cancelBooking } = useApp();
  const [confirmCancel, setConfirmCancel] = useState(false);

  const booking = bookings.find(b => b.id === id);

  if (!booking) {
    return (
      <Layout>
        <div className="text-center py-20">
          <p className="text-gray-400">Booking not found.</p>
          <Link to="/history" className="text-blue-600 font-semibold text-sm mt-2 block hover:underline">← Back to History</Link>
        </div>
      </Layout>
    );
  }

  const pet    = pets.find(p => p.id === booking.petId);
  const clinic = CLINICS.find(c => c.id === booking.clinicId);

  const canCancel = ['pending', 'confirmed'].includes(booking.status);

  const handleCancel = () => {
    cancelBooking(booking.id);
    setConfirmCancel(false);
    navigate('/history');
  };

  // Build timeline: completed statuses + current + future (if not cancelled)
  const isCancelled  = booking.status === 'cancelled';
  const currentIndex = STATUS_ORDER.indexOf(booking.status);

  return (
    <Layout>
      <div className="max-w-lg mx-auto space-y-5">
        {/* Back */}
        <Link to="/history" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition font-medium">
          <IcChevL className="w-4 h-4 fill-gray-400" /> Back to History
        </Link>

        {/* Header card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className={`h-2 w-full ${STATUS_META[booking.status]?.color ?? 'bg-gray-300'}`} />
          <div className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs text-gray-400 mb-1">Booking Number</p>
                <p className="font-bold text-blue-700 text-lg">{booking.bookingNo}</p>
                <p className="text-xs text-gray-400 mt-1">Booked {booking.createdAt}</p>
              </div>
              <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${BADGE[booking.status]}`}>
                {booking.status.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase())}
              </span>
            </div>
          </div>
        </div>

        {/* Pet + service summary */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
          <h2 className="font-semibold text-gray-800">Booking Details</h2>

          {pet && (
            <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0"
                style={{ backgroundColor: pet.color }}>
                {pet.species === 'Dog' ? '🐶' : pet.species === 'Cat' ? '🐱' : '🐾'}
              </div>
              <div>
                <p className="font-semibold text-gray-800 text-sm">{pet.name}</p>
                <p className="text-xs text-gray-400">{pet.breed || pet.species} · {pet.size}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              { label: 'Service',  value: booking.service },
              { label: 'Clinic',   value: clinic?.name },
              { label: 'Date',     value: booking.date },
              { label: 'Time',     value: booking.time },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                <p className="font-medium text-gray-700">{value ?? '—'}</p>
              </div>
            ))}
          </div>

          <div className="space-y-2 text-sm">
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Pickup Address</p>
              <div className="flex items-start gap-1.5">
                <IcLocation className="w-3.5 h-3.5 fill-gray-400 mt-0.5 shrink-0" />
                <p className="font-medium text-gray-700">{booking.pickupAddress}</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Drop-off Address</p>
              <div className="flex items-start gap-1.5">
                <IcLocation className="w-3.5 h-3.5 fill-blue-400 mt-0.5 shrink-0" />
                <p className="font-medium text-gray-700">{booking.dropoffAddress}</p>
              </div>
            </div>
            {booking.instructions && (
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Special Instructions</p>
                <p className="font-medium text-gray-700 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2 text-xs">{booking.instructions}</p>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-gray-100">
            <span className="text-sm text-gray-400">Amount Paid</span>
            <span className="font-bold text-gray-800 text-lg">₱{booking.price.toLocaleString()}</span>
          </div>
        </div>

        {/* Status timeline */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold text-gray-800 mb-5">Booking Status</h2>

          <div className="space-y-0">
            {isCancelled ? (
              // Show completed steps + cancellation
              [...booking.statusHistory].map((event, i) => {
                const isLast = i === booking.statusHistory.length - 1;
                const meta   = STATUS_META[event.status] ?? STATUS_META.pending;
                return (
                  <div key={i} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-base z-10 ${isLast && event.status === 'cancelled' ? 'bg-red-100' : 'bg-emerald-100'}`}>
                        {meta.icon}
                      </div>
                      {!isLast && <div className="w-0.5 flex-1 bg-gray-200 my-1" />}
                    </div>
                    <div className="pb-5 flex-1 min-w-0">
                      <p className={`font-semibold text-sm ${isLast && event.status === 'cancelled' ? 'text-red-600' : 'text-gray-800'}`}>{event.label}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{event.time}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              // Show full pipeline with done/current/future
              STATUS_ORDER.map((statusKey, i) => {
                const isDone    = i < currentIndex;
                const isCurrent = i === currentIndex;
                const isFuture  = i > currentIndex;
                const histEvent = booking.statusHistory.find(h => h.status === statusKey);
                const meta      = STATUS_META[statusKey];
                const isLast    = i === STATUS_ORDER.length - 1;

                return (
                  <div key={statusKey} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-base z-10 transition-all ${
                        isDone    ? 'bg-emerald-100' :
                        isCurrent ? `${meta.color} bg-opacity-20 ring-4 ring-blue-100` :
                                    'bg-gray-100'
                      }`}>
                        {isDone ? '✅' : isCurrent ? meta.icon : <span className="text-gray-300 text-sm font-bold">{i + 1}</span>}
                      </div>
                      {!isLast && <div className={`w-0.5 flex-1 my-1 ${isDone ? 'bg-emerald-300' : 'bg-gray-200'}`} />}
                    </div>
                    <div className="pb-5 flex-1 min-w-0">
                      <p className={`font-semibold text-sm ${isFuture ? 'text-gray-300' : isCurrent ? 'text-blue-700' : 'text-gray-800'}`}>
                        {meta.label}
                        {isCurrent && <span className="ml-2 inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">Current</span>}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">{histEvent?.time ?? (isFuture ? 'Pending' : '')}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Cancel button */}
        {canCancel && !confirmCancel && (
          <button onClick={() => setConfirmCancel(true)}
            className="w-full py-3 rounded-2xl border-2 border-red-200 text-red-500 text-sm font-semibold hover:bg-red-50 transition active:scale-95">
            Cancel Booking
          </button>
        )}

        {/* Confirm cancel dialog */}
        {confirmCancel && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
            <p className="font-semibold text-red-700 text-sm mb-1">Cancel this booking?</p>
            <p className="text-xs text-red-500 mb-4">₱{booking.price} will be refunded to your wallet.</p>
            <div className="flex gap-3">
              <button onClick={handleCancel}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold py-2.5 rounded-xl transition active:scale-95">
                Yes, Cancel
              </button>
              <button onClick={() => setConfirmCancel(false)}
                className="flex-1 border border-gray-200 text-gray-500 text-sm font-semibold py-2.5 rounded-xl hover:bg-white transition">
                Keep Booking
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
