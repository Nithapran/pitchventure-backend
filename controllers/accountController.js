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
            Account.findOne({ email }).populate('storeOwner').populate('franchise').exec(function(err, userWithEmail){
                if(userWithEmail) {
                    const token = userWithEmail.generateAuthToken()
                    const refreshToken = userWithEmail.generateRefreshToken()
                    res.status(200).json(new Response(2000,"",userWithEmail));
                } else {
                    const newAccount = new Account({ name: name,givenName: given_name,familyName:family_name,email: email,picture: picture});
                    accountService.saveAccount(newAccount,res).then((err) => {
                    if (err) {
                        res.status(200).json(new Response(2000,"",err));
                    } else {
                        const token = newAccount.generateAuthToken()
                        const refreshToken = newAccount.generateRefreshToken()
                        res.status(200).json(new Response(2000,"",newAccount.populate('storeOwner').populate('franchise')));
                    }
                });
                }
                });
            
            
            
        
            
        })} catch (error) {
            res.status(200).json(new Response(2000,"",error.message));
        }
    console.log()
};

exports.getProfile = async (req,res,next) => {
    const {accountId} = req.params;
    var ObjectId = require('mongoose').Types.ObjectId; 
    await Account.findOne({_id: new ObjectId(accountId)}).exec(function(err, accountWithID){
        if (accountWithID) {
            res.status(200).json(new Response(2000,"",accountWithID));
        } else {

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
    const allStoreOwners = await Account.find({
        'isFranchise': true
    }).populate('franchise'); 
    res.status(200).json(new Response(2000,"Success",allStoreOwners));
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
                        accountWithID.storeOwner = newfranchise;
                        accountWithID.isFranchise = true
                        accountWithID.isComplete = true
                        res.status(200).json(new Response(2000,"",newfranchise));
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