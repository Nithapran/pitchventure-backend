const Response = require('../models/response');
const Account = require('../models/account');
const Storeowner = require("../models/storeowner");
const requestService = require("../services/requestService");


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
            const error = new Error();
            error.message = 'User id not found';
            error.code = 4004;
            error.status = 404;
            next(error);
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
            const error = new Error();
            error.message = 'User id not found';
            error.code = 4004;
            error.status = 404;
            next(error);
        }
    });
};

exports.cancelRequest = async (req,res,next) => {
    const {franchiseId} = req.params;
    const user = await Account.findOne({"_id": req.user.id}).populate('storeOwner');
    var ObjectId = require('mongoose').Types.ObjectId; 
    await Account.findOne({_id: new ObjectId(storeOwnerId)}).populate('franchise').exec(function(err, storeOwnerAccountWithID){
        if (franchiseAccountWithID) {
            user.storeOwner.sentRequests.pull(user.id);

            franchiseAccountWithID.franchise.requests.pull(franchiseAccountWithID.id);
            user.franchise.save()
            storeOwnerAccountWithID.storeOwner.save()
            res.status(200).json(new Response(2000,"Success",null));
        } else {
            const error = new Error();
            error.message = 'User id not found';
            error.code = 4004;
            error.status = 404;
            next(error);
        }
    });
};

exports.getAllRequests = async (req,res,next) => {
    const user = await Account.findOne({"_id": req.user.id}).populate('franchise');
    var storeOwners = await requestService.getStoreOwners(user.franchise.requests);
    res.status(200).json(new Response(2000,"Success",storeOwners));
    
};

exports.getAllPartneredStoreOwners = async (req,res,next) => {
    const user = await Account.findOne({"_id": req.user.id}).populate('franchise');
    var storeOwners = await requestService.getStoreOwners(user.franchise.activeFrancises);
    res.status(200).json(new Response(2000,"Success",storeOwners));
    
};