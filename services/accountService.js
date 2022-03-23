const FranchiseCategory = require("../models/franchiseCategory");

var Account = require("../models/account");
const Response = require("../models/response");
const jwt = require("jsonwebtoken");
const Franchise = require("../models/franchise");
const Storeowner = require("../models/storeowner");
const jwksClient = require("jwks-rsa");

const notificationService = require("../services/notificationService");

const client = jwksClient({
  jwksUri: "https://appleid.apple.com/auth/keys",
});

function getApplleSignInKeys(kid) {
  return new Promise((resolve) => {
    client.getSigningKey(kid, (err, key) => {
      if (err) {
        console.log(err);
        resolve(null);
        return;
      }
      const signInKey = key.getPublicKey();
      resolve(signInKey);
    });
  });
}

exports.signUp = async (
  email_verified,
  name,
  email,
  given_name,
  family_name,
  picture,
  fcmToken,
  res
) => {
  Account.findOne({ email })
    .populate("storeOwner")
    .populate("franchise")
    .exec(async function (err, userWithEmail) {
      if (userWithEmail) {
        const token = await userWithEmail.generateAuthToken();
        const refreshToken = await userWithEmail.generateRefreshToken();
        await userWithEmail.saveFcmToken((fcmToken));
        var data = userWithEmail.toJSON();
        data["token"] = token;
        data["refreshToken"] = refreshToken;
        notificationService.onLogin(userWithEmail)
        res.status(200).json(new Response(2000, "ww", data));
      } else {
        const newAccount = new Account({
          name: name,
          givenName: given_name,
          familyName: family_name,
          email: email,
          picture: picture,
        });
        exports.saveAccount(newAccount, res).then(async (err) => {
          if (err) {
            console.error(err)
            res.status(500).json(new Response(5000, "Internal server error", err));
          } else {
            var data = newAccount.toJSON();
            const token = await newAccount.generateAuthToken();
            const refreshToken = await newAccount.generateRefreshToken();
            await newAccount.saveFcmToken((fcmToken));
            data["token"] = token;
            data["refreshToken"] = refreshToken;
            notificationService.onLogin(newAccount)
            res.status(200).json(new Response(2000, "", data));
          }
        });
      }
    });
};

exports.signUpApple = async (
    token,email,appleUserId,givenName,familyName,res
) => {
  Account.findOne({ email })
    .populate("storeOwner")
    .populate("franchise")
    .exec(async function (err, userWithEmail) {
      if (userWithEmail) {
        const token = await userWithEmail.generateAuthToken();
        const refreshToken = await userWithEmail.generateRefreshToken();
        var data = userWithEmail.toJSON();
        data["token"] = token;
        data["refreshToken"] = refreshToken;
        res.status(200).json(new Response(2000, "ww", data));
      } else {
        Account.findOne({ appleUserId })
          .populate("storeOwner")
          .populate("franchise")
          .exec(async function (err, userAppleUserId) {
            if (userAppleUserId) {
              const token = await userAppleUserId.generateAuthToken();
              const refreshToken = await userAppleUserId.generateRefreshToken();
              var data = userAppleUserId.toJSON();
              data["token"] = token;
              data["refreshToken"] = refreshToken;
              res.status(200).json(new Response(2000, "ww", data));
            } else {
              const newAccount = new Account({
                givenName: givenName,
                familyName:familyName,
                email: email,
                appleUserId:appleUserId
              });
              exports.saveAccount(newAccount, res).then(async (err) => {
                if (err) {
                    console.error(err)
                    res.status(500).json(new Response(5000, "Internal server error", err));
                } else {
                  var data = newAccount.toJSON();
                  const token = await newAccount.generateAuthToken();
                  const refreshToken = await newAccount.generateRefreshToken();
                  data["token"] = token;
                  data["refreshToken"] = refreshToken;
                  res.status(200).json(new Response(2000, "", data));
                }
              });
            }
          });
      }
    });
};

exports.getFranchiseCategories = (franchiseCategories) => {
  var ObjectId = require("mongoose").Types.ObjectId;
  var objIds = [];
  if (franchiseCategories == null) {
    return objIds
  }
  franchiseCategories.forEach((element) => {
    objIds.push(new ObjectId(element));
  });
  return objIds;
};

exports.saveAccount = async (newAccount, res) => {
  try {
    await newAccount.save();
    const token = await newAccount.generateAuthToken();
    const refreshToken = await newAccount.generateRefreshToken();
    //res.status(200).json(new Response(2000,"",{token: token, refreshToken: refreshToken}));
  } catch (error) {
    //res.status(200).json(new Response(2000,"",error.code));
    return error;
  }
  return;
};



