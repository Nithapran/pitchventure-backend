const { response } = require("express");
const jwt = require('jsonwebtoken');

const accountService = require('../services/accountService');

var Account = require('../models/account');
const Franchise = require('../models/franchise');
const Storeowner = require('../models/storeowner');
const FranchiseCategory = require('../models/franchiseCategory');

const { OAuth2Client } = require("google-auth-library");
const Response = require('../models/response');

const client = new OAuth2Client(process.env.GOOGLE_WEB_CLIENT_ID)

exports.createAccount = async (req, res,next) => {
    const { tokenId } = req.body;
    try {
        await client.verifyIdToken({idToken: tokenId, audience: [process.env.GOOGLE_IOS_CLIENT_ID]}).then(response => {
            const {email_verified, name, email,given_name,family_name,picture} = response.payload
            accountService.signUp(email_verified, name, email,given_name,family_name,picture,res);
            

        })} catch (error) {
            const error1 = new Error();
            error1.message = 'Invalid token';
            error1.code = 4003;
            error1.status = 403;
        return next(error1);
        }
    console.log()
};

exports.getProfile = async (req,res,next) => {
    const {accountId} = req.params;
    console.log(accountId);
    var ObjectId = require('mongoose').Types.ObjectId; 
    await Account.findOne({_id: new ObjectId(accountId)}).populate('storeOwner').populate('franchise').exec(function(err, accountWithID){
        if (accountWithID) {
            res.status(200).json(new Response(2000,"",accountWithID));
        } else {
            res.status(200).json(new Response(2000,"","not found"));
        }
    });
};

exports.getAppData = async (req,res,next) => {
    const franchiseCategories = await FranchiseCategory.find(); 
    var data = {};
    data["franchiseCategories"] = franchiseCategories;
    res.status(200).json(new Response(2000,"Success",data));
};

exports.getAllStoreOwners = async (req,res,next) => {
    const allStoreOwners = await Account.find({
        'isFranchise': false
    }).populate('storeOwner'); 
    res.status(200).json(new Response(2000,"Success",allStoreOwners));
};

exports.getAllFranchises = async (req,res,next) => {
    const allFranchises = await Account.find({
        'isFranchise': true
    }).populate('franchise'); 
    res.status(200).json(new Response(2000,"Success",allFranchises));
};
 
exports.storeOwenerSignup = async (req, res,next) => {
    const { accountId, apartmentNumber, addressLine1, addressLine2, city, province, postalCode, sentRequests, acceptedRequests, pictures} = req.body;
    var ObjectId = require('mongoose').Types.ObjectId; 
    await Account.findOne({_id: new ObjectId(accountId)}).exec(function(err, accountWithID){
        if (accountWithID) {
            const newStoreOwener = new Storeowner({ apartmentNumber: apartmentNumber, addressLine1: addressLine1, addressLine2: addressLine2, city: city, province: province, postalCode: postalCode, pictures: pictures });
            try {
                accountService.saveStoreOwner(newStoreOwener,res).then((err) => {
                    if (err) {
                        res.status(200).json(new Response(2000,"save error",err));
                    } else {
                        accountWithID.storeOwner = newStoreOwener;
                        accountWithID.isFranchise = false
                        accountWithID.isComplete = true
                        accountWithID.save();
                        res.status(200).json(new Response(2000,"",accountWithID));
                    }
                });
            } catch (error) {
                next(error);
                return
            }
        } else {
            return res.status(200).json(new Response(2000,"Error",err));
        }
        
    });
    
}

exports.franchiseSignup = async (req, res,next) => {
    const { accountId, minimumDeposit,franchiseName,franchiseCategories} = req.body;
    const franchiseCategoryObjects = accountService.getFranchiseCategories(franchiseCategories);
    var ObjectId = require('mongoose').Types.ObjectId;
    await Account.findOne({_id: new ObjectId(accountId)}).exec(function(err, accountWithID){
        if (accountWithID) {
            const newfranchise = new Franchise({ minimumDeposit: minimumDeposit, franchiseName: franchiseName,franchiseCategory: franchiseCategoryObjects});
            try {
                accountService.saveFranchise(newfranchise,res).then((err) => {
                    if (err) {
                        res.status(200).json(new Response(2000,"save error",err));
                    } else {
                        accountWithID.franchise = newfranchise;
                        accountWithID.isFranchise = true
                        accountWithID.isComplete = true
                        accountWithID.save();
                        res.status(200).json(new Response(2000,"",accountWithID));
                    }
                });
            } catch (error) {
                next(error);
                return
            }
        } else {
            return res.status(200).json(new Response(2000,"Error",err));
        }
        
    });
}