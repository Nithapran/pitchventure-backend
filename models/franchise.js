const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const franchiseSchema = new Schema({
    account: { type: Schema.Types.ObjectId, ref: 'Account', required: false },
    franchiseName: { type: String, required: true },
    franchiseCategory: [{ type: Schema.Types.ObjectId, ref: 'FranchiseCategory', required: false }],
    minimumDeposit: { type: Number, required: true },
    requests: [{ type: Schema.Types.ObjectId, ref: 'Account', required: false }],
    activeFrancises: [{ type: Schema.Types.ObjectId, ref: 'Account', required: false }]
});


module.exports = mongoose.model('Franchise', franchiseSchema,'franchise');
