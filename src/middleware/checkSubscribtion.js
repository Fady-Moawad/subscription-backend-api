const Plan = require("../models/planModel")
const Subscribtion = require("../models/userSubscription")

const checkSubscribtion = async (req, res, next) => {

    const userId = req.user.id
    const subscribtion = await Subscribtion.findOne({ userId: userId })

    const plan = await Plan.findById(subscribtion.planId);
    console.log(plan);

    if (subscribtion.status !== 'active') {
        res.status(400)
        return next('Subscription not active')
    }
    if (subscribtion.endDate <= new Date()) { //time
        res.status(400)
        return next("expired time plan please update or upgrade paln")
    }
    console.log(plan.usageLimit);
    if (subscribtion.usageCount >= plan.usageLimit) { //usage


        res.status(400)
        return next("expired usage plan please update or upgrade paln")
    }

    //database ليها طريقة تاني في 
    // subscribtion.usageCount += 1
    await subscribtion.updateOne({
        _id: subscribtion._id
    },
        { $inc: { usageCount: 1 } })
    console.log(subscribtion.usageCount);
    next()
}

module.exports = checkSubscribtion