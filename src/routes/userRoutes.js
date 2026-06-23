const express = require('express')
const controls = require('../controls/userControls')
const route = express.Router()
const validate = require('../middleware/validationRegister')
const limiterLogin = require('../middleware/rateLimoterLogin')
const { verifyTokenAndAdmin, verifyToken } = require('../middleware/verifyToken')
const rateLimit = require('../middleware/rateLimoter')

route.route('/')
    .get(verifyTokenAndAdmin, controls.getAllUsers)
route.route('/login')
    .post(limiterLogin, controls.login)
route.route('/register')
    .post(validate(), controls.register)
route.route('/plans')
    .get(verifyToken, controls.plans)
route.route('/subscription')
    .post(verifyToken, controls.subscribtion)



module.exports = route