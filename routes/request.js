const express = require('express')
const router = express.Router()

const requestController = require('../controllers/requestController');

router.post('/sendRequest/:franchiseId', requestController.sendRequest);
router.post('/acceptRequest/:storeOwnerId', requestController.acceptRequest);
router.post('/rejectRequest/:storeOwnerId', requestController.rejectRequest);
router.post('/cancelRequest/:franchiseId', requestController.cancelRequest);
router.get('/getAllRequests', requestController.getAllRequests);
router.get('/getAllPartneredStoreOwners', requestController.getAllPartneredStoreOwners);

module.exports = router