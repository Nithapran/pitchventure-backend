const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const jwt = require('jsonwebtoken')

const userSchema = new Schema({
    name: { type: String, required: true },
    given_name: { type: String, required: false },
    family_name: { type: String, required: false },
    email: {
        type: String,
        unique: true,
        required: true
    },
    dob: { type : Date, required: false },
    phoneNumber: { type: String, required: false },
    picture: { type: String,default: "https://nstoryapp.s3.us-east-2.amazonaws.com/74_user-avatar-profile-personal-account-512.png", required: false },
    isFranchise: {type: Boolean, default: true},
    createdAt: { type : Date, default: Date.now },
    apartmentNumber: { type: String, required: false },
    addressLine1: { type: String, required: false },
    addressLine2: { type: String, required: false },
    city: { type: String, required: false },
    province: { type: String, required: false },
    postalCode: { type: String, required: false },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    refreshTokens: [{
        token: {
            type: String,
            required: true
        }
    }]

});





userSchema.methods.generateAuthToken = async function() {
    // Generate an auth token for the user
    const user = this
    const token = jwt.sign({_id: user._id}, process.env.JWT_ACCESS_TOKEN_SECRET,{ expiresIn: process.env.ACCESS_TOKEN_LIFE})
    user.tokens = user.tokens.concat({token})
    await user.save()
    return token
}

userSchema.methods.generateRefreshToken = async function() {
    // Generate an auth token for the user
    const user = this
    const token = jwt.sign({_id: user._id}, process.env.JWT_REFRESH_TOKEN_SECRET,{ expiresIn: process.env.REFRESH_TOKEN_LIFE})
    user.refreshTokens = user.refreshTokens.concat({token})
    await user.save()
    return token
}

userSchema.statics = {
    valueExists(query) {
        return this.findOne(query).then(result => result);
    }
};

module.exports = mongoose.model('user', userSchema);
