const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const franchiseCategorySchema = new Schema({
    name: {
        type: String,
        required: true
    },
});

module.exports = mongoose.model('FranchiseCategory', franchiseCategorySchema,'franchiseCategory');