const FranchiseCategory = require('../models/franchiseCategory');

exports.getFranchiseCategories = (franchiseCategories) => {
    var ObjectId = require('mongoose').Types.ObjectId;
    var objIds = [] 
    franchiseCategories.forEach(element => {
        objIds.push(new ObjectId(element));
        
    });
    return objIds;
  }