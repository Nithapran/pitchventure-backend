const FranchiseCategory = require('../models/franchiseCategory');

exports.getFranchiseCategories = (franchiseCategories) => {
    var ObjectId = require('mongoose').Types.ObjectId;
    var objIds = [] 
    franchiseCategories.forEach(element => {
        objIds.push(new ObjectId(element));
        
    });
    return objIds;
  }

exports.saveAccount = async (newAccount,res) => {
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

exports.saveStoreOwner = async (newStoreOwener,res) => {
    try {
        await newStoreOwener.save();
    } catch (error) {
        return(error)
    }
    return
}

exports.saveFranchise = async (newfranchise,res) => {
    try {
        await newfranchise.save();
    } catch (error) {
        return(error)
    }
    return
}