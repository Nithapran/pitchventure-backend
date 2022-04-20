const { response } = require("express");
const jwt = require("jsonwebtoken");

const accountService = require("../services/accountService");

var Account = require("../models/account");
const Franchise = require("../models/franchise");
const Storeowner = require("../models/storeowner");
const FranchiseCategory = require("../models/franchiseCategory");

const { OAuth2Client } = require("google-auth-library");
const Response = require("../models/response");

const client = new OAuth2Client(process.env.GOOGLE_WEB_CLIENT_ID);

exports.createAccount = async (req, res, next) => {
  const { tokenId } = req.body;
  const { fcmToken } = req.body;
  console.log("Fcm Token:" + fcmToken)
  try {
    await client
      .verifyIdToken({
        idToken: tokenId,
        audience: [process.env.GOOGLE_IOS_CLIENT_ID],
      })
      .then((response) => {
        const {
          email_verified,
          name,
          email,
          given_name,
          family_name,
          picture,
        } = response.payload;
        accountService.signUp(
          email_verified,
          name,
          email,
          given_name,
          family_name,
          picture,
          fcmToken,
          res
        );
      });
  } catch (error) {
    const error1 = new Error();
    error1.message = "Invalid token";
    error1.code = 4003;
    error1.status = 403;
    console.log(error1);
    return next(error1);
  }
};


exports.appleSignIn = async (req, res, next) => {
  const { token,email,appleUserId,givenName,familyName } = req.body;
  if (accountService.validateAppleSignIn(token)) {
    accountService.signUpApple(token,email,appleUserId,givenName,familyName,res)
  } else {
    const error1 = new Error();
    error1.message = "Token validation failed";
    error1.code = 4003;
    error1.status = 403;
    console.log(error1);
    return next(error1);
  }
  
};

exports.getProfile = async (req, res, next) => {
  const { accountId } = req.params;
  console.log(accountId);
  var ObjectId = require("mongoose").Types.ObjectId;
  await Account.findOne({ _id: new ObjectId(accountId) })
    .populate("storeOwner")
    .populate("franchise")
    .exec(function (err, accountWithID) {
      if (accountWithID) {
        res.status(200).json(new Response(2000, "", accountWithID));
      } else {
        const error1 = new Error();
        error1.message = "Account not found";
        error1.code = 4003;
        error1.status = 403;
        console.log(error1);
        return next(error1);
      }
    });
};

exports.getAppData = async (req, res, next) => {
  const franchiseCategories = await FranchiseCategory.find();
  var data = {};
  data["franchiseCategories"] = franchiseCategories;
  res.status(200).json(new Response(2000, "Success", data));
};

exports.getAllStoreOwners = async (req, res, next) => {
  const allStoreOwners = await Account.find({
    isFranchise: false,
  }).populate("storeOwner");
  let altered = markPromotionExpired(allStoreOwners)
  res.status(200).json(new Response(2000, "Success", altered));
};

exports.getAllFranchises = async (req, res, next) => {
  const allFranchises = await Account.find({
    isFranchise: true,
  }).populate("franchise");
  let altered = markPromotionExpired(allFranchises)
  res.status(200).json(new Response(2000, "Success", altered));
};

exports.storeOwenerSignup = async (req, res, next) => {
  const {
    accountId,
    apartmentNumber,
    addressLine1,
    addressLine2,
    city,
    province,
    postalCode,
    sentRequests,
    acceptedRequests,
    pictures,
    countryCode,
    phoneNumber,
    imageUrl
  } = req.body;
  var ObjectId = require("mongoose").Types.ObjectId;
  await Account.findOne({ _id: new ObjectId(accountId) }).exec(function (
    err,
    accountWithID
  ) {
    if (accountWithID) {
      const newStoreOwener = new Storeowner({
        apartmentNumber: apartmentNumber,
        addressLine1: addressLine1,
        addressLine2: addressLine2,
        city: city,
        province: province,
        postalCode: postalCode,
        pictures: pictures,
        countryCode: countryCode,
        phoneNumber: phoneNumber,
        imageUrl: imageUrl
      });
      try {
        accountService.saveStoreowner(newStoreOwener, res).then((err) => {
          if (err) {
            const error1 = new Error();
            error1.message = "Saving failed";
            error1.code = 5000;
            error1.status = 500;
            console.log(error1);
            return next(error1);
          } else {
            accountWithID.storeOwner = newStoreOwener;
            accountWithID.isFranchise = false;
            accountWithID.isComplete = true;
            accountWithID.save();
            res.status(200).json(new Response(2000, "", accountWithID));
          }
        });
      } catch (error) {
        next(error);
        return;
      }
    } else {
      const error1 = new Error();
      error1.message = "Invalid account Id";
      error1.code = 4003;
      error1.status = 403;
      console.log(error1);
      return next(error1);
    }
  });
};

