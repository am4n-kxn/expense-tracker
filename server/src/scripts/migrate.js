// One-time migration — run this ONCE, after you've signed in with Google at least once.
// From the server folder: node src/scripts/migrate.js
import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import Budget from '../models/Budget.js';
import Category from '../models/Category.js';

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  const users = await User.find();
  if (users.length === 0) {
    console.error('No users found. Sign in with Google once first, then run this script.');
    process.exit(1);
  }
  if (users.length > 1) {
    console.error(
      `Found ${users.length} users — this script only auto-migrates when there's exactly one, ` +
      'to avoid guessing which account your old data belongs to. Migrate manually instead.'
    );
    process.exit(1);
  }

  const userId = users[0]._id;
  console.log(`Attaching pre-auth data to: ${users[0].email}`);

  const txResult = await Transaction.updateMany(
    { user: { $exists: false } },
    { user: userId }
  );
  const budgetResult = await Budget.updateMany(
    { user: { $exists: false } },
    { user: userId }
  );
  const catResult = await Category.updateMany(
    { user: { $exists: false } },
    { user: userId }
  );

  console.log(`Transactions migrated: ${txResult.modifiedCount}`);
  console.log(`Budgets migrated: ${budgetResult.modifiedCount}`);
  console.log(`Categories migrated: ${catResult.modifiedCount}`);

  // Drop the old single-user unique indexes — if left in place, they'd stop a
  // second person from ever using the same category name or the same
  // category+month budget combo as anyone else.
  const catCollection = mongoose.connection.collection('categories');
  const budgetCollection = mongoose.connection.collection('budgets');

  const catIndexes = await catCollection.indexes();
  if (catIndexes.some((i) => i.name === 'name_1')) {
    await catCollection.dropIndex('name_1');
    console.log('Dropped old categories.name_1 index');
  }

  const budgetIndexes = await budgetCollection.indexes();
  if (budgetIndexes.some((i) => i.name === 'category_1_month_1')) {
    await budgetCollection.dropIndex('category_1_month_1');
    console.log('Dropped old budgets.category_1_month_1 index');
  }

  console.log('Migration complete.');
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
