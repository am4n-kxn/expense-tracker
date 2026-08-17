import { useEffect, useState } from 'react';
import { getTransactions } from '../api';
import AnalyticsSection from '../components/AnalyticsSection';

function receiptNumber(count) {
  return String(1000 + count).padStart(4, '0');
}

function generatedTimestamp() {
  return new Date().toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function Dashboard() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getTransactions()
      .then(setTransactions)
      .catch(() => setError('Could not reach the server. Is it running?'))
      .finally(() => setLoading(false));
  }, []);

  const income = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const expense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const balance = income - expense;

  const byCategory = transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});
  const categoryEntries = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);

  return (
    <>
      <div className="page-header">
        <div>
          <p className="page-eyebrow">Overview — all time</p>
          <h1 className="page-title">Dashboard</h1>
        </div>
      </div>

      <div className="receipt-card">
        <div className="receipt-scallop top" aria-hidden="true" />
        <div className="receipt-header">
          <span className="receipt-title">Account Summary</span>
          <span className="receipt-meta">
            No. {receiptNumber(transactions.length)}
            <br />
            {generatedTimestamp()}
          </span>
        </div>

        {error && <p className="form-error">{error}</p>}

        {!error && (
          <div className="receipt-items">
            <div className="ledger-row">
              <span className="label">Income</span>
              <span className="leader" />
              <span className="amount credit">₹{income.toFixed(2)}</span>
            </div>
            <div className="ledger-row">
              <span className="label">Expenses</span>
              <span className="leader" />
              <span className="amount debit">₹{expense.toFixed(2)}</span>
            </div>
            <div className="receipt-total-row">
              <span className="label">Balance</span>
              <span className="amount">₹{balance.toFixed(2)}</span>
            </div>
          </div>
        )}

        <div className="receipt-barcode" aria-hidden="true" />
        <p className="receipt-footer-note">kept honestly, mostly</p>
        <div className="receipt-scallop bottom" aria-hidden="true" />
      </div>

      <div className="receipt-card">
        <div className="receipt-scallop top" aria-hidden="true" />
        <div className="receipt-header">
          <span className="receipt-title">Itemised — Spend by Category</span>
          <span className="receipt-meta">
            {categoryEntries.length} {categoryEntries.length === 1 ? 'line' : 'lines'}
          </span>
        </div>

        {!loading && !error && categoryEntries.length === 0 && (
          <div className="empty-state">
            <div className="empty-mark">— · —</div>
            <p>No transactions recorded yet. Add one to see the breakdown here.</p>
          </div>
        )}

        {categoryEntries.length > 0 && (
          <div className="receipt-items">
            {categoryEntries.map(([category, amount]) => (
              <div className="ledger-row" key={category}>
                <span className="label">{category}</span>
                <span className="leader" />
                <span className="amount debit">₹{amount.toFixed(2)}</span>
              </div>
            ))}
            <div className="receipt-total-row">
              <span className="label">Total</span>
              <span className="amount debit">₹{expense.toFixed(2)}</span>
            </div>
          </div>
        )}
        <div className="receipt-scallop bottom" aria-hidden="true" />
      </div>

      {!loading && !error && <AnalyticsSection transactions={transactions} />}
    </>
  );
}
