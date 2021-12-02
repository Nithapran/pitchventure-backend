const FranchiseCategory = require('../models/franchiseCategory');

var Account = require('../models/account');
const Response = require('../models/response');

exports.signUp = async (email_verified, name, email,given_name,family_name,picture,res) => {
    Account.findOne({ email }).populate('storeOwner').populate('franchise').exec(async function(err, userWithEmail){
        if(userWithEmail) {
            const token = await userWithEmail.generateAuthToken()
            const refreshToken = await userWithEmail.generateRefreshToken()
            var data = userWithEmail.toJSON();
            data["token"] = token
            data['refreshToken'] = refreshToken
            res.status(200).json(new Response(2000,"ww",data));
        } else {
            const newAccount = new Account({ name: name,givenName: given_name,familyName:family_name,email: email,picture: picture});
            saveAccount(newAccount,res).then(async (err) => {
            if (err) {
                res.status(200).json(new Response(2000,"",err));
            } else {
                var data = newAccount.toJSON();
                const token = await newAccount.generateAuthToken()
                const refreshToken = await newAccount.generateRefreshToken()
                data["token"] = token
                data['refreshToken'] = refreshToken
                res.status(200).json(new Response(2000,"",data));
            }
        });
        }
        });
}



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