exports.franchiseSignup = async (req, res, next) => {
  const {
    accountId,
    minimumDeposit,
    franchiseName,
    franchiseCategories,
    countryCode,
    phoneNumber,
    imageUrl
  } = req.body;
  const franchiseCategoryObjects =
    accountService.getFranchiseCategories(franchiseCategories);
  var ObjectId = require("mongoose").Types.ObjectId;
  await Account.findOne({ _id: new ObjectId(accountId) }).exec(function (
    err,
    accountWithID
  ) {
    if (accountWithID) {
      const newfranchise = new Franchise({
        minimumDeposit: minimumDeposit,
        franchiseName: franchiseName,
        franchiseCategory: franchiseCategoryObjects,
        countryCode: countryCode,
        phoneNumber: phoneNumber,
        imageUrl: imageUrl
      });
      try {
        accountService.saveFranchise(newfranchise, res).then((err) => {
          if (err) {
            const error1 = new Error();
            error1.message = "Saving failed";
            error1.code = 5000;
            error1.status = 500;
            console.log(error1)
            return next(error1);
          } else {
            accountWithID.franchise = newfranchise;
            accountWithID.isFranchise = true;
            accountWithID.isComplete = true;
            accountWithID.save();
            res.status(200).json(new Response(2000, "", accountWithID));
          }
        });
      } catch (error) {
        next(error);
        return;
      }
    } else {
      const error1 = new Error();
      error1.message = "Invalid account Id";
      error1.code = 4003;
      error1.status = 403;
      console.log(error1)
      return next(error1);
    }
  });
};

exports.franchiseUpdate = async (req, res, next) => {
  const {
    accountId,
    minimumDeposit,
    franchiseName,
    franchiseCategories,
    countryCode,
    phoneNumber,
    imageUrl,
    picture,
    isProfileSponsored,
  } = req.body;
  
  var ObjectId = require("mongoose").Types.ObjectId;
  await Account.findOne({ _id: new ObjectId(accountId) }).exec(function (
    err,
    accountWithID
  ) {
    if (accountWithID) {
      accountWithID.picture = picture
      accountService.saveAccount(accountWithID)
      accountService.updateFranchise(accountWithID,minimumDeposit,franchiseName,franchiseCategories,countryCode,phoneNumber,imageUrl,picture,isProfileSponsored,res,next)
    } else {
      const error1 = new Error();
      error1.message = "Invalid account Id";
      error1.code = 4003;
      error1.status = 403;
      console.log(error1)
      return next(error1);
    }
  });
};

exports.storeOwnerUpdate = async (req, res, next) => {
  const {
    accountId,
    apartmentNumber,
    addressLine1,
    addressLine2,
    city,
    province,
    postalCode,
    pictures,
    countryCode,
    phoneNumber,
    imageUrl,
    isProfileSponsored
  } = req.body;
  
  var ObjectId = require("mongoose").Types.ObjectId;
  await Account.findOne({ _id: new ObjectId(accountId) }).exec(function (
    err,
    accountWithID
  ) {
    if (accountWithID) {
      accountService.updateStoreowner(accountWithID,apartmentNumber,addressLine1,addressLine2,city,province,postalCode,pictures,countryCode,phoneNumber,imageUrl,isProfileSponsored,res,next)
    } else {
      const error1 = new Error();
      error1.message = "Invalid account Id";
      error1.code = 4003;
      error1.status = 403;
      console.log(error1)
      return next(error1);
    }
  });
};

function markPromotionExpired(accounts) {
  const accounts_altered = accounts.map(account => {
    console.log(account.name);
    if (!account.isFranchise) {
      if (checkPromotionExpired(account.storeOwner?.sponsoredProfileExpiryDate)) {
        account.storeOwner.isProfileSponsored = false;
        const so = account.storeOwner
        so.save()
        return account
      } else {
        return account
      }
    } else {
      if (checkPromotionExpired(account.franchise?.sponsoredProfileExpiryDate)) {
        account.franchise.isProfileSponsored = false;
        const fr = account.franchise
        fr.save()
        return account
      } else {
        return account
      }
    }
    
   
})
return  accounts_altered;
}

function checkPromotionExpired(date){
  console.log(date);
  if (date) {
    console.log(date+"sssssss");
    const currentDate = new Date(); 
  if(currentDate.getTime() > date.getTime()){
    console.log(date+"true");
    return true;
  }
  console.log(date+"asdasd");
  return false;
  }
  console.log(date+"as");
  return false;
}
