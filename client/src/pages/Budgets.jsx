import { useEffect, useMemo, useState } from 'react';
import { getBudgets, getTransactions, deleteBudget } from '../api';
import BudgetModal from '../components/BudgetModal';
import { getPeriodRange, shiftPeriod, periodLabel, dateToStr } from '../periodUtils';

const PERIOD_TYPES = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'custom', label: 'Custom' },
];

function computeSpent(transactions, budget) {
  return transactions
    .filter((t) => t.type === 'expense' && t.category === budget.category)
    .filter((t) => {
      const d = t.date.slice(0, 10);
      return d >= budget.startDate && d <= budget.endDate;
    })
    .reduce((sum, t) => sum + t.amount, 0);
}

export default function Budgets() {
  const [periodType, setPeriodType] = useState('monthly');
  const [referenceDate, setReferenceDate] = useState(new Date());
  const [budgets, setBudgets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const isCustom = periodType === 'custom';
  const { start, end } = isCustom ? {} : getPeriodRange(periodType, referenceDate);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const params = isCustom
        ? { periodType }
        : { periodType, startDate: dateToStr(start), endDate: dateToStr(end) };
      const [budgetData, txData] = await Promise.all([
        getBudgets(params),
        getTransactions(),
      ]);
      setBudgets(budgetData);
      setTransactions(txData);
    } catch (err) {
      setError('Could not reach the server. Is it running?');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [periodType, isCustom ? null : dateToStr(start)]);

  const takenCategories = budgets.map((b) => b.category);

  function openAddModal() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEditModal(budget) {
    setEditing(budget);
    setModalOpen(true);
  }

  async function handleDelete(id) {
    try {
      await deleteBudget(id);
      setBudgets((prev) => prev.filter((b) => b._id !== id));
    } catch (err) {
      setError('Could not delete that budget');
    }
  }

  return (
    <>
      <div className="page-header">
        <div>
          <p className="page-eyebrow">Budgets</p>
          <h1 className="page-title">Budgets</h1>
        </div>
        <button className="ledger-btn" onClick={openAddModal}>
          + Set budget
        </button>
      </div>

      <div className="sort-bar">
        <span className="sort-label">Period</span>
        <select
          className="sort-select"
          value={periodType}
          onChange={(e) => {
            setPeriodType(e.target.value);
            setReferenceDate(new Date());
          }}
        >
          {PERIOD_TYPES.map((p) => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>

        {!isCustom && (
          <>
            <button
              className="sort-dir"
              onClick={() => setReferenceDate(shiftPeriod(periodType, referenceDate, -1))}
              title="Previous period"
            >
              ◀
            </button>
            <span className="sort-label">{periodLabel(periodType, start, end)}</span>
            <button
              className="sort-dir"
              onClick={() => setReferenceDate(shiftPeriod(periodType, referenceDate, 1))}
              title="Next period"
            >
              ▶
            </button>
          </>
        )}
      </div>

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

        {!loading && !error && budgets.length === 0 && (
          <div className="empty-state">
            <div className="empty-mark">— · —</div>
            <p>
              {isCustom
                ? 'No custom budgets yet. Add one below to get started.'
                : `No budgets set for ${periodLabel(periodType, start, end)}. Add a category limit to track it here.`}
            </p>
          </div>
        )}

        {!loading && !error && budgets.map((b) => {
          const spent = computeSpent(transactions, b);
          const pct = Math.min((spent / b.limit) * 100, 100);
          const isOver = spent > b.limit;
          const state = isOver ? 'over' : pct >= 80 ? 'warn' : 'ok';

          return (
            <div className="budget-row" key={b._id}>
              <div className="budget-row-top">
                <span className="budget-category">
                  {b.category}
                  {isCustom && (
                    <span className="budget-range-tag">
                      {periodLabel('custom', new Date(b.startDate), new Date(b.endDate))}
                    </span>
                  )}
                </span>
                <span className="budget-figures">
                  ₹{spent.toFixed(2)} <span className="budget-of">of</span> ₹{b.limit.toFixed(2)}
                </span>
                <span className="tx-row-actions">
                  <button className="tx-edit" onClick={() => openEditModal(b)} title="Edit">
                    ✎
                  </button>
                  <button className="tx-delete" onClick={() => handleDelete(b._id)} title="Delete">
                    ✕
                  </button>
                </span>
              </div>
              <div className="budget-bar-track">
                <div
                  className={`budget-bar-fill ${state}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              {isOver && (
                <p className="budget-over-note">
                  Over by ₹{(spent - b.limit).toFixed(2)}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {modalOpen && (
        <BudgetModal
          periodType={periodType}
          start={isCustom ? null : start}
          end={isCustom ? null : end}
          editing={editing}
          takenCategories={takenCategories}
          onClose={() => setModalOpen(false)}
          onSaved={load}
        />
      )}
    </>
  );
}
