const { default: mongoose, model } = require('mongoose')

const planSchema = new mongoose.Schema({
    name: { type: String, required: true,enum: ['Basic', 'Pro', 'Premium'] },
    price: { type: Number, required: true },
    features:{ type: [String], default:[]},
    usageLimte: { type: Number, default: null },
    isActive: { type: Boolean, default: true },
    durationInDays: { type: Number, required: true },
}, { timestamps: true })
const Plan = mongoose.model('plan', planSchema)
module.exports = Plan