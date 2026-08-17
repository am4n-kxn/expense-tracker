import { useEffect, useMemo, useState } from 'react';
import { getTransactions, deleteTransaction } from '../api';
import TransactionModal from '../components/TransactionModal';

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
  });
}

const SORT_OPTIONS = [
  { value: 'date', label: 'Date' },
  { value: 'amount', label: 'Amount' },
  { value: 'category', label: 'Category' },
  { value: 'type', label: 'Type' },
];

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [sortBy, setSortBy] = useState('date');
  const [sortDir, setSortDir] = useState('desc');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const data = await getTransactions();
      setTransactions(data);
    } catch (err) {
      setError('Could not reach the server. Is it running?');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const sortedTransactions = useMemo(() => {
    const dir = sortDir === 'asc' ? 1 : -1;
    return [...transactions].sort((a, b) => {
      switch (sortBy) {
        case 'amount':
          return (a.amount - b.amount) * dir;
        case 'category':
          return a.category.localeCompare(b.category) * dir;
        case 'type':
          return a.type.localeCompare(b.type) * dir;
        case 'date':
        default:
          return (new Date(a.date) - new Date(b.date)) * dir;
      }
    });
  }, [transactions, sortBy, sortDir]);

  function toggleDir() {
    setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
  }

  async function handleDelete(id) {
    try {
      await deleteTransaction(id);
      setTransactions((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      setError('Could not delete that entry');
    }
  }

  function openAddModal() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEditModal(transaction) {
    setEditing(transaction);
    setModalOpen(true);
  }

  return (
    <>
      <div className="page-header">
        <div>
          <p className="page-eyebrow">All entries</p>
          <h1 className="page-title">Transactions</h1>
        </div>
        <button className="ledger-btn" onClick={openAddModal}>
          + Add entry
        </button>
      </div>

      {!loading && !error && transactions.length > 0 && (
        <div className="sort-bar">
          <span className="sort-label">Sort by</span>
          <select
            className="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <button className="sort-dir" onClick={toggleDir} title="Toggle direction">
            {sortDir === 'asc' ? '↑ Asc' : '↓ Desc'}
          </button>
        </div>
      )}

      <div className="ledger-card">
        {loading && (
          <div className="empty-state">
            <div className="empty-mark">— · —</div>
            <p>Loading…</p>
          </div>
        )}

        {!loading && error && (
          <div className="empty-state">
            <div className="empty-mark">— · —</div>
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && transactions.length === 0 && (
          <div className="empty-state">
            <div className="empty-mark">— · —</div>
            <p>Nothing logged yet. Add your first transaction to start the ledger.</p>
          </div>
        )}

        {!loading && !error && sortedTransactions.map((t) => (
          <div className="tx-row" key={t._id}>
            <span className="tx-date">{formatDate(t.date)}</span>
            <span>
              <span className="tx-category">{t.category}</span>
              {t.notes && <span className="tx-notes">{t.notes}</span>}
            </span>
            <span className="tx-account">{t.account}</span>
            <span className={`tx-amount ${t.type === 'income' ? 'credit' : 'debit'}`}>
              {t.type === 'income' ? '+' : '−'}₹{t.amount.toFixed(2)}
            </span>
            <span className="tx-row-actions">
              <button className="tx-edit" onClick={() => openEditModal(t)} title="Edit">
                ✎
              </button>
              <button className="tx-delete" onClick={() => handleDelete(t._id)} title="Delete">
                ✕
              </button>
            </span>
          </div>
        ))}
      </div>

      {modalOpen && (
        <TransactionModal
          editing={editing}
          onClose={() => setModalOpen(false)}
          onSaved={load}
        />
      )}
    </>
  );
}
