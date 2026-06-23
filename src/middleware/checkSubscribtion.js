const Plan = require("../models/planSubscription")
const Subscribtion = require("../models/userSubscription")

const checkSubscribtion = async (req, res, next) => {
    const userId = req.user.id
    const subscribtion = await Subscribtion.findOne({ userId: userId })
   
    const plan = await Plan.findById(subscribtion.planId);
    console.log(plan);
    
    if (subscribtion.endDate <= new Date()) { //time
        res.status(400)
        return next("expired time plan please update or upgrade paln")
    }
    console.log(plan.usageLimit);
    if (subscribtion.usageCount >= plan.usageLimit) { //usage


        res.status(400)
        return next("expired usage plan please update or upgrade paln")
    }
    subscribtion.usageCount += 1
    await subscribtion.save()
    console.log(subscribtion.usageCount);
    next()
}

module.exports = checkSubscribtion