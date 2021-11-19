const express = require('express')
const router = express.Router()

const loginController = require('../controllers/loginController');


router.post('/googlelogin', loginController.googlelogin)
router.post('/storeOwenerSignup', loginController.googlelogin)
router.post('/franchisesOwenerSignup', loginController.googlelogin)
router.get('/getAllFranchises', loginController.getAllFranchises)

module.exports = router