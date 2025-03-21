const db = require('./db');
const logger = require('./logger');

const Player = {
  create: async (data) => {
    try {
      const {
        first_name,
        last_name,
        nickname,
        email,
        account_password,
        main_faction,
        score,
        elo_rating,
        wins,
        losses,
        tournaments_participated,
        achievements,
        profile_pic,
        banner,
        team_id
      } = data;
      
      const query = `
        INSERT INTO player (
          first_name, last_name, nickname, email, account_password, main_faction, score, elo_rating,
          wins, losses, tournaments_participated, achievements, profile_pic, banner, team_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const [result] = await db.query(query, [
        first_name,
        last_name,
        nickname,
        email,
        account_password,
        main_faction || 'Unaligned',
        score || 0,
        elo_rating || 1000.00,
        wins || 0,
        losses || 0,
        tournaments_participated || 0,
        achievements || null,
        profile_pic || null,
        banner || null,
        team_id || null,
      ]);
      return result.insertId;
    } catch (error) {
      logger.error(`Error creating player (detailed): ${error.message}`, { stack: error.stack });
      throw new Error(`Database error: ${error.message}`);
    }
  },

  addAchievement: async (id, achievement) => {
    try {
      const [result] = await db.query(
        `UPDATE player 
         SET achievements = JSON_ARRAY_APPEND(IFNULL(achievements, JSON_ARRAY()), '$', ?)
         WHERE id = ?`,
        [achievement, id]
      );
      return result.affectedRows;
    } catch (error) {
      logger.error(`Error adding achievement (detailed): ${error.message}`, { stack: error.stack });
      throw new Error(`Database error: ${error.message}`);
    }
  },

  getAll: async () => {
    try {
      const [rows] = await db.query('SELECT * FROM player');
      return rows;
    } catch (error) {
      logger.error(`Error fetching players (detailed): ${error.message}`, { stack: error.stack });
      throw new Error(`Database error: ${error.message}`);
    }
  },
  
  getById: async (id) => {
    try {
      const [rows] = await db.query('SELECT * FROM player WHERE id = ?', [id]);
      return rows[0];
    } catch (error) {
      logger.error(`Error fetching player by ID=${id}: ${error.message}`, { stack: error.stack });
      throw new Error(`Database error: ${error.message}`);
    }
  },

  getByScore: async (score) => {
    try {
      const [rows] = await db.query('SELECT * FROM player WHERE score = ?', [score]);
      return rows;
    } catch (error) {
      logger.error(`Error fetching players by score=${score}: ${error.message}`, { stack: error.stack });
      throw new Error(`Database error: ${error.message}`);
    }
  },

  getByNickname: async (nickname) => {
    try {
      const [rows] = await db.query('SELECT * FROM player WHERE nickname = ?', [nickname]);
      return rows;
    } catch (error) {
      logger.error(`Error fetching players by nickname=${nickname}: ${error.message}`, { stack: error.stack });
      throw new Error(`Database error: ${error.message}`);
    }
  },

  getByMainFaction: async (mainFaction) => {
    try {
      const [rows] = await db.query('SELECT * FROM player WHERE main_faction = ?', [mainFaction]);
      return rows;
    } catch (error) {
      logger.error(`Error fetching players by main faction=${mainFaction}: ${error.message}`, { stack: error.stack });
      throw new Error(`Database error: ${error.message}`);
    }
  },

  deleteById: async (id) => {
    try {
      const [result] = await db.query('DELETE FROM player WHERE id = ?', [id]);
      return result.affectedRows;
    } catch (error) {
      logger.error(`Error deleting player by ID=${id}: ${error.message}`, { stack: error.stack });
      throw new Error(`Database error: ${error.message}`);
    }
  },

  updateProfile: async (id, first_name, last_name, nickname) => {
    try {
      const [result] = await db.query(
        'UPDATE player SET first_name = ?, last_name = ?, nickname = ? WHERE id = ?',
        [first_name, last_name, nickname, id]
      );
      return result.affectedRows;
    } catch (error) {
      logger.error(`Error updating profile for ID=${id}: ${error.message}`, { stack: error.stack });
      throw new Error(`Database error: ${error.message}`);
    }
  },

  updateEmail: async (id, email) => {
    try {
      const [result] = await db.query(
        'UPDATE player SET email = ? WHERE id = ?',
        [email, id]
      );
      return result.affectedRows;
    } catch (error) {
      logger.error(`Error updating email for ID=${id}: ${error.message}`, { stack: error.stack });
      throw new Error(`Database error: ${error.message}`);
    }
  },

  updatePassword: async (id, password) => {
    try {
      const [result] = await db.query(
        'UPDATE player SET account_password = ? WHERE id = ?',
        [password, id]
      );
      return result.affectedRows;
    } catch (error) {
      logger.error(`Error updating password for ID=${id}: ${error.message}`, { stack: error.stack });
      throw new Error(`Database error: ${error.message}`);
    }
  },

  updateScore: async (id, score) => {
    try {
      const [result] = await db.query(
        'UPDATE player SET score = ? WHERE id = ?',
        [score, id]
      );
      return result.affectedRows;
    } catch (error) {
      logger.error(`Error updating score for ID=${id}: ${error.message}`, { stack: error.stack });
      throw new Error(`Database error: ${error.message}`);
    }
  },

  updateStats: async (id, wins, losses, tournaments_participated) => {
    try {
      const [result] = await db.query(
        'UPDATE player SET wins = ?, losses = ?, tournaments_participated = ? WHERE id = ?',
        [wins, losses, tournaments_participated, id]
      );
      return result.affectedRows;
    } catch (error) {
      logger.error(`Error updating stats for ID=${id}: ${error.message}`, { stack: error.stack });
      throw new Error(`Database error: ${error.message}`);
    }
  },

  updateMainFaction: async (id, mainFaction) => {
    try {
      const [result] = await db.query(
        'UPDATE player SET main_faction = ? WHERE id = ?',
        [mainFaction, id]
      );
      return result.affectedRows;
    } catch (error) {
      logger.error(`Error updating main faction for ID=${id}: ${error.message}`, { stack: error.stack });
      throw new Error(`Database error: ${error.message}`);
    }
  },

  updateMedia: async (id, profile_pic, banner) => {
    try {
      const [result] = await db.query(
        'UPDATE player SET profile_pic = ?, banner = ? WHERE id = ?',
        [profile_pic, banner, id]
      );
      return result.affectedRows;
    } catch (error) {
      logger.error(`Error updating media for ID=${id}: ${error.message}`, { stack: error.stack });
      throw new Error(`Database error: ${error.message}`);
    }
  },

  getByEmail: async (email) => {
    try {
      const [rows] = await db.query('SELECT * FROM player WHERE email = ?', [email]);
      return rows[0];
    } catch (error) {
      logger.error(`Error fetching player by email=${email}: ${error.message}`, { stack: error.stack });
      throw new Error(`Database error: ${error.message}`);
    }
  },
};

module.exports = Player;