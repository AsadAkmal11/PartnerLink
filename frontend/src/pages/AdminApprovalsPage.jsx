import { useCallback, useEffect, useState } from 'react';
import { Button, PageHead, Segmented, Stamp } from '../components/ui.jsx';
import { api } from '../services/api.js';

const when = (iso) =>
  new Date(iso).toLocaleString(undefined, { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

export default function AdminApprovalsPage() {
  const [status, setStatus] = useState('PENDING');
  const [rows, setRows] = useState(null);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      setRows(await api.approvals(status || undefined));
    } catch (err) {
      setError(err.message);
      setRows([]);
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
    <>
      <PageHead label="05 — Approvals" title="Faculty desk.">
        Audit-backed workflow: every decision stores who acted and when. Students only see approved faculty.
      </PageHead>

      <div className="section-head rise" style={{ '--d': 140 }}>
        <Segmented
          label="Filter by status"
          value={status}
          onChange={setStatus}
          options={[
            { value: 'PENDING', label: 'Pending' },
            { value: 'APPROVED', label: 'Approved' },
            { value: 'REJECTED', label: 'Rejected' },
            { value: '', label: 'All' },
          ]}
        />
        <p className="label">{rows ? `${rows.length} requests` : 'Loading…'}</p>
      </div>

      {error && <p className="err">{error}</p>}
      {rows === null && <p className="loading">Loading requests</p>}
      {rows?.length === 0 && <p className="empty">No requests in this filter.</p>}

      {rows?.length > 0 && (
        <ol className="rows" key={status}>
          {rows.map((row, i) => (
            <li key={row.id} className="row" data-s={row.status} style={{ '--n': i }}>
              <div className="row-m">
                <h3>{row.professor_name}</h3>
                <span className="row-meta">
                  {row.professor_email} · {row.department}
                </span>
                <span className="tags">
                  {row.domains.map((d) => (
                    <span key={d.id} className="tag tag-domain">
                      {d.name}
                    </span>
                  ))}
                </span>
                <span className="row-meta">
                  Requested {when(row.created_at)}
                  {row.acted_at ? ` · Acted ${when(row.acted_at)}` : ''}
                  {row.note ? ` · ${row.note}` : ''}
                </span>
              </div>
              <div className="row-r">
                <Stamp status={row.status} />
                {row.status === 'PENDING' && (
                  <div className="row-act">
                    <Button size="sm" variant="solid" disabled={busyId === row.id} onClick={() => act(row.id, 'approve')}>
                      Approve
                    </Button>
                    <Button size="sm" disabled={busyId === row.id} onClick={() => act(row.id, 'reject')}>
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ol>
      )}
    </>
  );
}
