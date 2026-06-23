const Users = require('../models/userModel');
const Plans = require('../models/planSubscription');
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
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });

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
    console.log(req.user);

    return res.status(200).json({ data: 'token' });
}

module.exports = {
    getAllUsers,
    login,
    register,
    subscribtion,
    plans
};