exports.validateAppleSignIn = async (token) => {
  const json = jwt.decode(token, { complete: true });
  const kid = json.header.kid;

  const publicKey = await getApplleSignInKeys(kid);

  if (!publicKey) {
    console.log("apple if verification failed");
    return false;
  }
  const payload = await verifyJWT(token, publicKey);

  if (!payload) {
    console.log("apple if verification failed");
    return false;
  }
  return true;
};

function verifyJWT(json, publicKey) {
  return new Promise((resolve) => {
      console.log(json)
    jwt.verify(json, publicKey),
      (err, payload) => {
        if (err) {
          console.log(err);
          return resolve(null);
        }
        resolve(payload);
      };
  });
}

exports.saveFranchise = async (newfranchise, res) => {
  try {
    await newfranchise.save();
  } catch (error) {
    return error;
  }
  return;
};

exports.saveStoreowner = async (newStoreOwener, res) => {
  try {
    await newStoreOwener.save();
  } catch (error) {
    return error;
  }
  return;
};

exports.updateFranchise = async (accountWithID,minimumDeposit,franchiseName,franchiseCategories,countryCode,phoneNumber,imageUrl,res,next) => {
  const franchiseCategoryObjects =
  exports.getFranchiseCategories(franchiseCategories);
  await Franchise.findOne({ _id: accountWithID.franchise }).exec(function (
    err,
    franchiseWithID
  ) {
    if (franchiseWithID) {
      franchiseWithID.minimumDeposit = minimumDeposit != null ? minimumDeposit : franchiseWithID.minimumDeposit
      franchiseWithID.franchiseName = franchiseName != null ? franchiseName : franchiseWithID.franchiseName
      franchiseWithID.franchiseCategories = franchiseCategories != null ? franchiseCategoryObjects : franchiseWithID.franchiseCategories
      franchiseWithID.countryCode = countryCode != null ? countryCode : franchiseWithID.countryCode
      franchiseWithID.phoneNumber = phoneNumber != null ? phoneNumber : franchiseWithID.phoneNumber
      franchiseWithID.imageUrl = imageUrl != null ? imageUrl : franchiseWithID.imageUrl
      try {
        exports.saveFranchise(franchiseWithID, res).then((err) => {
          if (err) {
            const error1 = new Error();
            error1.message = "Saving failed";
            error1.code = 5000;
            error1.error = error
            error1.status = 500;
            console.log(error1)
            return next(error1);
          } else {
            accountWithID.franchise = franchiseWithID
            res.status(200).json(new Response(2000, "", accountWithID));
          }
        });
      } catch (error) {
        next(error);
        return;
      }
    } else {
    }
   } );   
};

exports.updateStoreowner = async (accountWithID,apartmentNumber,addressLine1,addressLine2,city,province,postalCode,pictures,countryCode,phoneNumber,imageUrl,res,next) => {
  
  await Storeowner.findOne({ _id: accountWithID.storeOwner }).exec(function (
    err,
    storeOwnerWithID
  ) {
    if (storeOwnerWithID) {
      storeOwnerWithID.apartmentNumber = apartmentNumber != null ? apartmentNumber : storeOwnerWithID.apartmentNumber
      storeOwnerWithID.addressLine1 = addressLine1 != null ? addressLine1 : storeOwnerWithID.addressLine1
      storeOwnerWithID.addressLine2 = addressLine2 != null ? addressLine2 : storeOwnerWithID.addressLine2
      storeOwnerWithID.city = city != null ? city : storeOwnerWithID.city
      storeOwnerWithID.province = province != null ? province : storeOwnerWithID.province
      storeOwnerWithID.postalCode = postalCode != null ? postalCode : storeOwnerWithID.postalCode
      storeOwnerWithID.pictures = pictures != null ? pictures : storeOwnerWithID.pictures
      storeOwnerWithID.countryCode = countryCode != null ? countryCode : storeOwnerWithID.countryCode
      storeOwnerWithID.phoneNumber = phoneNumber != null ? phoneNumber : storeOwnerWithID.phoneNumber
      storeOwnerWithID.imageUrl = imageUrl != null ? imageUrl : storeOwnerWithID.imageUrl
      try {
        exports.saveStoreowner(storeOwnerWithID, res).then((err) => {
          if (err) {
            const error1 = new Error();
            error1.message = "Saving failed";
            error1.code = 5000;
            error1.error = error
            error1.status = 500;
            console.log(error1)
            return next(error1);
          } else {
            accountWithID.storeOwner = storeOwnerWithID
            res.status(200).json(new Response(2000, "", accountWithID));
          }
        });
      } catch (error) {
        console.log(error)
        next(error);
        return;
      }
    } else {
    }
   } );   
};