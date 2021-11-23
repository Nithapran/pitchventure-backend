const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const jwt = require('jsonwebtoken')

const storeownerSchema = new Schema({
    account: { type: Schema.Types.ObjectId, ref: 'Account', required: false },
    apartmentNumber: { type: String, required: false },
    addressLine1: { type: String, required: false },
    addressLine2: { type: String, required: false },
    city: { type: String, required: false },
    province: { type: String, required: false },
    postalCode: { type: String, required: false },
    sentRequests: [{ type: Schema.Types.ObjectId, ref: 'Account', required: false }],
    acceptedRequests: [{ type: Schema.Types.ObjectId, ref: 'Account', required: false }],
    pictures: [{ type: String, required: false }]
});


module.exports = mongoose.model('Storeowner', storeownerSchema,'storeowner');
