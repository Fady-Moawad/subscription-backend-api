const cron = require('node-cron')
const Subscribtion = require('../models/userSubscription');

cron.schedule('0 0 * * *', async () => {
    console.log('⏰ Running subscription expiration job')
    try {
        const now = new Date()
        const result = await Subscribtion.updateMany({
            status: "active",
            endDate: { $lt: now },
            expireEmailSent:false
        }, { $set: { status: 'expired' } })
        console.log(`✅ Expired subscriptions: ${result.modifiedCount}`)
    } catch (error) {
        console.log(error);

    }
})

