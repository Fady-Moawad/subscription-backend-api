require('dotenv').config();
const mongoose = require('mongoose');
const Plan = require('../models/planSubscription');

const plans = [
  {
    name: 'Basic',
    price: 50,
    features: [
      'Access to basic features',
      'Limited usage',
      'Email support'
    ],
    usageLimit: 100,
    durationInDays: 30
  },

  {
    name: 'Pro',
    price: 100,
    features: [
      'Everything in Basic',
      'Higher usage limit',
      'Priority support',
      'Advanced analytics'
    ],
    usageLimit: 1000,
    durationInDays: 30
  },

  {
    name: 'Premium',
    price: 200,
    features: [
      'Everything in Pro',
      'Unlimited usage',
      '24/7 support',
      'Dedicated account manager'
    ],
    usageLimit: null,
    durationInDays: 30
  }
];

const seedPlans = async () => {
  try {
    await mongoose.connect(process.env.MONGOOSE_URL);

    await Plan.deleteMany(); // يمسح القديم (اختياري)

    await Plan.insertMany(plans);

    console.log('Plans seeded successfully 🚀');

    process.exit();
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

seedPlans();