import { useState } from 'react';
import Layout from '../components/Layout';
import { useApp } from '../context/AppContext';
import { IcWallet, IcTopUp, IcCheck } from '../components/Icons';

const PRESETS   = [100, 200, 500, 1000];
const METHODS   = [
  { id: 'GCash',      label: 'GCash',      icon: '💙' },
  { id: 'Maya',       label: 'Maya',       icon: '💚' },
  { id: 'BankTransfer', label: 'Bank Transfer', icon: '🏦' },
];

const TX_STYLE = {
  'top-up':  { dot: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700', sign: '+', label: 'Top Up' },
  'payment': { dot: 'bg-red-400',     badge: 'bg-red-50 text-red-500',         sign: '−', label: 'Payment' },
  'refund':  { dot: 'bg-blue-500',    badge: 'bg-blue-50 text-blue-700',       sign: '+', label: 'Refund'  },
};

export default function Wallet() {
  const { wallet, topUp } = useApp();

  const [amount, setAmount]   = useState('');
  const [method, setMethod]   = useState('GCash');
  const [success, setSuccess] = useState(false);
  const [busy, setBusy]       = useState(false);
  const [customAmt, setCustomAmt] = useState(false);

  const parsed = parseInt(amount, 10);
  const valid  = !isNaN(parsed) && parsed >= 50 && parsed <= 50000;

  const handleTopUp = () => {
    if (!valid) return;
    setBusy(true);
    // Simulate network delay for realism
    setTimeout(() => {
      topUp(parsed, method);
      setSuccess(true);
      setAmount('');
      setCustomAmt(false);
      setBusy(false);
      setTimeout(() => setSuccess(false), 3000);
    }, 900);
  };

  return (
    <Layout>
      <div className="max-w-lg mx-auto space-y-5">
        {/* Page title */}
        <div>
          <h1 className="text-xl font-bold text-gray-800">Wallet</h1>
          <p className="text-sm text-gray-400">Manage your balance and top up</p>
        </div>

        {/* Balance hero card */}
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 text-white shadow-lg shadow-blue-200">
          {/* Background circles */}
          <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/10 rounded-full" />
          <div className="absolute bottom-0 left-1/2 w-56 h-56 bg-white/5 rounded-full -translate-x-1/2 translate-y-1/4" />

          <div className="relative">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-white/20 backdrop-blur-sm p-2 rounded-xl">
                <IcWallet className="w-5 h-5 fill-white" />
              </div>
              <p className="text-blue-100 text-sm font-medium">PawActive Wallet</p>
            </div>
            <p className="text-blue-200 text-sm mb-1">Available Balance</p>
            <p className="text-4xl sm:text-5xl font-extrabold tracking-tight">
              ₱<span>{wallet.balance.toLocaleString()}</span>
              <span className="text-xl sm:text-2xl font-normal text-blue-200">.00</span>
            </p>
            <p className="text-blue-200 text-xs mt-3">
              {wallet.transactions.length} transaction{wallet.transactions.length !== 1 ? 's' : ''} total
            </p>
          </div>
        </div>

        {/* Top Up form */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800">Top Up Wallet</h2>
            {success && (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                <IcCheck className="w-3.5 h-3.5 fill-emerald-500" /> Added!
              </span>
            )}
          </div>

          {/* Preset amounts */}
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Select Amount</p>
            <div className="grid grid-cols-4 gap-2">
              {PRESETS.map(p => (
                <button
                  key={p}
                  onClick={() => { setAmount(String(p)); setCustomAmt(false); }}
                  className={`py-2.5 rounded-xl text-sm font-semibold border-2 transition active:scale-95 ${
                    Number(amount) === p && !customAmt
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-100 text-gray-600 hover:border-blue-200 hover:bg-blue-50'
                  }`}
                >
                  ₱{p}
                </button>
              ))}
            </div>
          </div>

          {/* Custom amount toggle */}
          <button
            onClick={() => { setCustomAmt(true); setAmount(''); }}
            className="text-xs text-blue-600 font-semibold mb-3 hover:underline"
          >
            + Enter custom amount
          </button>

          {customAmt && (
            <div className="mb-4">
              <label className="text-xs text-gray-400 mb-1 block">Custom Amount (₱50 – ₱50,000)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold text-sm">₱</span>
                <input
                  type="number"
                  min={50}
                  max={50000}
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="0"
                  className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              {amount && !isNaN(Number(amount)) && (Number(amount) < 50 || Number(amount) > 50000) && (
                <p className="text-xs text-red-400 mt-1">Amount must be between ₱50 and ₱50,000</p>
              )}
            </div>
          )}

          {/* Payment method */}
          <div className="mb-5">
            <p className="text-xs text-gray-400 mb-2">Payment Method</p>
            <div className="space-y-2">
              {METHODS.map(m => (
                <label key={m.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition ${
                    method === m.id ? 'border-blue-500 bg-blue-50' : 'border-gray-100 hover:border-blue-200'
                  }`}
                >
                  <input type="radio" name="method" value={m.id} checked={method === m.id}
                    onChange={() => setMethod(m.id)} className="sr-only" />
                  <span className="text-xl">{m.icon}</span>
                  <span className="text-sm font-medium text-gray-700 flex-1">{m.label}</span>
                  {method === m.id && <IcCheck className="w-4 h-4 fill-blue-600" />}
                </label>
              ))}
            </div>
          </div>

          <button
            onClick={handleTopUp}
            disabled={!valid || busy}
            className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold transition ${
              valid && !busy
                ? 'bg-blue-600 hover:bg-blue-700 text-white active:scale-95 shadow-md shadow-blue-200'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <IcTopUp className="w-4 h-4 fill-current" />
            {busy ? 'Processing…' : `Top Up ${valid ? '₱' + parsed.toLocaleString() : ''}`}
          </button>
        </div>

        {/* Transaction history */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Transaction History</h2>

          {wallet.transactions.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No transactions yet.</p>
          ) : (
            <div className="space-y-3">
              {wallet.transactions.map((tx, i) => {
                const meta = TX_STYLE[tx.type] ?? TX_STYLE['top-up'];
                return (
                  <div key={tx.id ?? i} className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${meta.dot}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-700 truncate">{tx.description}</p>
                      <p className="text-xs text-gray-400">{tx.date}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full mr-2 ${meta.badge}`}>
                        {meta.label}
                      </span>
                      <span className={`text-sm font-bold ${tx.amount > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                        {meta.sign}₱{Math.abs(tx.amount).toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
