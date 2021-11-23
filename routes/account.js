const express = require('express')
const router = express.Router()

const accountController = require('../controllers/accountController');


router.post('/createAccount', accountController.createAccount);
router.post('/franchiseSignup', accountController.franchiseSignup);
router.post('/storeOwenerSignup', accountController.storeOwenerSignup);
router.get('/getAllFranchises', accountController.getAllFranchises);
router.get('/getAllStoreOwners', accountController.getAllStoreOwners);

module.exports = router