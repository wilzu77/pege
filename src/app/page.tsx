'use client';

import { useState, useEffect } from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';
import StaticQR from '@/components/StaticQR';

export default function HomePage() {
  const { data: session, status } = useSession();
  const [balance, setBalance] = useState(0);
  const [topupAmount, setTopupAmount] = useState(10000);
  const [wdAmount, setWdAmount] = useState(10000);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchBalance = async () => {
    if (!session) return;
    const res = await fetch('/api/user/balance');
    const data = await res.json();
    if (data.balance !== undefined) setBalance(data.balance);
  };

  useEffect(() => {
    if (session) fetchBalance();
  }, [session]);

  const handleTopup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    const res = await fetch('/api/topup/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: topupAmount }),
    });
    const data = await res.json();
    if (res.ok) {
      setMessage('↻ Request top-up berhasil. Silakan scan QR & bayar, lalu admin akan konfirmasi.');
    } else {
      setMessage('↻ Gagal: ' + data.error);
    }
    setLoading(false);
    fetchBalance();
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    const res = await fetch('/api/withdraw/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: wdAmount }),
    });
    const data = await res.json();
    if (res.ok) {
      setMessage(`↻ Request WD berhasil. Saldo terpotong. Tunggu admin transfer.`);
    } else {
      setMessage('↻ Gagal: ' + data.error);
    }
    setLoading(false);
    fetchBalance();
  };

  if (status === 'loading') return <div className="container">Memuat ↻</div>;

  if (!session) {
    return (
      <div className="container">
        <h1>QRIS Payment Classic</h1>
        <div className="card">
          <p style={{ marginBottom: '16px' }}>Login untuk mulai transaksi.</p>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const email = (e.target as any).email.value;
              const password = (e.target as any).password.value;
              await signIn('credentials', { email, password, callbackUrl: '/' });
            }}
          >
            <label>Email</label>
            <input type="email" name="email" required />
            <label>Password</label>
            <input type="password" name="password" required />
            <button type="submit">↻ Login</button>
          </form>
          <p style={{ marginTop: '12px', fontSize: '0.9rem', color: '#6b5a4a' }}>
            * Akun default: admin@domain.com / rahasia123 (buat sendiri via seed)
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Dashboard</h1>
        <div>
          <span style={{ color: '#a3917e', marginRight: '12px' }}>↻ {session.user?.name}</span>
          <button className="secondary" onClick={() => signOut()} style={{ padding: '4px 16px', minWidth: 'auto' }}>
            Logout
          </button>
        </div>
      </div>

      <div className="card" style={{ background: '#1a1111', borderColor: '#4a2a2a' }}>
        <h2 style={{ borderBottom: 'none', marginBottom: '4px' }}>Saldo</h2>
        <p style={{ fontSize: '2.4rem', fontWeight: 'bold', color: '#d4c9b8' }}>
          Rp {balance.toLocaleString('id-ID')}
        </p>
      </div>

      <div className="row">
        {/* Kolom Top-up */}
        <div className="col">
          <h2>Top-up</h2>
          <div className="card">
            <StaticQR />
            <form onSubmit={handleTopup}>
              <label>Nominal (Rp)</label>
              <input
                type="number"
                value={topupAmount}
                onChange={(e) => setTopupAmount(Number(e.target.value))}
                min={1000}
                step={1000}
              />
              <button type="submit" disabled={loading}>
                ↻ Request Top-up
              </button>
            </form>
          </div>
        </div>

        {/* Kolom Withdraw */}
        <div className="col">
          <h2>Withdraw</h2>
          <div className="card">
            <form onSubmit={handleWithdraw}>
              <label>Nominal WD (Min 10.000)</label>
              <input
                type="number"
                value={wdAmount}
                onChange={(e) => setWdAmount(Number(e.target.value))}
                min={10000}
                step={1000}
              />
              <p style={{ fontSize: '0.8rem', color: '#6b5a4a', marginBottom: '12px' }}>
                ↻ Biaya: Pajak Rp 1.000 + Fee QR Rp 300 (total Rp 1.300)
              </p>
              <button type="submit" disabled={loading}>
                ↻ Request WD
              </button>
            </form>
          </div>
        </div>
      </div>

      {message && (
        <div className="card" style={{ borderColor: '#8b0000', background: '#1a0c0c' }}>
          <p style={{ color: '#d4c9b8', whiteSpace: 'pre-wrap' }}>{message}</p>
        </div>
      )}

      {session.user?.isAdmin && (
        <div style={{ marginTop: '24px', padding: '12px', border: '1px dashed #3a1c1c' }}>
          <p>
            <a href="/admin" style={{ fontWeight: 'bold' }}>
              ↻ Buka Dashboard Admin
            </a>
          </p>
        </div>
      )}
      {/* Hidden endpoint untuk get balance Bywilzu */}
    </div>
  );
}