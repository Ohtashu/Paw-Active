import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useApp, CLINICS, SERVICE_PRICES, TRANSPORT_FEE } from '../context/AppContext';
import { IcChevL, IcLocation, IcClock, IcStar, IcCheck, IcClose, IcSearch } from '../components/Icons';

// Display label → SERVICE_PRICES key
const PURPOSES = ['Check Up', 'Vaccine', 'Lab Test'];
const PURPOSE_KEY = { 'Check Up': 'Checkup', 'Vaccine': 'Vaccine', 'Lab Test': 'Lab Test' };

const MORNING_SLOTS   = ['8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM'];
const AFTERNOON_SLOTS = ['1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'];
const TAKEN_SLOTS     = ['9:00 AM', '2:00 PM'];
function SectionLabel({ num, title, done, optional }) {
  return (
    <div className="flex items-center gap-2.5 mb-3">
      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition ${done ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
        {done ? '✓' : num}
      </div>
      <h2 className={`text-sm font-bold transition ${done ? 'text-gray-800' : 'text-gray-600'}`}>{title}</h2>
      {optional && <span className="text-[11px] text-gray-400 font-normal">(optional)</span>}
    </div>
  );
}

const PET_GRADIENTS = [
  'from-orange-300 to-amber-400',
  'from-sky-300 to-blue-400',
  'from-purple-300 to-violet-400',
  'from-green-300 to-teal-400',
  'from-pink-300 to-rose-400',
];

const HANDLING_OPTIONS = ['Crate Needed', 'Anxious Pet', 'Needs Leash', 'Other'];

const MIN_DATE = (() => {
  const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().slice(0, 10);
})();

export default function Book() {
  const { pets, addBooking, wallet } = useApp();
  const navigate = useNavigate();

  const [petId,       setPetId]       = useState('');
  const [clinicId,    setClinicId]    = useState('');
  const [purpose,     setPurpose]     = useState('');
  const [date,        setDate]        = useState('');
  const [time,        setTime]        = useState('');
  const [pickupType,  setPickupType]  = useState('');   // 'clinic' | 'other'
  const [pickupOther, setPickupOther] = useState('');
  const [dropoffType, setDropoffType] = useState('');   // 'clinic' | 'other'
  const [dropoffOther,setDropoffOther]= useState('');
  const [handling,    setHandling]    = useState([]);
  const [clinicSearch,setClinicSearch]= useState('');
  const [showReview,  setShowReview]  = useState(false);
  const [confirmed,   setConfirmed]   = useState(null);
  const [error,       setError]       = useState('');
  const [submitting,  setSubmitting]  = useState(false);

  const selectedPet    = pets.find(p => p.id === petId);
  const selectedClinic = CLINICS.find(c => c.id === clinicId);
  const filteredClinics = CLINICS.filter(c =>
    c.name.toLowerCase().includes(clinicSearch.toLowerCase()) ||
    c.location.toLowerCase().includes(clinicSearch.toLowerCase())
  );

  const serviceKey   = PURPOSE_KEY[purpose] ?? purpose;
  const basePrice    = SERVICE_PRICES[serviceKey] ?? 0;
  const total        = basePrice + TRANSPORT_FEE;
  const clinicAddr   = selectedClinic ? `${selectedClinic.name}, ${selectedClinic.location}` : '';
  const finalPickup  = pickupType  === 'clinic' ? clinicAddr : pickupOther;
  const finalDropoff = dropoffType === 'clinic' ? clinicAddr : dropoffOther;
  const canReview    = petId && clinicId && purpose && date && time &&
                       (pickupType === 'clinic' || pickupOther.trim());

  const handleConfirm = async () => {
    if (wallet.balance < total) { setError('Insufficient wallet balance. Please top up first.'); return; }
    setError('');
    setSubmitting(true);
    try {
      const booking = await addBooking({
        petId, clinicId, service: serviceKey, date, time,
        pickupAddress:  finalPickup,
        dropoffAddress: finalDropoff || clinicAddr,
        instructions: handling.join(', '),
        needsCrate: handling.includes('Crate Needed'),
        needsLeash: handling.includes('Needs Leash'),
        price: total,
      });
      setShowReview(false);
      setConfirmed(booking);
    } catch (err) {
      setError('Booking failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setConfirmed(null); setPetId(''); setClinicId(''); setPurpose('');
    setDate(''); setTime(''); setPickupType(''); setPickupOther('');
    setDropoffType(''); setDropoffOther(''); setHandling([]); setClinicSearch('');
  };

  // ── Confirmation screen ─────────────────────────────────────────────────
  if (confirmed) {
    return (
      <Layout>
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 text-center">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <IcCheck className="w-10 h-10 fill-emerald-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-1">Booking Confirmed!</h2>
            <p className="text-gray-400 text-sm mb-6">You'll receive updates as your booking progresses.</p>
            <div className="bg-gray-50 rounded-2xl p-4 text-sm text-left space-y-2 mb-6">
              {[
                { label: 'Booking No.', value: confirmed.bookingNo, cls: 'font-semibold text-blue-600' },
                { label: 'Service',     value: confirmed.service },
                { label: 'Clinic',      value: selectedClinic?.name },
                { label: 'Schedule',    value: `${confirmed.date} · ${confirmed.time}` },
                { label: 'Amount Paid', value: `₱${total}`, cls: 'font-bold text-emerald-600' },
              ].map(({ label, value, cls }) => (
                <div key={label} className="flex justify-between gap-3">
                  <span className="text-gray-400 shrink-0">{label}</span>
                  <span className={cls ?? 'font-medium text-right'}>{value}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => navigate('/history')}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-3 rounded-xl transition active:scale-95">
                Track Booking
              </button>
              <button onClick={resetForm}
                className="px-5 py-3 rounded-xl border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 transition">
                New Booking
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // ── Booking Summary page ────────────────────────────────────────────────
  if (showReview) {
    const petIdx       = pets.findIndex(p => p.id === petId);
    const petGrad      = PET_GRADIENTS[petIdx % PET_GRADIENTS.length];
    const petEmoji     = selectedPet?.species === 'Dog' ? '🐶' : selectedPet?.species === 'Cat' ? '🐱' : selectedPet?.species === 'Bird' ? '🐦' : '🐾';
    const fmtDate      = date
      ? new Date(date + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
      : '';
    const balanceAfter = wallet.balance - total;
    const insufficient = wallet.balance < total;

    return (
      <Layout>
        <div className="max-w-3xl mx-auto pb-32 space-y-4">

          {/* ── Header ── */}
          <div className="flex items-center gap-3">
            <button onClick={() => setShowReview(false)}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition active:scale-95">
              <IcChevL className="w-5 h-5 fill-gray-600" />
            </button>
            <h1 className="text-base font-bold text-gray-900">Booking Summary</h1>
          </div>

          {/* ── Two-col on desktop ── */}
          <div className="lg:grid lg:grid-cols-[1fr_340px] lg:gap-4 space-y-4 lg:space-y-0">

          {/* ── Hero ticket card ── */}
          <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-gray-100">

            {/* Gradient banner — clinic + status */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 px-5 py-4 flex items-center justify-between">
              <div>
                <p className="text-white/70 text-[11px] font-medium uppercase tracking-wide">Clinic</p>
                <p className="text-white font-bold text-sm mt-0.5">{selectedClinic?.name ?? '—'}</p>
                <p className="text-white/60 text-[11px] mt-0.5">{selectedClinic?.location}</p>
              </div>
              <span className="inline-flex items-center gap-1.5 bg-white/20 text-white text-[11px] font-semibold px-3 py-1.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-300" />
                Pending
              </span>
            </div>

            {/* Notch divider */}
            <div className="relative flex items-center justify-between -mx-3">
              <div className="w-6 h-6 rounded-full bg-gray-50 border border-gray-100" />
              <div className="flex-1 border-t-2 border-dashed border-gray-100 mx-1" />
              <div className="w-6 h-6 rounded-full bg-gray-50 border border-gray-100" />
            </div>

            <div className="px-5 pb-5 space-y-4">

              {/* Pet + Service — 2 columns */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Pet</p>
                  {selectedPet && (
                    <div className="flex items-center gap-2">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${petGrad} flex items-center justify-center text-xl shrink-0`}>
                        {petEmoji}
                      </div>
                      <div>
                        <p className="font-bold text-gray-800 text-sm leading-tight">{selectedPet.name}</p>
                        <p className="text-[11px] text-gray-400">
                          {selectedPet.breed || selectedPet.species}{selectedPet.age ? `, ${selectedPet.age} mos.` : ''}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Service</p>
                  <span className="inline-block bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-xl">
                    {purpose}
                  </span>
                  <p className="text-[11px] text-gray-400 mt-1.5">₱{basePrice} + ₱{TRANSPORT_FEE} transport</p>
                </div>
              </div>

              <div className="border-t border-dashed border-gray-100" />

              {/* Schedule */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-indigo-500">
                    <path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z"/>
                  </svg>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Schedule</p>
                  <p className="text-sm font-semibold text-gray-800 mt-0.5">{fmtDate}</p>
                  <p className="text-xs text-gray-500">{time}</p>
                </div>
              </div>

              <div className="border-t border-dashed border-gray-100" />

              {/* Route timeline */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-rose-50 flex items-center justify-center shrink-0">
                  <IcLocation className="w-4 h-4 fill-rose-400" />
                </div>
                <div className="flex-1">
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Route</p>
                  <div className="relative pl-5 space-y-3">
                    {/* Connector line */}
                    <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-gray-200" />
                    {/* Pickup */}
                    <div className="flex items-start gap-2">
                      <div className="w-3.5 h-3.5 rounded-full bg-blue-500 border-2 border-white shadow-sm -ml-5 mt-0.5 shrink-0 z-10" />
                      <div>
                        <p className="text-[11px] text-gray-400">Pick up</p>
                        <p className="text-sm font-medium text-gray-800">{finalPickup || '—'}</p>
                      </div>
                    </div>
                    {/* Dropoff */}
                    <div className="flex items-start gap-2">
                      <div className="w-3.5 h-3.5 rounded-full bg-indigo-500 border-2 border-white shadow-sm -ml-5 mt-0.5 shrink-0 z-10" />
                      <div>
                        <p className="text-[11px] text-gray-400">Drop off</p>
                        <p className="text-sm font-medium text-gray-800">{finalDropoff || clinicAddr || "Clinic's Address"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Special Handling */}
              {handling.length > 0 && (
                <>
                  <div className="border-t border-dashed border-gray-100" />
                  <div>
                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Special Handling</p>
                    <div className="flex gap-2 flex-wrap">
                      {handling.map(h => (
                        <span key={h} className="bg-amber-50 text-amber-700 border border-amber-100 text-xs font-medium px-3 py-1.5 rounded-xl">{h}</span>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* right column — payment + error */}
          <div className="space-y-3">

          {/* ── Payment card ── */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 space-y-3">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Payment</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>{purpose}</span><span>₱{basePrice}.00</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Transport fee</span><span>₱{TRANSPORT_FEE}.00</span>
              </div>
              <div className="border-t border-gray-100 pt-2 flex justify-between font-bold text-gray-900 text-base">
                <span>Total</span><span>₱{total}.00</span>
              </div>
            </div>
            <div className="bg-gray-50 rounded-2xl p-3 space-y-1.5 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Wallet balance</span>
                <span className="font-medium text-gray-700">₱{wallet.balance.toLocaleString()}.00</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>After payment</span>
                <span className={`font-semibold ${insufficient ? 'text-red-500' : 'text-emerald-600'}`}>
                  ₱{balanceAfter.toLocaleString()}.00
                </span>
              </div>
              {insufficient && (
                <div className="mt-2 bg-red-50 border border-red-200 rounded-xl p-3 space-y-2">
                  <p className="text-red-600 text-xs font-semibold flex items-center gap-1.5">
                    <span className="text-base">⚠️</span>
                    Insufficient Balance
                  </p>
                  <p className="text-red-500 text-xs">
                    You need ₱{(total - wallet.balance).toLocaleString()} more to complete this booking.
                  </p>
                  <button onClick={() => navigate('/wallet')}
                    className="w-full bg-red-500 hover:bg-red-600 text-white text-xs font-semibold py-2 rounded-lg transition active:scale-95">
                    Top Up Wallet
                  </button>
                </div>
              )}
            </div>
          </div>

          {error && (
            <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-2xl px-4 py-2.5">{error}</p>
          )}

          </div>{/* end right column */}
          </div>{/* end two-col grid */}
        </div>

        {/* ── Sticky submit button ── */}
        <div className="fixed bottom-[4.5rem] lg:bottom-4 left-4 right-4 lg:left-64 z-30">
          {insufficient ? (
            <button onClick={() => navigate('/wallet')}
              className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-red-200 transition active:scale-[0.98]">
              ⚠️ Insufficient Balance — Top Up ₱{(total - wallet.balance).toLocaleString()}
            </button>
          ) : (
            <button onClick={handleConfirm} disabled={submitting}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-300 transition active:scale-[0.98]">
              {submitting ? (
                <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Processing…</>
              ) : (
                <><IcCheck className="w-5 h-5 fill-white" /> Submit Booking · ₱{total}</>
              )}
            </button>
          )}
        </div>
      </Layout>
    );
  }

  // ── Input style ─────────────────────────────────────────────────────────
  const inputCls = 'w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition';

  return (
    <Layout>
      {/* Extra bottom padding for the sticky review bar */}
      <div className="max-w-2xl mx-auto pb-28 space-y-6">

        {/* Page header */}
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition active:scale-95">
            <IcChevL className="w-5 h-5 fill-gray-700" />
          </button>
          <div>
            <h1 className="text-base font-bold text-gray-900">Book Pet Transport</h1>
            <p className="text-xs text-gray-400">Fill in the details below to schedule a ride</p>
          </div>
        </div>

        {/* ── Progress bar ── */}
        {(() => {
          const steps = [
            { label: 'Pet',     done: !!petId },
            { label: 'Clinic',  done: !!clinicId },
            { label: 'Purpose', done: !!purpose },
            { label: 'Schedule',done: !!(date && time) },
            { label: 'Route',   done: !!(pickupType === 'clinic' || pickupOther.trim()) },
          ];
          const doneCount = steps.filter(s => s.done).length;
          return (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-600">{doneCount} of {steps.length} completed</span>
                <span className="text-xs text-gray-400">{Math.round(doneCount / steps.length * 100)}%</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-2.5">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
                  style={{ width: `${(doneCount / steps.length) * 100}%` }}
                />
              </div>
              <div className="flex gap-1">
                {steps.map((s, i) => (
                  <div key={i} className="flex-1 text-center">
                    <div className={`text-[10px] font-semibold truncate ${
                      s.done ? 'text-blue-600' : 'text-gray-400'
                    }`}>{s.done ? '✓ ' : ''}{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* ── Select Pet ─────────────────────────────────────────────────── */}
        <section>
          <SectionLabel num={1} title="Select Your Pet" done={!!petId} />
          {pets.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <span className="text-4xl">🐾</span>
              <p className="text-sm text-gray-400 mt-2 mb-3">No pets registered yet.</p>
              <button onClick={() => navigate('/pets')}
                className="bg-blue-600 text-white text-xs font-semibold px-5 py-2 rounded-xl hover:bg-blue-700 transition">
                Add a Pet First
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {pets.map((pet, idx) => {
                const grad       = PET_GRADIENTS[idx % PET_GRADIENTS.length];
                const isSelected = petId === pet.id;
                const petEmoji   = pet.species === 'Dog' ? '🐶' : pet.species === 'Cat' ? '🐱' : pet.species === 'Bird' ? '🐦' : '🐾';
                return (
                  <button key={pet.id} onClick={() => setPetId(pet.id)}
                    className={`rounded-2xl overflow-hidden border-2 transition active:scale-[0.97] text-left ${
                      isSelected ? 'border-blue-500 shadow-lg shadow-blue-100' : 'border-transparent shadow-sm hover:shadow-md bg-white'
                    }`}>
                    {/* Photo area */}
                    <div className={`h-28 relative overflow-hidden ${!pet.photo ? `bg-gradient-to-br ${grad}` : ''}`}>
                      {pet.photo ? (
                        <img src={pet.photo} alt={pet.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className={`w-full h-full bg-gradient-to-br ${grad} flex items-center justify-center`}>
                          <span className="text-5xl">{petEmoji}</span>
                        </div>
                      )}
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center shadow-md">
                          <IcCheck className="w-3.5 h-3.5 fill-white" />
                        </div>
                      )}
                      {pet.photo && isSelected && <div className="absolute inset-0 ring-2 ring-inset ring-blue-500" />}
                    </div>
                    {/* Info */}
                    <div className="bg-white px-3 py-2.5">
                      <p className="font-semibold text-gray-800 text-sm leading-tight">
                        {pet.name}{pet.age ? `, ${pet.age} mos.` : ''}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5 truncate">{pet.breed || pet.species}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* ── Select Clinic ──────────────────────────────────────────────── */}
        <section>
          <SectionLabel num={2} title="Select a Clinic" done={!!clinicId} />
          {/* Search */}
          <div className="relative mb-3">
            <IcSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 fill-gray-400" />
            <input type="text" placeholder="Search clinic" value={clinicSearch}
              onChange={e => setClinicSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {filteredClinics.map(clinic => {
              const isSelected = clinicId === clinic.id;
              return (
                <button key={clinic.id} onClick={() => setClinicId(clinic.id)}
                  className={`rounded-2xl overflow-hidden border-2 transition active:scale-[0.97] text-left ${
                    isSelected ? 'border-blue-500 shadow-lg shadow-blue-100' : 'border-transparent shadow-sm hover:shadow-md bg-white'
                  }`}>
                  {/* Photo area */}
                  <div className={`h-28 bg-gradient-to-br ${clinic.color} flex items-center justify-center relative`}>
                    {/* Clinic symbol */}
                    <svg viewBox="0 0 24 24" className="w-12 h-12 fill-white/30">
                      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14l-5-5 1.41-1.41L12 14.17l7.59-7.59L21 8l-9 9z"/>
                    </svg>
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center shadow-md">
                        <IcCheck className="w-3.5 h-3.5 fill-white" />
                      </div>
                    )}
                    {/* Clinic name overlay */}
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/50 to-transparent px-2 py-2">
                      <p className="text-white font-semibold text-[11px] leading-tight line-clamp-2">{clinic.name}</p>
                    </div>
                  </div>
                  {/* Info row */}
                  <div className="bg-white px-3 py-2.5 space-y-1">
                    <div className="flex items-center gap-1">
                      <IcLocation className="w-3 h-3 fill-gray-400 shrink-0" />
                      <p className="text-[11px] text-gray-500 truncate">{clinic.location}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <IcClock className="w-3 h-3 fill-gray-400 shrink-0" />
                      <p className="text-[11px] text-gray-500 truncate">{clinic.hours}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* ── For what purpose? ──────────────────────────────────────────── */}
        <section>
          <SectionLabel num={3} title="Purpose of Visit" done={!!purpose} />
          <div className="flex gap-2 flex-wrap">
            {PURPOSES.map(p => (
              <button key={p} onClick={() => setPurpose(p)}
                className={`px-5 py-2 rounded-full text-sm font-medium border-2 transition active:scale-95 ${
                  purpose === p
                    ? 'bg-blue-600 border-blue-600 text-white shadow-sm shadow-blue-200'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300 hover:bg-blue-50'
                }`}>
                {p}
              </button>
            ))}
          </div>
          {purpose && (
            <p className="mt-2 text-xs text-gray-400">
              Service fee: <span className="font-semibold text-blue-600">₱{SERVICE_PRICES[PURPOSE_KEY[purpose]]}</span>
              {' '}+ ₱{TRANSPORT_FEE} transport
            </p>
          )}
        </section>

        {/* ── Schedule ───────────────────────────────────────────────────── */}
        <section>
          <SectionLabel num={4} title="Pick a Schedule" done={!!(date && time)} />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Date</label>
              <input
                type="date"
                min={MIN_DATE}
                value={date}
                onChange={e => { setDate(e.target.value); setTime(''); }}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Time</label>
              <select value={time} onChange={e => setTime(e.target.value)} disabled={!date}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-40">
                <option value="">-- Pick a time --</option>
                <optgroup label="Morning">
                  {MORNING_SLOTS.map(s => (
                    <option key={s} value={s} disabled={TAKEN_SLOTS.includes(s)}>
                      {s}{TAKEN_SLOTS.includes(s) ? ' (Full)' : ''}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Afternoon">
                  {AFTERNOON_SLOTS.map(s => (
                    <option key={s} value={s} disabled={TAKEN_SLOTS.includes(s)}>
                      {s}{TAKEN_SLOTS.includes(s) ? ' (Full)' : ''}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>
          </div>
        </section>

        {/* ── Pick Up ────────────────────────────────────────────────────── */}
        <section>
          <SectionLabel num={5} title="Pick Up Location" done={!!(pickupType === 'clinic' || pickupOther.trim())} />
          <div className="flex gap-2 mb-3">
            {['Clinic', 'Other'].map(opt => (
              <button key={opt} onClick={() => setPickupType(opt.toLowerCase())}
                className={`px-5 py-2 rounded-full text-sm font-medium border-2 transition active:scale-95 ${
                  pickupType === opt.toLowerCase()
                    ? 'bg-blue-600 border-blue-600 text-white shadow-sm shadow-blue-200'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300 hover:bg-blue-50'
                }`}>
                {opt}
              </button>
            ))}
          </div>
          {pickupType === 'clinic' && clinicAddr && (
            <p className="text-xs text-gray-400 ml-1">{clinicAddr}</p>
          )}
          {pickupType === 'other' && (
            <div className="relative">
              <IcLocation className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 fill-gray-400" />
              <input type="text" placeholder="Enter pickup address"
                value={pickupOther} onChange={e => setPickupOther(e.target.value)}
                className={`${inputCls} pl-10`} />
            </div>
          )}
        </section>

        {/* ── Drop Off ───────────────────────────────────────────────────── */}
        <section>
          <SectionLabel num={6} title="Drop Off Location" done={!!dropoffType} />
          <div className="flex gap-2 mb-3">
            {['Clinic', 'Other'].map(opt => (
              <button key={opt} onClick={() => setDropoffType(opt.toLowerCase())}
                className={`px-5 py-2 rounded-full text-sm font-medium border-2 transition active:scale-95 ${
                  dropoffType === opt.toLowerCase()
                    ? 'bg-blue-600 border-blue-600 text-white shadow-sm shadow-blue-200'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300 hover:bg-blue-50'
                }`}>
                {opt}
              </button>
            ))}
          </div>
          {dropoffType === 'clinic' && clinicAddr && (
            <p className="text-xs text-gray-400 ml-1">{clinicAddr}</p>
          )}
          {dropoffType === 'other' && (
            <div className="relative">
              <IcLocation className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 fill-blue-400" />
              <input type="text" placeholder="Enter drop-off address"
                value={dropoffOther} onChange={e => setDropoffOther(e.target.value)}
                className={`${inputCls} pl-10`} />
            </div>
          )}
        </section>

        {/* ── Special Handling Instructions ──────────────────────────────── */}
        <section>
          <SectionLabel num={7} title="Special Handling" optional done={handling.length > 0} />
          <div className="flex gap-2 flex-wrap">
            {HANDLING_OPTIONS.map(opt => {
              const active = handling.includes(opt);
              return (
                <button key={opt}
                  onClick={() => setHandling(prev =>
                    prev.includes(opt) ? prev.filter(h => h !== opt) : [...prev, opt]
                  )}
                  className={`px-5 py-2 rounded-full text-sm font-medium border-2 transition active:scale-95 ${
                    active
                      ? 'bg-blue-600 border-blue-600 text-white shadow-sm shadow-blue-200'
                      : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300 hover:bg-blue-50'
                  }`}>
                  {opt}
                </button>
              );
            })}
          </div>
        </section>

      </div>

      {/* ── Sticky Review Bar ─────────────────────────────────────────────── */}
      {canReview && !showReview && (
        <div className="fixed bottom-[4.5rem] lg:bottom-4 left-4 right-4 lg:left-64 z-30 pointer-events-none">
          {wallet.balance < total ? (
            <div className="pointer-events-auto bg-red-500 text-white px-5 py-4 rounded-2xl shadow-xl shadow-red-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xl">⚠️</span>
                <div>
                  <p className="font-bold text-sm">Insufficient Balance</p>
                  <p className="text-red-100 text-xs">Need ₱{(total - wallet.balance).toLocaleString()} more</p>
                </div>
              </div>
              <button onClick={() => navigate('/wallet')}
                className="bg-white text-red-500 font-bold text-xs px-4 py-2 rounded-xl hover:bg-red-50 transition active:scale-95">
                Top Up
              </button>
            </div>
          ) : (
            <button onClick={() => setShowReview(true)}
              className="w-full pointer-events-auto flex items-center justify-between bg-blue-600 hover:bg-blue-700 text-white px-5 py-4 rounded-2xl shadow-xl shadow-blue-300 active:scale-[0.98] transition">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
                  <IcCheck className="w-4 h-4 fill-white" />
                </div>
                <span className="font-bold text-sm">Review Booking</span>
              </div>
              <div className="text-right">
                <p className="text-blue-200 text-[11px] leading-none mb-0.5">Cost</p>
                <p className="font-bold text-base leading-none">₱{total.toLocaleString()}</p>
              </div>
            </button>
          )}
        </div>
      )}

    </Layout>
  );
}
