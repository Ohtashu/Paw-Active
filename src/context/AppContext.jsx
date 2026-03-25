import { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import {
  doc, collection, onSnapshot, setDoc, addDoc, updateDoc,
  deleteDoc, query, orderBy, increment, arrayUnion,
} from 'firebase/firestore';
import { auth, db } from '../firebase';

const AppContext = createContext(null);
export const useApp = () => useContext(AppContext);

// ── Shared data constants (these stay client-side) ────────────────────────

export const CLINICS = [
  { id: 1, name: 'Paws & Care Veterinary',    location: 'Guiguinto, Bulacan',  hours: '7:00 am – 7:00 pm', rating: 4.8, reviews: 124, tags: ['Surgery', 'Dental', 'Grooming'],          color: 'from-sky-400 to-blue-500'     },
  { id: 2, name: 'Happy Tails Animal Clinic', location: 'Malolos, Bulacan',    hours: '8:00 am – 6:00 pm', rating: 4.6, reviews: 89,  tags: ['Vaccination', 'Checkup'],               color: 'from-teal-400 to-emerald-500' },
  { id: 3, name: 'FurFriends Pet Hospital',   location: 'Meycauayan, Bulacan', hours: '24 hours',          rating: 4.9, reviews: 210, tags: ['Emergency', 'Surgery', 'ICU'],           color: 'from-violet-400 to-purple-500'},
];

export const SERVICE_PRICES = { 'Checkup': 350, 'Vaccine': 450, 'Lab Test': 600 };
export const TRANSPORT_FEE  = 80;

// ── Helper ────────────────────────────────────────────────────────────────

const now = () =>
  new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });

const today = () => new Date().toISOString().slice(0, 10);

// ── Provider ──────────────────────────────────────────────────────────────

