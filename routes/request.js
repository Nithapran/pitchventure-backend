const express = require('express')
const router = express.Router()

const requestController = require('../controllers/requestController');

router.post('/sendRequest', requestController.sendRequest);
// router.post('/acceptRequest', requestController.acceptRequest);
// router.post('/rejectRequest', requestController.rejectRequest);
// router.post('/cancelRequest', requestController.cancelRequest);
// router.get('/getAll', requestController.getAll);

module.exports = router