const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const franchiseSchema = new Schema({
    franchiseName: { type: String, required: true },
    franchiseCategory: [{ type: Schema.Types.ObjectId, ref: 'FranchiseCategory', required: false }],
    minimumDeposit: { type: Number, required: true },
    requests: [{ type: Schema.Types.ObjectId, ref: 'Account', required: false }],
    activeFrancises: [{ type: Schema.Types.ObjectId, ref: 'Account', required: false }],
    countryCode: { type: String, required: false },
    phoneNumber: { type: String, required: false },
    imageUrl: {type: String, required: false}
});


module.exports = mongoose.model('Franchise', franchiseSchema,'franchise');
