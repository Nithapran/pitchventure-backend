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
            Account.findOne({ email }).exec(function(err, userWithEmail){
                if(userWithEmail) {
                    res.status(200).json(new Response(2000,"",userWithEmail));
                } else {
                    const newAccount = new Account({ name: name,givenName: given_name,familyName:family_name,email: email,picture: picture});
                    saveAccount(newAccount,res).then((err) => {
                    if (err) {
                        res.status(200).json(new Response(2000,"",err));
                    } else {
                        res.status(200).json(new Response(2000,"",newUser));
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
    const franchiseCategories = await FranchiseCategory.find(); 
    var data = {};
    data["franchiseCategories"] = franchiseCategories;
    res.status(200).json(new Response(2000,"Success",data));
};

exports.getAppData = async (req,res,next) => {
    const franchiseCategories = await FranchiseCategory.find(); 
    var data = {};
    data["franchiseCategories"] = franchiseCategories;
    res.status(200).json(new Response(2000,"Success",data));
};

exports.getAllStoreOwners = async (req,res,next) => {
    const allStoreOwners = await Storeowner.find().populate('account'); 
    res.status(200).json(new Response(2000,"Success",allStoreOwners));
};

exports.getAllFranchises = async (req,res,next) => {
    const allFranchises = await Franchise.find().populate('account').populate('franchiseCategory');
    res.status(200).json(new Response(2000,"Success",allFranchises));
};
 
exports.storeOwenerSignup = async (req, res,next) => {
    const { accountId, apartmentNumber, addressLine1, addressLine2, city, province, postalCode, sentRequests, acceptedRequests, pictures} = req.body;
    var ObjectId = require('mongoose').Types.ObjectId; 
    await Account.findOne({_id: new ObjectId(accountId)}).exec(function(err, accountWithID){
        if (accountWithID) {
            const newStoreOwener = new Storeowner({ account: accountWithID, apartmentNumber: apartmentNumber, addressLine1: addressLine1, addressLine2: addressLine2, city: city, province: province, postalCode: postalCode, pictures: pictures });
            try {
                saveStoreOwner(newStoreOwener,res).then((err) => {
                    if (err) {
                        res.status(200).json(new Response(2000,"save error",err));
                    } else {
                        res.status(200).json(new Response(2000,"",newStoreOwener));
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
            const newfranchise = new Franchise({ account: accountWithID, minimumDeposit: minimumDeposit, franchiseName: franchiseName,franchiseCategory: franchiseCategoryObjects});
            try {
                saveFranchise(newfranchise,res).then((err) => {
                    if (err) {
                        res.status(200).json(new Response(2000,"save error",err));
                    } else {
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

async function saveAccount(newAccount,res) {
    try {
        await newAccount.save();
    const token = await newAccount.generateAuthToken()
    const refreshToken = await newAccount.generateRefreshToken()
    //res.status(200).json(new Response(2000,"",{token: token, refreshToken: refreshToken}));
    } catch (error) {
        //res.status(200).json(new Response(2000,"",error.code));
        return(error)
    }
    return
}

async function saveStoreOwner(newStoreOwener,res) {
    try {
        await newStoreOwener.save();
    } catch (error) {
        return(error)
    }
    return
}

async function saveFranchise(newfranchise,res) {
    try {
        await newfranchise.save();
    } catch (error) {
        return(error)
    }
    return
}