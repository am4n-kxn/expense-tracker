import { useEffect, useState } from 'react';
import { saveBudget } from '../api';
import { useCategories } from '../hooks/useCategories';
import { dateToStr, periodLabel } from '../periodUtils';

export default function BudgetModal({
  onClose,
  onSaved,
  editing,
  takenCategories,
  periodType,
  start,
  end,
}) {
  const isEditing = Boolean(editing);
  const isCustom = periodType === 'custom';
  const { categories, loading: categoriesLoading } = useCategories();

  const availableCategories = isEditing
    ? categories
    : categories.filter((c) => !takenCategories.includes(c.name));

  const [form, setForm] = useState(
    isEditing
      ? {
          category: editing.category,
          limit: editing.limit,
          startDate: editing.startDate,
          endDate: editing.endDate,
        }
      : {
          category: '',
          limit: '',
          startDate: start ? dateToStr(start) : '',
          endDate: end ? dateToStr(end) : '',
        }
  );
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEditing && !form.category && availableCategories.length > 0) {
      setForm((f) => ({ ...f, category: availableCategories[0].name }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!form.category) {
      setError('Choose a category');
      return;
    }
    if (!form.limit || Number(form.limit) <= 0) {
      setError('Enter a valid limit');
      return;
    }
    if (isCustom && !isEditing && (!form.startDate || !form.endDate)) {
      setError('Choose a start and end date');
      return;
    }
    if (isCustom && !isEditing && form.startDate > form.endDate) {
      setError('End date must be after the start date');
      return;
    }

    setSaving(true);
    try {
      await saveBudget({
        category: form.category,
        limit: Number(form.limit),
        periodType: isEditing ? editing.periodType : periodType,
        startDate: isEditing ? editing.startDate : form.startDate,
        endDate: isEditing ? editing.endDate : form.endDate,
      });
      onSaved();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  const rangeLabel = isEditing
    ? editing.startDate && editing.endDate && editing.periodType !== 'custom'
      ? periodLabel(editing.periodType, new Date(editing.startDate), new Date(editing.endDate))
      : `${editing.startDate} – ${editing.endDate}`
    : start && end
      ? periodLabel(periodType, start, end)
      : '';

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{isEditing ? 'Edit budget' : 'Set a budget'}</h2>

        {!isCustom && (
          <p className="modal-subtitle">For {rangeLabel}</p>
        )}

        <form onSubmit={handleSubmit}>
          <label>
            Category
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              disabled={isEditing || categoriesLoading || availableCategories.length === 0}
            >
              {availableCategories.length === 0 && (
                <option value="">
                  {categoriesLoading ? 'Loading…' : 'All categories already budgeted'}
                </option>
              )}
              {availableCategories.map((c) => (
                <option key={c._id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </label>

          {isCustom && !isEditing && (
            <>
              <label>
                Start date
                <input
                  type="date"
                  name="startDate"
                  value={form.startDate}
                  onChange={handleChange}
                />
              </label>
              <label>
                End date
                <input
                  type="date"
                  name="endDate"
                  value={form.endDate}
                  onChange={handleChange}
                />
              </label>
            </>
          )}

          {isCustom && isEditing && (
            <p className="modal-subtitle">For {rangeLabel}</p>
          )}

          <label>
            Limit
            <input
              type="number"
              name="limit"
              value={form.limit}
              onChange={handleChange}
              placeholder="0.00"
              step="0.01"
              autoFocus
            />
          </label>

          {error && <p className="form-error">{error}</p>}

          <div className="modal-actions">
            <button type="button" className="ledger-btn ghost" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="ledger-btn"
              disabled={saving || !form.category}
            >
              {saving ? 'Saving…' : 'Save budget'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
