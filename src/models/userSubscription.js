const { default: mongoose } = require("mongoose")
const userSubscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },

  planId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'planSubscription',
    required: true
  },

  status: {
    type: String,
    enum: ['active', 'expired', 'canceled'],
    default: 'active'
  },

  startDate: {
    type: Date,
    default: Date.now
  },

  endDate: {
    type: Date,
    required: true
  },

  usageCount: {
    type: Number,
    default: 0
  },

  autoRenew: {
    type: Boolean,
    default: false
  }

}, { timestamps: true });
const Subscribtion = mongoose.model('subscription',userSubscriptionSchema)
module.exports= Subscribtion