import Budget from '../models/Budget.js';

// GET /api/budgets?periodType=monthly&startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
// For weekly/monthly/quarterly, pass the exact period range to see. For
// custom, startDate/endDate can be omitted to list every custom budget.
export async function getBudgets(req, res) {
  try {
    const { periodType, startDate, endDate } = req.query;
    const filter = { user: req.userId };
    if (periodType) filter.periodType = periodType;
    if (startDate) filter.startDate = startDate;
    if (endDate) filter.endDate = endDate;

    const budgets = await Budget.find(filter).sort({ category: 1 });
    res.json(budgets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// POST /api/budgets — create, or update if this user already has one for
// this exact category + period
export async function upsertBudget(req, res) {
  try {
    const { category, limit, periodType, startDate, endDate } = req.body;
    if (!category || !periodType || !startDate || !endDate || limit == null) {
      return res.status(400).json({
        error: 'category, limit, periodType, startDate, and endDate are required',
      });
    }
    const budget = await Budget.findOneAndUpdate(
      { category, periodType, startDate, endDate, user: req.userId },
      { category, periodType, startDate, endDate, limit, user: req.userId },
      { new: true, upsert: true, runValidators: true }
    );
    res.status(201).json(budget);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: 'A budget already exists for that category and period' });
    }
    res.status(400).json({ error: err.message });
  }
}

// PUT /api/budgets/:id — update the limit, only if it belongs to the signed-in user
export async function updateBudget(req, res) {
  try {
    const { user, ...updates } = req.body;
    const budget = await Budget.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      updates,
      { new: true, runValidators: true }
    );
    if (!budget) {
      return res.status(404).json({ error: 'Budget not found' });
    }
    res.json(budget);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

// DELETE /api/budgets/:id — only if it belongs to the signed-in user
export async function deleteBudget(req, res) {
  try {
    const budget = await Budget.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!budget) {
      return res.status(404).json({ error: 'Budget not found' });
    }
    res.json({ message: 'Deleted', id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
