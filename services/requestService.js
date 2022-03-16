var Account = require("../models/account");

exports.getStoreOwners = async (requests) => {
    var storeOwners = [];
    for (const request of requests) {
        const so = await Account.findOne({"_id": request}).populate('storeOwner').exec()
        storeOwners.push(so) 
      }
    
    console.log("2");
    return storeOwners
  }