// One-time migration — run this ONCE after deploying the flexible-period
// Budget schema. From the server folder: node src/scripts/migrate-budget-periods.js
import 'dotenv/config';
import mongoose from 'mongoose';

function lastDayOfMonth(year, monthIndex) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

function toDateStr(year, monthIndex, day) {
  const mm = String(monthIndex + 1).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  return `${year}-${mm}-${dd}`;
}

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  const collection = mongoose.connection.collection('budgets');
  const oldBudgets = await collection.find({ month: { $exists: true } }).toArray();

  if (oldBudgets.length === 0) {
    console.log('No old month-based budgets found — nothing to migrate.');
  } else {
    console.log(`Converting ${oldBudgets.length} old budget(s)...`);
    for (const b of oldBudgets) {
      const [year, month] = b.month.split('-').map(Number);
      const monthIndex = month - 1;
      const startDate = toDateStr(year, monthIndex, 1);
      const endDate = toDateStr(year, monthIndex, lastDayOfMonth(year, monthIndex));

      await collection.updateOne(
        { _id: b._id },
        {
          $set: {
            periodType: 'monthly',
            startDate,
            endDate,
            limit: b.monthlyLimit,
          },
          $unset: { month: '', monthlyLimit: '' },
        }
      );
    }
    console.log('Conversion complete.');
  }

  // Drop the old pre-period unique index if it's still there
  const indexes = await collection.indexes();
  if (indexes.some((i) => i.name === 'user_1_category_1_month_1')) {
    await collection.dropIndex('user_1_category_1_month_1');
    console.log('Dropped old user_1_category_1_month_1 index');
  }

  console.log('Migration complete.');
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
