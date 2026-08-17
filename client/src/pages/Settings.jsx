import { useState } from 'react';
import { useCategories } from '../hooks/useCategories';
import { createCategory, renameCategory, deleteCategory } from '../api';

export default function Settings() {
  const { categories, loading, error, reload } = useCategories();
  const [newName, setNewName] = useState('');
  const [addError, setAddError] = useState('');
  const [adding, setAdding] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [rowError, setRowError] = useState('');

  async function handleAdd(e) {
    e.preventDefault();
    setAddError('');
    const trimmed = newName.trim();
    if (!trimmed) {
      setAddError('Enter a category name');
      return;
    }
    setAdding(true);
    try {
      await createCategory(trimmed);
      setNewName('');
      reload();
    } catch (err) {
      setAddError(err.message);
    } finally {
      setAdding(false);
    }
  }

  function startEdit(category) {
    setEditingId(category._id);
    setEditValue(category.name);
    setRowError('');
  }

  function cancelEdit() {
    setEditingId(null);
    setEditValue('');
    setRowError('');
  }

  async function saveEdit(id) {
    const trimmed = editValue.trim();
    if (!trimmed) {
      setRowError('Name cannot be empty');
      return;
    }
    try {
      await renameCategory(id, trimmed);
      setEditingId(null);
      reload();
    } catch (err) {
      setRowError(err.message);
    }
  }

  async function handleDelete(id) {
    if (categories.length <= 1) return;
    try {
      await deleteCategory(id);
      reload();
    } catch (err) {
      setRowError('Could not delete that category');
    }
  }

  return (
    <>
      <div className="page-header">
        <div>
          <p className="page-eyebrow">Categories &amp; accounts</p>
          <h1 className="page-title">Settings</h1>
        </div>
      </div>

      <div className="ledger-card">
        <h2>Categories</h2>

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

        {!loading && !error && categories.length === 0 && (
          <div className="empty-state">
            <div className="empty-mark">— · —</div>
            <p>No categories yet. Add one below to get started.</p>
          </div>
        )}

        {!loading && !error && categories.map((c) => (
          <div className="settings-row" key={c._id}>
            {editingId === c._id ? (
              <>
                <input
                  type="text"
                  className="settings-edit-input"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') saveEdit(c._id);
                    if (e.key === 'Escape') cancelEdit();
                  }}
                />
                <span className="tx-row-actions">
                  <button className="tx-edit" onClick={() => saveEdit(c._id)} title="Save">
                    ✓
                  </button>
                  <button className="tx-delete" onClick={cancelEdit} title="Cancel">
                    ✕
                  </button>
                </span>
              </>
            ) : (
              <>
                <span className="settings-category-name">{c.name}</span>
                <span className="tx-row-actions">
                  <button className="tx-edit" onClick={() => startEdit(c)} title="Rename">
                    ✎
                  </button>
                  <button
                    className="tx-delete"
                    onClick={() => handleDelete(c._id)}
                    title={categories.length <= 1 ? "Can't delete your last category" : 'Delete'}
                    disabled={categories.length <= 1}
                  >
                    ✕
                  </button>
                </span>
              </>
            )}
          </div>
        ))}

        {rowError && <p className="form-error">{rowError}</p>}

        <form className="settings-add-form" onSubmit={handleAdd}>
          <input
            type="text"
            placeholder="New category name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <button type="submit" className="ledger-btn" disabled={adding}>
            {adding ? 'Adding…' : '+ Add'}
          </button>
        </form>
        {addError && <p className="form-error">{addError}</p>}

        <p className="settings-note">
          Renaming a category updates it everywhere — existing transactions and budgets
          switch to the new name automatically. Deleting one only removes it from the
          picker; past transactions keep their original label.
        </p>
      </div>
    </>
  );
}
