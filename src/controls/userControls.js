const Users = require('../models/userModel');
const Plans = require('../models/planModel');
const Subscribtion = require('../models/userSubscription');
const bcrypt = require('bcryptjs');
const crypto = require("crypto")
const jwt = require('jsonwebtoken');
const { validationResult } = require("express-validator");
const sendEmail = require('../utils/nodemailer')




const getAllUsers = async (req, res, next) => {
    try {
        const users = await Users.find();
        return res.status(200).json({ users });
    } catch (error) {
        res.status(500)
        return next(error)
    }
};
const register = async (req, res, next) => {
    const { name, email, password } = req.body;
    const errors = validationResult(req);


    if (!errors.isEmpty()) {
        res.status(400);
        return next(errors);
    }

    try {
        const oldUser = await Users.findOne({ email });
        if (oldUser) {
            res.status(400);
            return next("Email already exists");
        }

        const hashPassword = await bcrypt.hash(password, 10);
        const newUser = new Users({
            name,
            email,
            password: hashPassword,

        });

        await newUser.save();

        // const message = `You requested a Verify Account.\n\nPlease copy this code: ${verifyCode}`;
        // await sendEmail({
        //     email: newUser.email,
        //     subject: "Verify Account",
        //     message,
        // });

        return res.status(201).json({ success: true, data: 'Account ceaterd !' });
    } catch (error) {
        res.status(500);
        return next(error);
    }
};
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await Users.findOne({ email });

        if (!user) {
            res.status(400);
            return next("User not found");
        }

        const matchPassword = await bcrypt.compare(password, user.password);
        if (!matchPassword) {
            res.status(400);
            return next("Invalid password");
        }

        const payload = { id: user._id, name: user.name, email: user.email };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1d" });

        return res.status(200).json({ data: token });
    } catch (error) {
        res.status(500);
        return next(error);
    }
};

const plans = async (req, res, next) => {
    try {
        const plans = await Plans.find()
        res.status(200).json({ data: plans })
    } catch (err) {
        res.save(400)
        return next(err)
    }
}
const subscribtion = async (req, res, next) => {
    const userId = req.user.id
    const planId = req.body.planId

    const oldSubscription = await Subscribtion.findOne({
        userId: userId,
        status: 'active'
    })
    if (oldSubscription) {
        res.status(400)
        return next('Already Subscribtion is Existing')
    }
    const plan = await Plans.findById(planId)
    if (!plan || plan.isActive == 'false') {
        res.status(400)
        return next('Plan not Existing')
    }
    const user = await Users.findById(userId)
    console.log(plan);

    if (!plan || plan.isActive != true) {
        res.status(400)
        return next('Plan not Existing')
    }

    const startDate = new Date()
    const endDate = new Date()

    endDate.setDate(
        startDate.getDate() + plan.durationInDays
    )

    const subscribtion = new Subscribtion({
        userId: userId,
        planId: plan._id,
        status: 'active',
        startDate,
        endDate,
    })

    await subscribtion.save()

    await sendEmail({
        email: user.email,
        subject: "Subscription Activated 🎉",
        message: `Hello ${user.name},'\n'

Your subscription to the ${plan.name} plan has been activated successfully.'\n'

Start Date: ${startDate.toDateString()}'\n'
End Date: ${endDate.toDateString()}'\n'

Thank you for using our service.`,
    })

    return res.status(201).json({
        "success": true,
        "message": "Subscription is activated",
        "plan": plan.name,
        "expiresAt": endDate.toDateString()
    });
}

const use = async (req, res, next) => {
    const otp = crypto.randomInt(100000, 999999)
    res.status(200).json({
        "success": true,
        "data": `otp number ${otp}`,
    })
}

const upgrade = async (req, res, next) => {
    const user = req.user
    const { newPlanId } = req.body
    if (!user.id || !newPlanId) {
        res.status(400)
        return next('Plan not found or inactive')
    }
    try {
        const newPaln = await Plans.findById(newPlanId)
        if (!newPaln) {
            return res.status(404).json({ data: "Plan not found or inactive" })
        }

        const currentSub = await Subscribtion.findOne({
            userId: user.id, status: 'active'
        })

        if (!currentSub) {
            res.status(400)
            return next('you must first choose one paln befor upgrade')
        }

        if (currentSub.planId.toString() === newPlanId) {

            res.status(400)
            return next("Already on this plan")
        }
        currentSub.status = 'canceled'
        await currentSub.save()

        const startDate = new Date()
        const endDate = new Date()
        endDate.setDate(startDate.getDate() + newPaln.durationInDays)

        const createSub = await Subscribtion({
            userId: user.id,
            planId: newPaln._id,
            startDate,
            endDate,
            status: 'active'
        })
        await createSub.save()

        await sendEmail({
            email: user.email,
            subject: "Upgrad Subscription is Activated 🎉",
            message: `Hello ${user.name},\n
Your subscription to the ${newPaln.name} plan has been activated successfully.\n
Start Date: ${startDate.toDateString()}\n
End Date: ${endDate.toDateString()}\n
Thank you for using our service.`,
        })
        return res.status(201).json({
            success: true,
            message: "Plan upgraded successfully 🎉",
            oldPlan: currentSub.planId,
            newPlan: newPaln.name,
            expiresAt: endDate.toDateString()
        })
    } catch (error) {
        res.status(400)
        next(error)
    }
}

const cancel = async (req, res, next) => {
    const { name, id, email } = req.user
    try {
        const currentSub = await Subscribtion.findOneAndUpdate({ userId: id, status: 'active' }, { $set: { status: 'canceled' } }, { new: true })
        if (!currentSub) {
            res.status(404)
            return next('No active subscription found')
        }



        await sendEmail({
            email,
            subject: "Subscription Canceled Successfully",
            message: `Hello ${name},\n

Your subscription has been canceled successfully.\n
You will continue to have access until:\n
${currentSub.endDate.toDateString()}\n

Thank you for using our service.`
        })

        return res.status(200).json({
            success: true,
            message: 'Subscription canceled successfully',
            planId: currentSub.planId,
            expiresAt: currentSub.endDate
        })

    } catch (error) {
        res.status(400)
        return next(error)
    }

}

module.exports = {
    getAllUsers,
    login,
    register,
    subscribtion,
    plans,
    use,
    upgrade,
    cancel
};
