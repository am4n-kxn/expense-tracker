import Transaction from '../models/Transaction.js';

// GET /api/transactions — list, with optional filters (always scoped to the signed-in user)
export async function getTransactions(req, res) {
  try {
    const { category, account, type, from, to, search } = req.query;
    const filter = { user: req.userId };

    if (category) filter.category = category;
    if (account) filter.account = account;
    if (type) filter.type = type;
    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = new Date(from);
      if (to) filter.date.$lte = new Date(to);
    }
    if (search) {
      filter.notes = { $regex: search, $options: 'i' };
    }

    const transactions = await Transaction.find(filter).sort({ date: -1 });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// POST /api/transactions — create, owned by the signed-in user
export async function createTransaction(req, res) {
  try {
    const transaction = await Transaction.create({ ...req.body, user: req.userId });
    res.status(201).json(transaction);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

// PUT /api/transactions/:id — update, only if it belongs to the signed-in user
export async function updateTransaction(req, res) {
  try {
    const { user, ...updates } = req.body; // never let the body override ownership
    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      updates,
      { new: true, runValidators: true }
    );
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    res.json(transaction);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

// DELETE /api/transactions/:id — only if it belongs to the signed-in user
export async function deleteTransaction(req, res) {
  try {
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      user: req.userId,
    });
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    res.json({ message: 'Deleted', id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
