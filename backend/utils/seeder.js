require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Account = require('../models/Account');
const Category = require('../models/Category');
const Tag = require('../models/Tag');

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/financeapp');
  console.log('Connected to DB');

  // Create demo user
  const existingUser = await User.findOne({ email: 'demo@walletOS.com' });
  let user;
  if (!existingUser) {
    user = await User.create({ name: 'Demo User', email: 'demo@walletOS.com', password: 'demo1234', role: 'user' });
    console.log('✅ Demo user created: demo@walletOS.com / demo1234');
  } else {
    user = existingUser;
    console.log('ℹ️  Demo user already exists');
  }

  // Default accounts
  // পুরনো accounts ও categories delete করো
  await Account.deleteMany({ user: user._id });
  await Category.deleteMany({ user: user._id });
  await Tag.deleteMany({ user: user._id });

  await Account.insertMany([
      { user: user._id, name: 'bKash', color: '#e91e8c', icon: '📱', type: 'General', initialBalance: 5000, currentBalance: 5000 },
      { user: user._id, name: 'Cash Wallet', color: '#10b981', icon: '💵', type: 'Cash', initialBalance: 2000, currentBalance: 2000 },
      { user: user._id, name: 'Bank Account', color: '#6175f4', icon: '🏦', type: 'Savings', initialBalance: 50000, currentBalance: 50000 },
      { user: user._id, name: 'Credit Card', color: '#f59e0b', icon: '💳', type: 'Credit', initialBalance: 0, currentBalance: 0 },
    ]);
  console.log('✅ Default accounts created');

  // Default categories
  const expenseCats = [
      { name: 'Food & Dining', icon: '🍔', color: '#f59e0b', nature: 'Need', type: 'expense' },
      { name: 'Transportation', icon: '🚗', color: '#6175f4', nature: 'Need', type: 'expense' },
      { name: 'Shopping', icon: '🛒', color: '#ec4899', nature: 'Want', type: 'expense' },
      { name: 'Health', icon: '💊', color: '#10b981', nature: 'Must', type: 'expense' },
      { name: 'Bills & Utilities', icon: '💡', color: '#f97316', nature: 'Must', type: 'expense' },
      { name: 'Entertainment', icon: '🎬', color: '#8b5cf6', nature: 'Want', type: 'expense' },
      { name: 'Education', icon: '📚', color: '#06b6d4', nature: 'Need', type: 'expense' },
    ];
    const incomeCats = [
      { name: 'Salary', icon: '💰', color: '#10b981', nature: 'Must', type: 'income' },
      { name: 'Freelance', icon: '💻', color: '#6175f4', nature: 'Need', type: 'income' },
      { name: 'Investment', icon: '📈', color: '#f59e0b', nature: 'None', type: 'income' },
      { name: 'Business', icon: '🏢', color: '#8b5cf6', nature: 'None', type: 'income' },
    ];
    const allCats = [...expenseCats, ...incomeCats].map(c => ({ ...c, user: user._id, isSystem: true }));
    const created = await Category.insertMany(allCats);

    // Add subcategories for Food
    const foodCat = created.find(c => c.name === 'Food & Dining');
    if (foodCat) {
      await Category.insertMany([
        { user: user._id, name: 'Restaurants', icon: '🍽️', color: '#f59e0b', nature: 'Want', type: 'expense', parent: foodCat._id, level: 1 },
        { user: user._id, name: 'Groceries', icon: '🥬', color: '#10b981', nature: 'Need', type: 'expense', parent: foodCat._id, level: 1 },
        { user: user._id, name: 'Street Food', icon: '🌮', color: '#f97316', nature: 'Want', type: 'expense', parent: foodCat._id, level: 1 },
      ]);
    }
  console.log('✅ Default categories created');

  // Default tags
  await Tag.insertMany([
    { user: user._id, name: 'Essential', color: '#10b981' },
    { user: user._id, name: 'Recurring', color: '#6175f4' },
    { user: user._id, name: 'One-time', color: '#f59e0b' },
    { user: user._id, name: 'Tax Deductible', color: '#8b5cf6' },
  ]);
  console.log('✅ Default tags created');

  console.log('\n🚀 Seeding complete!');
  console.log('   Login: demo@walletOS.com');
  console.log('   Password: demo1234');
  process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });