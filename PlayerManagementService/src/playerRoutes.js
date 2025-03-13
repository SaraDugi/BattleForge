const express = require('express');
const router = express.Router();
const playerController = require('./playerController');

router.post('/', playerController.createPlayer);
router.patch('/:id/achievement', playerController.patchAddAchievement);
router.get('/all', playerController.getPlayers);
router.get('/id/:id', playerController.getPlayerById);
router.get('/score/:score', playerController.getPlayersByScore);
router.get('/nickname/:nickname', playerController.getPlayersByNickname);
router.get('/main_faction/:mainFaction', playerController.getPlayersByMainFaction);
router.delete('/:id', playerController.deletePlayerById);
router.put('/:id/profile', playerController.updateProfile);
router.put('/:id/email', playerController.updateEmail);
router.put('/:id/password', playerController.updatePassword);
router.put('/:id/score', playerController.updateScore);
router.put('/:id/stats', playerController.updateStats);
router.put('/:id/main_faction', playerController.updateMainFaction);
router.put('/:id/media', playerController.updateMedia);

module.exports = router;