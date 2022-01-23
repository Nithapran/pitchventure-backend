const jwt = require('jsonwebtoken')
const Account = require('../models/account')

module.exports = async(req, res, next) => {
    
    const authToken = req.header('Authorization') ? req.header('Authorization') : '';
    const token = authToken.replace('Bearer ', '')
    var data;
    const error = new Error();
    try {
        data = jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET)
    } catch (e) {
        
        console.log(authToken);
        console.log(token);
        error.message = 'UNAUTHORIZED';
        error.status = 401
        return next(error);
    }
    try {
        const account = await Account.findOne({ _id: data._id, 'tokens.token': token })
        if (!account) {
            throw new Error()
        }
        req.user = account
        req.token = token
        next()
    } catch (error) {
        console.log("2nd");
        error.message = 'UNAUTHORIZED';
        error.status = 401
        return next(error);
    }

};

