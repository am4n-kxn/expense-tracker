import mongoose from 'mongoose';

const budgetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    category: {
      type: String,
      required: true,
    },
    limit: {
      type: Number,
      required: true,
    },
    periodType: {
      type: String,
      enum: ['weekly', 'monthly', 'quarterly', 'custom'],
      required: true,
    },
    // Stored as "YYYY-MM-DD" strings (not Date objects) to sidestep timezone
    // edge cases — the frontend computes these boundaries deterministically
    // from periodType, so they double as the natural uniqueness key.
    startDate: {
      type: String,
      required: true,
    },
    endDate: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// One budget per category per exact period, per user
budgetSchema.index(
  { user: 1, category: 1, periodType: 1, startDate: 1, endDate: 1 },
  { unique: true }
);

export default mongoose.model('Budget', budgetSchema);
