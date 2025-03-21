const grpc = require('@grpc/grpc-js');
const jwt = require('jsonwebtoken');
const logger = require('./logger');
const Player = require('./player');
const { authenticate } = require('./auth');

const SECRET_KEY = process.env.JWT_SECRET || 'your_secret_key';

module.exports = {
  async FindPlayers(call, callback) {
    const { id, nickname, score, mainFaction } = call.request;
    try {
      let result;
      if (id) {
        const player = await Player.getById(id);
        if (!player) {
          logger.warn(`FindPlayers: no player with id=${id}`);
          return callback({ code: grpc.status.NOT_FOUND, message: 'Player not found' });
        }
        result = [player];
      } else if (nickname) {
        result = await Player.getByNickname(nickname);
        if (!result.length) {
          logger.warn(`FindPlayers: no players with nickname=${nickname}`);
          return callback({ code: grpc.status.NOT_FOUND, message: 'No players found with that nickname' });
        }
      } else if (score) {
        result = await Player.getByScore(score);
        if (!result.length) {
          logger.warn(`FindPlayers: no players with score=${score}`);
          return callback({ code: grpc.status.NOT_FOUND, message: 'No players found with that score' });
        }
      } else if (mainFaction) {
        result = await Player.getByMainFaction(mainFaction);
        if (!result.length) {
          logger.warn(`FindPlayers: no players with mainFaction=${mainFaction}`);
          return callback({ code: grpc.status.NOT_FOUND, message: 'No players found for that main faction' });
        }
      } else {
        result = await Player.getAll();
      }

      const players = result.map((p) => ({
        id: p.id,
        firstName: p.first_name,
        lastName: p.last_name,
        nickname: p.nickname,
        email: p.email,
        accountPassword: p.account_password,
        mainFaction: p.main_faction,
        eloRating: p.elo_rating,
        wins: p.wins,
        losses: p.losses,
        tournamentsParticipated: p.tournaments_participated,
        achievements: p.achievements ? JSON.stringify(p.achievements) : '',
        score: p.score,
        profilePic: p.profile_pic || '',
        banner: p.banner || '',
        teamId: p.team_id || 0,
      }));

      logger.info(`FindPlayers: returning ${players.length} player(s)`);
      callback(null, { players });
    } catch (error) {
      logger.error(`Error fetching players: ${error.message}`);
      callback(error, null);
    }
  },

  async CreatePlayer(call, callback) {
    const {
      firstName,
      lastName,
      nickname,
      email,
      accountPassword,
      mainFaction,
      score,
      eloRating,
      wins,
      losses,
      tournamentsParticipated,
      achievements,
      profilePic,
      banner,
      teamId
    } = call.request;

    try {
      const newPlayerId = await Player.create({
        first_name: firstName,
        last_name: lastName,
        nickname,
        email,
        account_password: accountPassword,
        main_faction: mainFaction,
        score,
        elo_rating: eloRating,
        wins,
        losses,
        tournaments_participated: tournamentsParticipated,
        achievements,
        profile_pic: profilePic,
        banner,
        team_id: teamId
      });
      logger.info(`CreatePlayer: new player ID=${newPlayerId}`);
      callback(null, { id: newPlayerId });
    } catch (error) {
      logger.error(`Error creating player: ${error.message}`);
      callback(error, null);
    }
  },

  async AddAchievement(call, callback) {
    try {
      authenticate(call);

      const { id, achievement } = call.request;
      if (!achievement) {
        logger.warn('AddAchievement: missing achievement');
        return callback({
          code: grpc.status.INVALID_ARGUMENT,
          message: 'Achievement is required',
        });
      }
      const affectedRows = await Player.addAchievement(id, achievement);
      if (affectedRows === 0) {
        logger.warn(`AddAchievement: player not found for id=${id}`);
        return callback({ code: grpc.status.NOT_FOUND, message: 'Player not found' });
      }
      logger.info(`AddAchievement: added achievement to player id=${id}`);
      callback(null, {});
    } catch (error) {
      logger.error(`Error adding achievement: ${error.message}`);
      if (error.message.includes('authorization') || error.message.includes('token')) {
        return callback({ code: grpc.status.UNAUTHENTICATED, message: error.message });
      }
      callback(error, null);
    }
  },

  async DeletePlayerById(call, callback) {
    try {
      authenticate(call);

      const { id } = call.request;
      const affectedRows = await Player.deleteById(id);
      if (affectedRows === 0) {
        logger.warn(`DeletePlayerById: no player with id=${id}`);
        return callback({ code: grpc.status.NOT_FOUND, message: 'Player not found' });
      }
      logger.info(`DeletePlayerById: player id=${id} deleted`);
      callback(null, {});
    } catch (error) {
      logger.error(`Error deleting player: ${error.message}`);
      if (error.message.includes('token')) {
        return callback({ code: grpc.status.UNAUTHENTICATED, message: error.message });
      }
      callback(error, null);
    }
  },

  async UpdateProfile(call, callback) {
    try {
      authenticate(call);

      const { id, firstName, lastName, nickname } = call.request;
      const affectedRows = await Player.updateProfile(id, firstName, lastName, nickname);
      if (affectedRows === 0) {
        logger.warn(`UpdateProfile: no changes for id=${id}`);
        return callback({ code: grpc.status.NOT_FOUND, message: 'Player not found or no changes made' });
      }
      logger.info(`UpdateProfile: updated player id=${id}`);
      callback(null, {});
    } catch (error) {
      logger.error(`Error updating profile: ${error.message}`);
      callback(error, null);
    }
  },

  async UpdateEmail(call, callback) {
    try {
      authenticate(call);

      const { id, email } = call.request;
      const affectedRows = await Player.updateEmail(id, email);
      if (affectedRows === 0) {
        logger.warn(`UpdateEmail: no update for id=${id}`);
        return callback({ code: grpc.status.NOT_FOUND, message: 'Player not found or email unchanged' });
      }
      logger.info(`UpdateEmail: updated email for player id=${id}`);
      callback(null, {});
    } catch (error) {
      logger.error(`Error updating email: ${error.message}`);
      callback(error, null);
    }
  },

  async UpdatePassword(call, callback) {
    try {
      authenticate(call);

      const { id, accountPassword } = call.request;
      const affectedRows = await Player.updatePassword(id, accountPassword);
      if (affectedRows === 0) {
        logger.warn(`UpdatePassword: no update for id=${id}`);
        return callback({ code: grpc.status.NOT_FOUND, message: 'Player not found or password unchanged' });
      }
      logger.info(`UpdatePassword: updated password for player id=${id}`);
      callback(null, {});
    } catch (error) {
      logger.error(`Error updating password: ${error.message}`);
      callback(error, null);
    }
  },

  async UpdateScore(call, callback) {
    try {
      authenticate(call);

      const { id, score } = call.request;
      const affectedRows = await Player.updateScore(id, score);
      if (affectedRows === 0) {
        logger.warn(`UpdateScore: no update for id=${id}`);
        return callback({ code: grpc.status.NOT_FOUND, message: 'Player not found or score unchanged' });
      }
      logger.info(`UpdateScore: updated score for player id=${id}`);
      callback(null, {});
    } catch (error) {
      logger.error(`Error updating score: ${error.message}`);
      callback(error, null);
    }
  },

  async UpdateStats(call, callback) {
    try {
      authenticate(call);

      const { id, wins, losses, tournamentsParticipated } = call.request;
      const affectedRows = await Player.updateStats(id, wins, losses, tournamentsParticipated);
      if (affectedRows === 0) {
        logger.warn(`UpdateStats: no update for id=${id}`);
        return callback({ code: grpc.status.NOT_FOUND, message: 'Player not found or stats unchanged' });
      }
      logger.info(`UpdateStats: updated stats for player id=${id}`);
      callback(null, {});
    } catch (error) {
      logger.error(`Error updating stats: ${error.message}`);
      callback(error, null);
    }
  },

  async UpdateMainFaction(call, callback) {
    try {
      authenticate(call);

      const { id, mainFaction } = call.request;
      const affectedRows = await Player.updateMainFaction(id, mainFaction);
      if (affectedRows === 0) {
        logger.warn(`UpdateMainFaction: no update for id=${id}`);
        return callback({ code: grpc.status.NOT_FOUND, message: 'Player not found or main faction unchanged' });
      }
      logger.info(`UpdateMainFaction: updated main faction for id=${id}`);
      callback(null, {});
    } catch (error) {
      logger.error(`Error updating main faction: ${error.message}`);
      callback(error, null);
    }
  },

  async UpdateMedia(call, callback) {
    try {
      authenticate(call);

      const { id, profilePic, banner } = call.request;
      const affectedRows = await Player.updateMedia(id, profilePic, banner);
      if (affectedRows === 0) {
        logger.warn(`UpdateMedia: no update for id=${id}`);
        return callback({ code: grpc.status.NOT_FOUND, message: 'Player not found or media unchanged' });
      }
      logger.info(`UpdateMedia: updated media for player id=${id}`);
      callback(null, {});
    } catch (error) {
      logger.error(`Error updating media: ${error.message}`);
      callback(error, null);
    }
  },

  async Login(call, callback) {
    const { email, password } = call.request;
    try {
      const user = await Player.getByEmail(email);
      if (!user) {
        logger.warn(`Login: no user found for email=${email}`);
        return callback(
          { code: grpc.status.UNAUTHENTICATED, message: 'Invalid email or password' },
          undefined
        );
      }
      if (user.account_password !== password) {
        logger.warn(`Login: invalid password for email=${email}`);
        return callback(
          { code: grpc.status.UNAUTHENTICATED, message: 'Invalid email or password' },
          undefined
        );
      }
  
      const payload = { id: user.id, role: 'player', email: user.email };
      const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '1h' });
      logger.info(`Login: user id=${user.id} logged in`);
      return callback(null, { token, message: 'Login successful' });
    } catch (error) {
      logger.error(`Error logging in: ${error.message}`);
      return callback(error, undefined);
    }
  }  
};