export function AppProvider({ children }) {
  const [authUser, setAuthUser] = useState(undefined);   // undefined = loading, null = logged out
  const [user,     setUser]     = useState({ name: '', email: '', phone: '', address: '' });
  const [pets,     setPets]     = useState([]);
  const [bookings, setBookings] = useState([]);
  const [wallet,   setWallet]   = useState({ balance: 0, transactions: [] });
  const [loading,  setLoading]  = useState(true);

  // ── 1. Auth listener ────────────────────────────────────────────────────
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (fbUser) => {
      setAuthUser(fbUser ?? null);
      if (!fbUser) {
        setUser({ name: '', email: '', phone: '', address: '' });
        setPets([]);
        setBookings([]);
        setWallet({ balance: 0, transactions: [] });
        setLoading(false);
      }
    });
    return unsub;
  }, []);

  // ── 2. Firestore real-time listeners (run when authUser changes) ───────
  useEffect(() => {
    if (!authUser) return;
    const uid = authUser.uid;

    // User profile
    const unsubUser = onSnapshot(doc(db, 'users', uid), (snap) => {
      if (snap.exists()) {
        setUser({ id: snap.id, ...snap.data() });
      } else {
        // First-time user — create profile doc
        const profile = {
          name: authUser.displayName || '',
          email: authUser.email || '',
          phone: '',
          address: '',
          createdAt: today(),
        };
        setDoc(doc(db, 'users', uid), profile);
        setUser({ id: uid, ...profile });
      }
    });

    // Pets subcollection
    const unsubPets = onSnapshot(
      collection(db, 'users', uid, 'pets'),
      (snap) => setPets(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
    );

    // Bookings subcollection (newest first)
    const unsubBookings = onSnapshot(
      query(collection(db, 'users', uid, 'bookings'), orderBy('createdAt', 'desc')),
      (snap) => setBookings(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
      (err) => {
        console.error('Bookings listener error (index may be needed):', err);
        // Fallback: fetch without ordering if index is missing
        onSnapshot(
          collection(db, 'users', uid, 'bookings'),
          (snap) => {
            const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            docs.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
            setBookings(docs);
          },
        );
      },
    );

    // Wallet doc
    const unsubWallet = onSnapshot(doc(db, 'users', uid, 'wallet', 'main'), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        // Sort transactions newest-first by date
        const sorted = [...(data.transactions || [])].sort((a, b) => b.date.localeCompare(a.date));
        setWallet({ ...data, transactions: sorted });
      } else {
        const init = { balance: 0, transactions: [] };
        setDoc(doc(db, 'users', uid, 'wallet', 'main'), init);
        setWallet(init);
      }
    });

    setLoading(false);

    return () => {
      unsubUser();
      unsubPets();
      unsubBookings();
      unsubWallet();
    };
  }, [authUser]);

  // ── Mutations ───────────────────────────────────────────────────────────

  const uid = authUser?.uid;

  // User
  const updateUser = async (upd) => {
    if (!uid) return;
    await updateDoc(doc(db, 'users', uid), upd);
  };

  // Pets
  const addPet = async (pet) => {
    if (!uid) return;
    const { id: _ignore, ...data } = pet;          // strip client-side id
    await addDoc(collection(db, 'users', uid, 'pets'), data);
  };

  const updatePet = async (petId, upd) => {
    if (!uid) return;
    const { id: _ignore, ...data } = upd;
    await updateDoc(doc(db, 'users', uid, 'pets', petId), data);
  };

  const removePet = async (petId) => {
    if (!uid) return;
    await deleteDoc(doc(db, 'users', uid, 'pets', petId));
  };

  // Bookings
  const addBooking = async (data) => {
    if (!uid) return;

    // Generate booking number from current count
    const bookingNo = 'PAW-' + new Date().getFullYear() + '-' + String(bookings.length + 1).padStart(3, '0');
    const booking = {
      ...data,
      bookingNo,
      status: 'pending',
      statusHistory: [{ status: 'pending', label: 'Booking Submitted', time: now() }],
      createdAt: today(),
    };

    const ref = await addDoc(collection(db, 'users', uid, 'bookings'), booking);

    // Deduct from wallet
    const txn = {
      id: 't' + Date.now(),
      type: 'payment',
      amount: -data.price,
      description: `Booking ${bookingNo} – ${data.service}`,
      date: today(),
    };
    await updateDoc(doc(db, 'users', uid, 'wallet', 'main'), {
      balance: increment(-data.price),
      transactions: arrayUnion(txn),
    });

    // Auto-advance booking status: pending → confirmed → picked-up → at-clinic → completed (10s each)
    const STATUS_FLOW = [
      { status: 'confirmed',  label: 'Clinic Confirmed'  },
      { status: 'picked-up',  label: 'Pet Picked Up'     },
      { status: 'at-clinic',  label: 'Arrived at Clinic'  },
      { status: 'completed',  label: 'Service Completed' },
    ];
    const capturedUid = uid;
    const bookingDocId = ref.id;
    STATUS_FLOW.forEach((step, i) => {
      setTimeout(() => {
        updateDoc(doc(db, 'users', capturedUid, 'bookings', bookingDocId), {
          status: step.status,
          statusHistory: arrayUnion({ status: step.status, label: step.label, time: now() }),
        }).catch(() => {});
      }, (i + 1) * 10000);
    });

    return { id: ref.id, ...booking };
  };

  const cancelBooking = async (bookingId) => {
    if (!uid) return;
    const bk = bookings.find(b => b.id === bookingId);
    if (!bk || bk.status === 'completed' || bk.status === 'cancelled') return;

    await updateDoc(doc(db, 'users', uid, 'bookings', bookingId), {
      status: 'cancelled',
      statusHistory: arrayUnion({ status: 'cancelled', label: 'Booking Cancelled by Furparent', time: now() }),
    });

    const txn = {
      id: 't' + Date.now(),
      type: 'refund',
      amount: +bk.price,
      description: `Refund – ${bk.bookingNo}`,
      date: today(),
    };
    await updateDoc(doc(db, 'users', uid, 'wallet', 'main'), {
      balance: increment(bk.price),
      transactions: arrayUnion(txn),
    });
  };

  // Wallet
  const topUp = async (amount, method) => {
    if (!uid) return;
    const txn = {
      id: 't' + Date.now(),
      type: 'top-up',
      amount: +amount,
      description: `${method} Top Up`,
      date: today(),
    };
    await updateDoc(doc(db, 'users', uid, 'wallet', 'main'), {
      balance: increment(amount),
      transactions: arrayUnion(txn),
    });
  };

  return (
    <AppContext.Provider value={{
      authUser, loading,
      user, updateUser,
      pets, addPet, updatePet, removePet,
      bookings, addBooking, cancelBooking,
      wallet, topUp,
    }}>
      {children}
    </AppContext.Provider>
  );
}
