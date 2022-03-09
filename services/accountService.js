const FranchiseCategory = require("../models/franchiseCategory");

var Account = require("../models/account");
const Response = require("../models/response");
const jwt = require("jsonwebtoken");

const jwksClient = require("jwks-rsa");

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
  res
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
        const newAccount = new Account({
          name: name,
          givenName: given_name,
          familyName: family_name,
          email: email,
          picture: picture,
        });
        exports.saveAccount(newAccount, res).then(async (err) => {
          if (err) {
            res.status(200).json(new Response(2000, "", err));
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
                  res.status(200).json(new Response(2000, "", err));
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

exports.saveStoreOwner = async (newStoreOwener, res) => {
  try {
    await newStoreOwener.save();
  } catch (error) {
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
  const payload = await verifyJWT(json, publicKey);

  if (!payload) {
    console.log("apple if verification failed");
    return false;
  }
  return true;
};

function verifyJWT(json, publicKey) {
  return new Promise((resolve) => {
    jwt.verify(json.toString(), publicKey),
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
