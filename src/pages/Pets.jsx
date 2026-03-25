import { useState, useRef } from 'react';
import Layout from '../components/Layout';
import { useApp } from '../context/AppContext';
import { IcPlus, IcEdit, IcTrash, IcCheck, IcClose } from '../components/Icons';

const SPECIES    = ['Dog', 'Cat', 'Bird', 'Rabbit', 'Others'];
const SIZES      = ['Small', 'Medium', 'Large', 'Extra Large'];
const TEMPS      = ['Friendly', 'Calm', 'Playful', 'Anxious', 'Aggressive'];
const GENDERS    = ['Male', 'Female', 'Unknown'];
const VAX_STATUS = ['Up to Date', 'Overdue', 'Unknown'];
const PET_COLORS = ['#f59e0b', '#ec4899', '#3b82f6', '#10b981', '#8b5cf6', '#ef4444', '#f97316', '#6b7280'];

const PET_GRADIENTS = [
  { from: '#fdd89a', to: '#f59e0b' },
  { from: '#a8d4f5', to: '#3b82f6' },
  { from: '#d8b4fe', to: '#8b5cf6' },
  { from: '#a7f3d0', to: '#10b981' },
  { from: '#fecdd3', to: '#f43f5e' },
];

const EMPTY_PET = {
  name: '', species: 'Dog', breed: '', size: 'Medium',
  gender: 'Unknown', age: '', weight: '', temperament: 'Friendly',
  color: '#3b82f6', medicalNotes: '',
  vaccinationStatus: 'Unknown', vaccinationDate: '', photo: '',
};

const petEmoji = (species) =>
  species === 'Dog' ? '' : species === 'Cat' ? '' : species === 'Bird' ? '' : species === 'Rabbit' ? '' : '';

const fmtAge = (months) => {
  if (!months) return null;
  const m = parseInt(months);
  if (isNaN(m) || m < 0) return null;
  if (m < 12) return `${m} mo.`;
  const yrs = Math.floor(m / 12);
  const rem = m % 12;
  return rem ? `${yrs}y ${rem}mo` : `${yrs} yr${yrs > 1 ? 's' : ''}`;
};

