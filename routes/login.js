const express = require('express')
const router = express.Router()

const loginController = require('../controllers/loginController');


router.post('/googlelogin', loginController.googlelogin)

module.exports = router