import { useCallback, useEffect, useState } from 'react';
import Badge from '../components/common/Badge.jsx';
import Button from '../components/common/Button.jsx';
import Card from '../components/common/Card.jsx';
import { api } from '../services/api.js';

export default function AdminApprovalsPage() {
  const [status, setStatus] = useState('PENDING');
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      const data = await api.approvals(status || undefined);
      setRows(data);
    } catch (err) {
      setError(err.message);
    }
  }, [status]);

  useEffect(() => {
    load();
  }, [load]);

  async function act(id, action) {
    setBusyId(id);
    try {
      if (action === 'approve') await api.approve(id);
      else await api.reject(id, 'Rejected by admin');
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId('');
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-bold tracking-tight">Faculty approvals</h1>
        <p className="mt-2 text-text-secondary">
          Audit-backed workflow: every decision stores who acted and when.
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        {['PENDING', 'APPROVED', 'REJECTED', ''].map((value) => (
          <button
            key={value || 'ALL'}
            type="button"
            onClick={() => setStatus(value)}
            className={`rounded-full px-4 py-2 text-sm font-medium ${
              status === value ? 'bg-primary text-on-primary' : 'border border-border text-text-muted'
            }`}
          >
            {value || 'All'}
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-error">{error}</p>}

      <div className="space-y-4">
        {rows.map((row) => (
          <Card key={row.id} elevated className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-lg font-semibold">{row.professor_name}</h2>
                <p className="text-sm text-text-muted">
                  {row.professor_email} · {row.department}
                </p>
              </div>
              <Badge
                variant={
                  row.status === 'APPROVED' ? 'success' : row.status === 'PENDING' ? 'gold' : 'default'
                }
              >
                {row.status}
              </Badge>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {row.domains.map((d) => (
                <Badge key={d.id} variant="outline">
                  {d.name}
                </Badge>
              ))}
            </div>
            <p className="mt-3 text-xs text-text-muted">
              Requested {new Date(row.created_at).toLocaleString()}
              {row.acted_at ? ` · Acted ${new Date(row.acted_at).toLocaleString()}` : ''}
              {row.note ? ` · ${row.note}` : ''}
            </p>
            {row.status === 'PENDING' && (
              <div className="mt-4 flex flex-wrap gap-2">
                <Button size="sm" disabled={busyId === row.id} onClick={() => act(row.id, 'approve')}>
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={busyId === row.id}
                  onClick={() => act(row.id, 'reject')}
                >
                  Reject
                </Button>
              </div>
            )}
          </Card>
        ))}
        {rows.length === 0 && <Card className="p-6 text-sm text-text-muted">No requests in this filter.</Card>}
      </div>
    </div>
  );
}