//  Add / Edit form 
function PetForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState({ ...EMPTY_PET, ...initial });
  const fileRef = useRef();
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
  const inp = 'w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100';

  const handlePhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setForm(f => ({ ...f, photo: ev.target.result }));
    reader.readAsDataURL(file);
  };

  const emoji = petEmoji(form.species);
  const grad  = PET_GRADIENTS[SPECIES.indexOf(form.species) % PET_GRADIENTS.length];

  return (
    <div className="bg-white border border-blue-100 rounded-3xl overflow-hidden shadow-sm">
      {/* Photo upload area */}
      <div
        className="relative h-44 flex items-center justify-center cursor-pointer group overflow-hidden"
        style={{ background: form.photo ? undefined : `linear-gradient(135deg, ${grad.from}, ${grad.to})` }}
        onClick={() => fileRef.current?.click()}
      >
        {form.photo ? (
          <img src={form.photo} alt="pet" className="w-full h-full object-cover" />
        ) : (
          <span className="text-8xl select-none">{emoji}</span>
        )}
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
          <span className="text-3xl"></span>
          <span className="text-white text-sm font-semibold">
            {form.photo ? 'Change Photo' : 'Upload Photo'}
          </span>
          <span className="text-white/70 text-xs">Tap to browse</span>
        </div>
        {form.photo && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setForm(f => ({ ...f, photo: '' })); }}
            className="absolute top-2 right-2 w-7 h-7 bg-black/40 hover:bg-red-500 rounded-full flex items-center justify-center transition"
          >
            <IcClose className="w-3.5 h-3.5 fill-white" />
          </button>
        )}
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
      </div>

      <div className="p-5 space-y-4">
        <h3 className="font-bold text-gray-800 text-base">{initial.id ? 'Edit Pet' : 'Add New Pet'}</h3>

        <div className="grid grid-cols-2 gap-3">
          {/* Name */}
          <div className="col-span-2">
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Pet Name *</label>
            <input className={inp} placeholder="e.g. Buddy" value={form.name} onChange={set('name')} />
          </div>
          {/* Species */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Species</label>
            <select className={inp} value={form.species} onChange={set('species')}>
              {SPECIES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          {/* Breed */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Breed</label>
            <input className={inp} placeholder="e.g. Labrador" value={form.breed} onChange={set('breed')} />
          </div>
          {/* Gender */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Gender</label>
            <select className={inp} value={form.gender} onChange={set('gender')}>
              {GENDERS.map(g => <option key={g}>{g}</option>)}
            </select>
          </div>
          {/* Size */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Size</label>
            <select className={inp} value={form.size} onChange={set('size')}>
              {SIZES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          {/* Age */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Age (months)</label>
            <input className={inp} type="number" min="0" placeholder="e.g. 12" value={form.age} onChange={set('age')} />
          </div>
          {/* Weight */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Weight</label>
            <input className={inp} placeholder="e.g. 5 kg" value={form.weight} onChange={set('weight')} />
          </div>
          {/* Temperament */}
          <div className="col-span-2">
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Temperament</label>
            <select className={inp} value={form.temperament} onChange={set('temperament')}>
              {TEMPS.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>

          {/* Vaccination Status */}
          <div className="col-span-2">
            <label className="block text-xs font-semibold text-gray-500 mb-2">Vaccination Status</label>
            <div className="flex gap-2">
              {VAX_STATUS.map(v => (
                <button
                  key={v} type="button"
                  onClick={() => setForm(f => ({ ...f, vaccinationStatus: v }))}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold border-2 transition ${
                    form.vaccinationStatus === v
                      ? v === 'Up to Date'  ? 'bg-emerald-500 border-emerald-500 text-white'
                        : v === 'Overdue'   ? 'bg-red-500 border-red-500 text-white'
                        :                    'bg-gray-500 border-gray-500 text-white'
                      : 'border-gray-200 text-gray-500 bg-gray-50 hover:border-gray-300'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* Vaccination Date  shown only when Up to Date */}
          {form.vaccinationStatus === 'Up to Date' && (
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Last Vaccination Date</label>
              <input className={inp} type="date" value={form.vaccinationDate} onChange={set('vaccinationDate')} />
            </div>
          )}

          {/* Medical Notes */}
          <div className="col-span-2">
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Medical Notes</label>
            <textarea
              className={`${inp} resize-none`} rows={2}
              placeholder="Allergies, conditions, medications"
              value={form.medicalNotes} onChange={set('medicalNotes')}
            />
          </div>

          {/* Accent Color */}
          <div className="col-span-2">
            <label className="block text-xs font-semibold text-gray-500 mb-2">Profile Accent Color</label>
            <div className="flex gap-2 flex-wrap">
              {PET_COLORS.map(c => (
                <button
                  key={c} type="button"
                  onClick={() => setForm(f => ({ ...f, color: c }))}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${form.color === c ? 'border-gray-700 scale-110 shadow-sm' : 'border-white hover:scale-105'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-1">
          <button
            type="button" onClick={() => onSave(form)} disabled={!form.name.trim()}
            className="flex-1 flex items-center justify-center gap-1.5 bg-blue-600 disabled:opacity-50 hover:bg-blue-700 text-white text-sm font-semibold py-3 rounded-xl transition active:scale-95"
          >
            <IcCheck className="w-4 h-4 fill-white" /> Save Pet
          </button>
          <button
            type="button" onClick={onCancel}
            className="px-5 py-3 rounded-xl border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 transition active:scale-95"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

//  Pet card 
function PetCard({ pet, idx, onEdit, onDelete }) {
  const grad   = PET_GRADIENTS[idx % PET_GRADIENTS.length];
  const emoji  = petEmoji(pet.species);
  const ageStr = fmtAge(pet.age);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const vaxBadge =
    pet.vaccinationStatus === 'Up to Date' ? { cls: 'bg-emerald-100 text-emerald-700', label: ' Vaccinated' }
    : pet.vaccinationStatus === 'Overdue'  ? { cls: 'bg-red-100 text-red-600',         label: ' Overdue'   }
    : null;

  const tempIdx  = ['Calm','Friendly','Playful','Anxious','Aggressive'].indexOf(pet.temperament);
  const tempPct  = tempIdx >= 0 ? ((tempIdx + 1) / 5) * 100 : 50;

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow">

      {/* Photo / gradient hero */}
      <div
        className="h-44 relative overflow-hidden"
        style={{ background: pet.photo ? undefined : `linear-gradient(135deg, ${grad.from}, ${grad.to})` }}
      >
        {pet.photo ? (
          <img src={pet.photo} alt={pet.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-8xl select-none">{emoji}</span>
          </div>
        )}

        {/* Gradient overlay at bottom */}
        {pet.photo && (
          <div className="absolute bottom-0 inset-x-0 h-20 bg-gradient-to-t from-black/50 to-transparent" />
        )}

        {/* Color accent bar */}
        <div className="absolute bottom-0 inset-x-0 h-1.5" style={{ backgroundColor: pet.color }} />

        {/* Action buttons */}
        <div className="absolute top-2.5 right-2.5 flex gap-1.5">
          <button onClick={onEdit}
            className="w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow transition active:scale-90">
            <IcEdit className="w-3.5 h-3.5 fill-blue-600" />
          </button>
          <button onClick={() => setConfirmDelete(true)}
            className="w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow transition active:scale-90">
            <IcTrash className="w-3.5 h-3.5 fill-red-500" />
          </button>
        </div>

        {/* Species badge */}
        <div className="absolute bottom-3.5 left-3">
          <span className="bg-black/30 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full backdrop-blur-sm">
            {pet.species}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <p className="font-bold text-gray-800 text-base leading-tight">{pet.name}</p>
            <p className="text-xs text-gray-400 mt-0.5">{[pet.breed, pet.size].filter(Boolean).join('  ')}</p>
          </div>
          {vaxBadge && (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${vaxBadge.cls}`}>
              {vaxBadge.label}
            </span>
          )}
        </div>

        {/* Stat pills row */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {ageStr && (
            <span className="inline-flex items-center gap-1 bg-gray-50 border border-gray-100 text-[11px] text-gray-600 font-semibold px-2.5 py-1 rounded-lg">
               {ageStr}
            </span>
          )}
          {pet.weight && (
            <span className="inline-flex items-center gap-1 bg-gray-50 border border-gray-100 text-[11px] text-gray-600 font-semibold px-2.5 py-1 rounded-lg">
               {pet.weight}
            </span>
          )}
          {pet.gender && pet.gender !== 'Unknown' && (
            <span className="inline-flex items-center gap-1 bg-gray-50 border border-gray-100 text-[11px] text-gray-600 font-semibold px-2.5 py-1 rounded-lg">
              {pet.gender === 'Male' ? '' : ''} {pet.gender}
            </span>
          )}
        </div>

        {/* Temperament bar */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-[11px] text-gray-500 mb-1.5">
            <span className="font-semibold text-gray-700">{pet.temperament}</span>
            <span className="text-gray-400">Temperament</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${tempPct}%`, backgroundColor: pet.color }}
            />
          </div>
        </div>

        {/* Medical Notes */}
        {pet.medicalNotes && (
          <div className="bg-amber-50 border border-amber-100 rounded-xl px-3 py-2.5">
            <p className="text-[10px] font-bold text-amber-600 mb-0.5 uppercase tracking-wide">Medical Notes</p>
            <p className="text-xs text-amber-800 leading-relaxed line-clamp-2">{pet.medicalNotes}</p>
          </div>
        )}
      </div>

      {/* Delete confirmation */}
      {confirmDelete && (
        <div className="border-t border-red-100 bg-red-50 px-4 py-3">
          <p className="text-xs font-bold text-red-700 mb-2">Remove {pet.name}?</p>
          <div className="flex gap-2">
            <button onClick={onDelete}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold py-2 rounded-lg transition active:scale-95">
              Yes, Remove
            </button>
            <button onClick={() => setConfirmDelete(false)}
              className="flex-1 border border-gray-200 bg-white text-gray-500 text-xs font-semibold py-2 rounded-lg hover:bg-gray-50 transition">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

//  Main page 
export default function Pets() {
  const { pets, addPet, updatePet, removePet } = useApp();
  const [showAdd, setShowAdd] = useState(false);
  const [editId,  setEditId]  = useState(null);
  const [toast,   setToast]   = useState('');

  const flash = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const handleAdd = (pet) => {
    addPet(pet);
    setShowAdd(false);
    flash(' Pet added successfully!');
  };

  const handleUpdate = (pet) => {
    updatePet(pet.id, pet);
    setEditId(null);
    flash(' Pet updated!');
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-800">My Pets</h1>
            <p className="text-sm text-gray-400">{pets.length} pet{pets.length !== 1 ? 's' : ''} registered</p>
          </div>
          {!showAdd && (
            <button
              onClick={() => { setEditId(null); setShowAdd(true); }}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition active:scale-95 shadow-sm shadow-blue-200"
            >
              <IcPlus className="w-4 h-4 fill-white" /> Add Pet
            </button>
          )}
        </div>

        {/* Toast */}
        {toast && (
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-sm text-emerald-700 font-medium">
            <IcCheck className="w-4 h-4 fill-emerald-500 shrink-0" /> {toast}
          </div>
        )}

        {/* Add form */}
        {showAdd && (
          <PetForm initial={EMPTY_PET} onSave={handleAdd} onCancel={() => setShowAdd(false)} />
        )}

        {/* Empty state */}
        {pets.length === 0 && !showAdd && (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
            <span className="text-6xl"></span>
            <p className="text-gray-700 font-bold mt-4 mb-1">No pets added yet</p>
            <p className="text-sm text-gray-400 mb-5">Add your furry friends to get started.</p>
            <button
              onClick={() => setShowAdd(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition active:scale-95"
            >
              Add Your First Pet
            </button>
          </div>
        )}

        {/* Pet grid */}
        {pets.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {pets.map((pet, idx) => (
              <div key={pet.id}>
                {editId === pet.id ? (
                  <PetForm
                    initial={pet}
                    onSave={handleUpdate}
                    onCancel={() => setEditId(null)}
                  />
                ) : (
                  <PetCard
                    pet={pet}
                    idx={idx}
                    onEdit={() => { setShowAdd(false); setEditId(pet.id); }}
                    onDelete={() => { removePet(pet.id); flash('Pet removed.'); }}
                  />
                )}
              </div>
            ))}
          </div>
        )}

      </div>
    </Layout>
  );
}
