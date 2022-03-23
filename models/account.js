const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const jwt = require('jsonwebtoken');
const franchise = require('./franchise');
const storeOwner = require('./storeowner');

const accountSchema = new Schema({
    name: { type: String, required: false },
    given_name: { type: String, required: false },
    family_name: { type: String, required: false },
    email: {
        type: String,
        unique: true
    },
    dob: { type : Date, required: false },
    phoneNumber: { type: String, required: false },
    picture: { type: String,default: "https://nstoryapp.s3.us-east-2.amazonaws.com/74_user-avatar-profile-personal-account-512.png", required: false },
    createdAt: { type : Date, default: Date.now },
    isComplete: { type : Boolean, default: false },
    isFranchise: { type : Boolean, default: false },
    franchise: { type: Schema.Types.ObjectId, ref: 'Franchise', required: false },
    storeOwner: { type: Schema.Types.ObjectId, ref: 'Storeowner', required: false },
    appleUserId: {
        type: String,
        unique: true
    },
    tokens: [{
        token: {
            type: String,
            required: true,
        },select: false
    }],
    refreshTokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    fcmToken: [{ type: String, required: false,unique: true }],
});





accountSchema.methods.generateAuthToken = async function() {
    // Generate an auth token for the user
    const user = this
    const token = jwt.sign({_id: user._id}, process.env.JWT_ACCESS_TOKEN_SECRET,{ expiresIn: process.env.ACCESS_TOKEN_LIFE})
    user.tokens = user.tokens.concat({token})
    await user.save()
    return token
}

accountSchema.methods.saveFcmToken = async function(token) {
    // Generate an auth token for the user
    const user = this
    if (token == null ) {
        return
    }

    if (token == "" ) {
        return
    }
    user.fcmToken.push(token)
    await user.save()
    return 
}

accountSchema.methods.generateRefreshToken = async function() {
    // Generate an auth token for the user
    const user = this
    const token = jwt.sign({_id: user._id}, process.env.JWT_REFRESH_TOKEN_SECRET,{ expiresIn: process.env.REFRESH_TOKEN_LIFE})
    user.refreshTokens = user.refreshTokens.concat({token})
    await user.save()
    return token
}

accountSchema.statics = {
    valueExists(query) {
        return this.findOne(query).then(result => result);
    }
};

accountSchema.methods.toJSON = function() {
    var obj = this.toObject()
    delete obj.tokens
    delete obj.refreshTokens
    return obj
  }

module.exports = mongoose.model('Account', accountSchema,'account');
