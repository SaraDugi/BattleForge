const db = require('./db');

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
      console.error('Error creating player:', error.message);
      throw new Error('Database error');
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
      console.error('Error adding achievement:', error.message);
      throw new Error('Database error');
    }
  },

  getAll: async () => {
    try {
      const [rows] = await db.query('SELECT * FROM player');
      return rows;
    } catch (error) {
      console.error('Error fetching players:', error.message);
      throw new Error('Database error');
    }
  },

  getById: async (id) => {
    try {
      const [rows] = await db.query(
        'SELECT * FROM player WHERE id = ?',
        [id]
      );
      return rows[0];
    } catch (error) {
      console.error('Error fetching player by ID:', error.message);
      throw new Error('Database error');
    }
  },

  getByScore: async (score) => {
    try {
      const [rows] = await db.query(
        'SELECT * FROM player WHERE score = ?',
        [score]
      );
      return rows;
    } catch (error) {
      console.error('Error fetching players by score:', error.message);
      throw new Error('Database error');
    }
  },

  getByNickname: async (nickname) => {
    try {
      const [rows] = await db.query(
        'SELECT * FROM player WHERE nickname = ?',
        [nickname]
      );
      return rows;
    } catch (error) {
      console.error('Error fetching players by nickname:', error.message);
      throw new Error('Database error');
    }
  },

  getByMainFaction: async (mainFaction) => {
    try {
      const [rows] = await db.query(
        'SELECT * FROM player WHERE main_faction = ?',
        [mainFaction]
      );
      return rows;
    } catch (error) {
      console.error('Error fetching players by main faction:', error.message);
      throw new Error('Database error');
    }
  },

  deleteById: async (id) => {
    try {
      const [result] = await db.query(
        'DELETE FROM player WHERE id = ?',
        [id]
      );
      return result.affectedRows;
    } catch (error) {
      console.error('Error deleting player by ID:', error.message);
      throw new Error('Database error');
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
      console.error('Error updating profile:', error.message);
      throw new Error('Database error');
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
      console.error('Error updating email:', error.message);
      throw new Error('Database error');
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
      console.error('Error updating password:', error.message);
      throw new Error('Database error');
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
      console.error('Error updating score:', error.message);
      throw new Error('Database error');
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
      console.error('Error updating stats:', error.message);
      throw new Error('Database error');
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
      console.error('Error updating main faction:', error.message);
      throw new Error('Database error');
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
      console.error('Error updating media:', error.message);
      throw new Error('Database error');
    }
  }
};
module.exports = Player;