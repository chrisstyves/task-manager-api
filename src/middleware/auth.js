const jwt = require('jsonwebtoken')
const User = require('../models/user')

// 1. check the request header for an Authorization key/value pair
// 2. decode the token found there
// 3. find the user in the db that matches that token
// 4. return that user, if found, or throw an error otherwise
const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '')
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findOne({ _id: decoded._id, 'tokens.token': token })

        if (!user) {
            throw new Error()
        }

        req.token = token
        req.user = user
        
        next()
    }
    catch (e) {
        res.status(401).send({ error: 'Please Authenticate.'})
    }
}

module.exports = auth