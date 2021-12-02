const Response = require('../models/response');
const Account = require('../models/account');


exports.sendRequest = async (req,res,next) => {
    const {franchiseId} = req.params;
    const user = await Account.findOne({"_id": req.user.id}).populate('storeOwner');
    var ObjectId = require('mongoose').Types.ObjectId; 
    await Account.findOne({_id: new ObjectId(franchiseId)}).populate('franchise').exec(function(err, franchiseAccountWithID){
        if (franchiseAccountWithID) {
            franchiseAccountWithID.franchise.requests.addToSet(user);
            
            user.storeOwner.sentRequests.addToSet(franchiseAccountWithID);
            user.storeOwner.save()
            franchiseAccountWithID.franchise.save()
            res.status(200).json(new Response(2000,"","Success"));
        } else {
            res.status(200).json(new Response(2000,"","sd"));
        }
    });
};

exports.acceptRequest = async (req,res,next) => {
    const {storeOwnerId} = req.params;
    const user = await Account.findOne({"_id": req.user.id}).populate('franchise');
    var ObjectId = require('mongoose').Types.ObjectId; 
    await Account.findOne({_id: new ObjectId(storeOwnerId)}).populate('storeOwner').exec(function(err, storeOwnerAccountWithID){
        if (storeOwnerAccountWithID) {
            storeOwnerAccountWithID.storeOwner.sentRequests.pull(user.id);
            storeOwnerAccountWithID.storeOwner.acceptedRequests.addToSet(user);

            user.franchise.requests.pull(storeOwnerAccountWithID.id);
            user.franchise.activeFrancises.addToSet(storeOwnerAccountWithID.id);
            user.franchise.save()
            storeOwnerAccountWithID.storeOwner.save()
            res.status(200).json(new Response(2000,"","Success"));
        } else {
            res.status(200).json(new Response(2000,"","sd"));
        }
    });
};

exports.rejectRequest = async (req,res,next) => {
    const {storeOwnerId} = req.params;
    const user = await Account.findOne({"_id": req.user.id}).populate('franchise');
    var ObjectId = require('mongoose').Types.ObjectId; 
    await Account.findOne({_id: new ObjectId(storeOwnerId)}).populate('storeOwner').exec(function(err, storeOwnerAccountWithID){
        if (storeOwnerAccountWithID) {
            storeOwnerAccountWithID.storeOwner.sentRequests.pull(user.id);

            user.franchise.requests.pull(storeOwnerAccountWithID.id);
            user.franchise.save()
            storeOwnerAccountWithID.storeOwner.save()
            res.status(200).json(new Response(2000,"","Success"));
        } else {
            res.status(200).json(new Response(2000,"","sd"));
        }
    });
};