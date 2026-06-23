const { rateLimit } = require('express-rate-limit')

const limiter = rateLimit({
    windowMs: 30 * 60 * 1000, 
    max: 3, 
    message: ["Too many login attempts. Please try again after 30 minutes."],
    skipSuccessfulRequests: true,
    standardHeaders: true, 
    legacyHeaders: false, 
})

module.exports = limiter