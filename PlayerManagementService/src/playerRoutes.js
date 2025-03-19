const express = require('express');
const router = express.Router();
const playerController = require('./playerController');
const { authenticateToken } = require('./authMiddleware');

/**
 * @swagger
 * /players:
 *   get:
 *     summary: Get players by query
 *     description: Fetches players based on query parameters. If an id is provided, returns a single player.
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: integer
 *         description: The ID of the player.
 *       - in: query
 *         name: nickname
 *         schema:
 *           type: string
 *         description: The nickname to search for.
 *       - in: query
 *         name: score
 *         schema:
 *           type: integer
 *         description: The score to search for.
 *       - in: query
 *         name: main_faction
 *         schema:
 *           type: string
 *         description: The main faction to search for.
 *     responses:
 *       200:
 *         description: A list of players or a single player if id is provided.
 */
router.get('/', playerController.findPlayers);

/**
 * @swagger
 * /players:
 *   post:
 *     summary: Create a new player
 *     description: Adds a new player to the database.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Player created successfully
 */
router.post('/', playerController.createPlayer);

/**
 * @swagger
 * /players/{id}/achievement:
 *   patch:
 *     summary: Add an achievement to a player
 *     description: Updates a player's achievements by appending a new one.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Achievement added successfully
 */
router.patch('/:id/achievement', authenticateToken, playerController.patchAddAchievement);

/**
 * @swagger
 * /players/{id}:
 *   delete:
 *     summary: Delete a player
 *     description: Deletes a player by their unique ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the player to delete.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Player deleted successfully
 *       401:
 *         description: Unauthorized, token missing or invalid
 *       404:
 *         description: Player not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', authenticateToken, playerController.deletePlayerById);

/**
 * @swagger
 * /players/{id}/profile:
 *   put:
 *     summary: Update player profile
 *     description: Updates a player's first name, last name, or nickname.
 */
router.put('/:id/profile', authenticateToken, playerController.updateProfile);

/**
 * @swagger
 * /players/{id}/email:
 *   put:
 *     summary: Update player email
 *     description: Updates a player's email address.
 */
router.put('/:id/email', authenticateToken, playerController.updateEmail);

/**
 * @swagger
 * /players/{id}/password:
 *   put:
 *     summary: Update player password
 *     description: Updates a player's account password.
 */
router.put('/:id/password', authenticateToken, playerController.updatePassword);

/**
 * @swagger
 * /players/{id}/score:
 *   put:
 *     summary: Update player score
 *     description: Updates a player's score.
 */
router.put('/:id/score', authenticateToken, playerController.updateScore);

/**
 * @swagger
 * /players/{id}/stats:
 *   put:
 *     summary: Update player stats
 *     description: Updates a player's win/loss record and tournament participation count.
 */
router.put('/:id/stats', authenticateToken, playerController.updateStats);

/**
 * @swagger
 * /players/{id}/main_faction:
 *   put:
 *     summary: Update player's main faction
 *     description: Updates the main faction of a player.
 */
router.put('/:id/main_faction', authenticateToken, playerController.updateMainFaction);

/**
 * @swagger
 * /players/{id}/media:
 *   put:
 *     summary: Update player media
 *     description: Updates a player's profile picture and banner.
 */
router.put('/:id/media', authenticateToken, playerController.updateMedia);

module.exports = router;