import Category from '../models/Category.js';
import Transaction from '../models/Transaction.js';
import Budget from '../models/Budget.js';

// GET /api/categories — only this user's categories
export async function getCategories(req, res) {
  try {
    const categories = await Category.find({ user: req.userId }).sort({ name: 1 });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// POST /api/categories — create a new category, owned by the signed-in user
export async function createCategory(req, res) {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Category name is required' });
    }
    const category = await Category.create({ name: name.trim(), user: req.userId });
    res.status(201).json(category);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: 'That category already exists' });
    }
    res.status(400).json({ error: err.message });
  }
}

// PUT /api/categories/:id — rename a category (only if it belongs to this user),
// cascading the new name to every transaction and budget of theirs that referenced it
export async function renameCategory(req, res) {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Category name is required' });
    }
    const newName = name.trim();

    const category = await Category.findOne({ _id: req.params.id, user: req.userId });
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    const oldName = category.name;

    category.name = newName;
    await category.save();

    if (oldName !== newName) {
      await Transaction.updateMany(
        { category: oldName, user: req.userId },
        { category: newName }
      );
      await Budget.updateMany(
        { category: oldName, user: req.userId },
        { category: newName }
      );
    }

    res.json(category);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: 'That category already exists' });
    }
    res.status(400).json({ error: err.message });
  }
}

// DELETE /api/categories/:id — only if it belongs to the signed-in user
export async function deleteCategory(req, res) {
  try {
    const category = await Category.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    // Existing transactions/budgets keep the old category name as plain text —
    // nothing to cascade on delete.
    res.json({ message: 'Deleted', id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
