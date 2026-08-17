import { useEffect, useState } from 'react';
import { createTransaction, updateTransaction } from '../api';
import { PAYMENT_TYPES } from '../constants';
import { useCategories } from '../hooks/useCategories';

export default function TransactionModal({ onClose, onSaved, editing }) {
  const isEditing = Boolean(editing);
  const { categories, loading: categoriesLoading } = useCategories();

  const [form, setForm] = useState(
    isEditing
      ? {
          amount: editing.amount,
          type: editing.type,
          category: editing.category,
          account: editing.account,
          date: editing.date.slice(0, 10),
          notes: editing.notes || '',
        }
      : {
          amount: '',
          type: 'expense',
          category: '',
          account: 'Cash',
          date: new Date().toISOString().slice(0, 10),
          notes: '',
        }
  );
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // Once categories load, default a new entry to the first one
  useEffect(() => {
    if (!isEditing && !form.category && categories.length > 0) {
      setForm((f) => ({ ...f, category: categories[0].name }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!form.amount || Number(form.amount) <= 0) {
      setError('Enter a valid amount');
      return;
    }
    if (!form.category) {
      setError('Choose a category');
      return;
    }

    setSaving(true);
    try {
      const payload = { ...form, amount: Number(form.amount) };
      if (isEditing) {
        await updateTransaction(editing._id, payload);
      } else {
        await createTransaction(payload);
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{isEditing ? 'Edit entry' : 'New entry'}</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Amount
            <input
              type="number"
              name="amount"
              value={form.amount}
              onChange={handleChange}
              placeholder="0.00"
              step="0.01"
              autoFocus
            />
          </label>

          <label>
            Type
            <select name="type" value={form.type} onChange={handleChange}>
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </label>

          <label>
            Category
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              disabled={categoriesLoading || categories.length === 0}
            >
              {categories.length === 0 && (
                <option value="">
                  {categoriesLoading ? 'Loading…' : 'No categories yet'}
                </option>
              )}
              {categories.map((c) => (
                <option key={c._id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </label>

          <label>
            Payment Type
            <select name="account" value={form.account} onChange={handleChange}>
              {PAYMENT_TYPES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </label>

          <label>
            Date
            <input type="date" name="date" value={form.date} onChange={handleChange} />
          </label>

          <label>
            Notes
            <input
              type="text"
              name="notes"
              value={form.notes}
              onChange={handleChange}
              placeholder="Optional"
            />
          </label>

          {error && <p className="form-error">{error}</p>}
          {!categoriesLoading && categories.length === 0 && (
            <p className="form-error">Add a category in Settings before creating an entry.</p>
          )}

          <div className="modal-actions">
            <button type="button" className="ledger-btn ghost" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="ledger-btn"
              disabled={saving || categories.length === 0}
            >
              {saving ? 'Saving…' : isEditing ? 'Save changes' : 'Save entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
