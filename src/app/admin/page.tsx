'use client';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [topups, setTopups] = useState<any[]>([]);
  const [withdraws, setWithdraws] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const fetchData = async () => {
    const resTop = await fetch('/api/admin/topups');
    const dataTop = await resTop.json();
    setTopups(dataTop);

    const resWd = await fetch('/api/admin/withdraws');
    const dataWd = await resWd.json();
    setWithdraws(dataWd);
  };
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.isAdmin) {
      fetchData();
    }
    if (status === 'authenticated' && !session?.user?.isAdmin) {
      router.push('/');
    }
  }, [status, session]);
  const confirmTopup = async (id: string) => {
    if (!confirm('↻ Konfirmasi top-up ini?')) return;
    setLoading(true);
    await fetch('/api/topup/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topupId: id }),
    });
    await fetchData();
    setLoading(false);
  };
  const confirmWithdraw = async (id: string) => {
    if (!confirm('↻ Sudah transfer ke user? Konfirmasi WD?')) return;
    setLoading(true);
    await fetch('/api/withdraw/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ withdrawId: id }),
    });
    await fetchData();
    setLoading(false);
  };
  if (status === 'loading') return <div className="container">Loading ↻</div>;
  if (!session?.user?.isAdmin) return null;
  return (
    <div className="container">
      <h1>Admin Panel</h1>
      <p>
        <a href="/">↻ Kembali ke Dashboard User</a>
      </p>
      <h2>Top-up PENDING</h2>
      <table>
        <thead><tr><th>User</th><th>Nominal</th><th>Waktu</th><th>Aksi</th></tr></thead>
        <tbody>
          {topups.filter(t => t.status === 'PENDING').map((t) => (
            <tr key={t.id}>
              <td>{t.user?.email || t.userId}</td>
              <td>Rp {t.amount.toLocaleString()}</td>
              <td>{new Date(t.createdAt).toLocaleString()}</td>
              <td>
                <button onClick={() => confirmTopup(t.id)} disabled={loading} style={{ minWidth: 'auto', padding: '4px 12px' }}>
                  ↻ Konfirm
                </button>
              </td>
            </tr>
          ))}
          {topups.filter(t => t.status === 'PENDING').length === 0 && (
            <tr><td colSpan={4} style={{ textAlign: 'center', color: '#6b5a4a' }}>Tidak ada pending</td></tr>
          )}
        </tbody>
      </table>
      <h2>Withdraw PENDING</h2>
      <table>
        <thead><tr><th>User</th><th>Netto</th><th>Fee</th><th>Total Potong</th><th>Waktu</th><th>Aksi</th></tr></thead>
        <tbody>
          {withdraws.filter(w => w.status === 'PENDING').map((w) => (
            <tr key={w.id}>
              <td>{w.user?.email || w.userId}</td>
              <td>Rp {w.amount.toLocaleString()}</td>
              <td>Rp {w.fee.toLocaleString()}</td>
              <td>Rp {w.totalDeduct.toLocaleString()}</td>
              <td>{new Date(w.createdAt).toLocaleString()}</td>
              <td>
                <button onClick={() => confirmWithdraw(w.id)} disabled={loading} style={{ minWidth: 'auto', padding: '4px 12px' }}>
                  ↻ Selesai
                </button>
              </td>
            </tr>
          ))}
          {withdraws.filter(w => w.status === 'PENDING').length === 0 && (
            <tr><td colSpan={6} style={{ textAlign: 'center', color: '#6b5a4a' }}>Tidak ada pending</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
