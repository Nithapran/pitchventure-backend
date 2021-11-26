const Response = require('../models/response');
const Account = require('../models/account');


exports.sendRequest = async (req,res,next) => {
    const fromUser = await Account.findOne({"_id": req.user.id});
    res.status(200).json(new Response(2000,"",fromUser));
};