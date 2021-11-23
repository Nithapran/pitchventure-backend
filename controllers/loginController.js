const { response } = require("express");
const jwt = require('jsonwebtoken');

const User = require('../models/user');

const { OAuth2Client } = require("google-auth-library");
const Response = require('../models/response');

const client = new OAuth2Client(process.env.GOOGLE_WEB_CLIENT_ID)

exports.googlelogin = async (req, res,next) => {
    const { tokenId } = req.body;
    try {
        await client.verifyIdToken({idToken: tokenId, audience: [process.env.GOOGLE_IOS_CLIENT_ID]}).then(response => {
            const {email_verified, name, email,given_name,family_name,picture} = response.payload
            User.findOne({ email }).exec(function(err, userWithEmail){
                if(userWithEmail) {
                    res.status(200).json(new Response(2000,"",userWithEmail));
                } else {
                    const newUser = new User({ name: name,givenName: given_name,familyName:family_name,email: email,picture: picture, isFranchise: false});
                saveuser(newUser,res).then((err) => {
                    if (err) {
                        res.status(200).json(new Response(2000,"",err.code));
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

exports.getAllFranchises = async (req,res,next) => {
    const allFranchises = await User.find().select('name given_name family_name email dob phoneNumber picture isFranchise createdAt apartmentNumber addressLine1 addressLine2 city province postalCode')
    res.status(200).json(new Response(2000,"Success",allFranchises));
};

exports.getAllFranchises = async (req,res,next) => {
    const allFranchises = await User.find().select('name given_name family_name email dob phoneNumber picture isFranchise createdAt apartmentNumber addressLine1 addressLine2 city province postalCode')
    res.status(200).json(new Response(2000,"Success",allFranchises));
};
    

async function saveuser(newUser,res) {
    try {
        await newUser.save();
    const token = await newUser.generateAuthToken()
    const refreshToken = await newUser.generateRefreshToken()
    //res.status(200).json(new Response(2000,"",{token: token, refreshToken: refreshToken}));
    } catch (error) {
        //res.status(200).json(new Response(2000,"",error.code));
        return(error)
    }
    return
}