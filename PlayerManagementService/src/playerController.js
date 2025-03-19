const Player = require('./player');

exports.createPlayer = async (req, res) => {
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
  } = req.body;
  
  try {
    const newPlayerId = await Player.create({
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
    });
    res.status(201).json({ message: "Player created successfully", playerId: newPlayerId });
  } catch (error) {
    console.error("Error creating player:", error.message);
    res.status(500).json({ message: "Failed to create player" });
  }
};

exports.patchAddAchievement = async (req, res) => {
  const { id } = req.params;
  const { achievement } = req.body; 
  if (!achievement) {
    return res.status(400).json({ message: "Achievement is required" });
  }
  try {
    const affectedRows = await Player.addAchievement(id, achievement);
    if (affectedRows === 0) {
      return res.status(404).json({ message: "Player not found" });
    }
    res.status(200).json({ message: "Achievement added successfully" });
  } catch (error) {
    console.error("Error adding achievement:", error.message);
    res.status(500).json({ message: "Failed to add achievement" });
  }
};

exports.findPlayers = async (req, res) => {
  const { id, nickname, score, main_faction } = req.query;
  try {
    let result;
    if (id) {
      const player = await Player.getById(id);
      if (!player) {
        return res.status(404).json({ message: 'Player not found' });
      }
      result = [player];
    } else if (nickname) {
      result = await Player.getByNickname(nickname);
      if (!result.length) {
        return res.status(404).json({ message: 'No players found with that nickname' });
      }
    } else if (score) {
      result = await Player.getByScore(score);
      if (!result.length) {
        return res.status(404).json({ message: 'No players found with that score' });
      }
    } else if (main_faction) {
      result = await Player.getByMainFaction(main_faction);
      if (!result.length) {
        return res.status(404).json({ message: 'No players found for that main faction' });
      }
    } else {
      result = await Player.getAll();
    }
    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching players:', error.message);
    res.status(500).json({ message: 'Failed to retrieve players' });
  }
};

exports.deletePlayerById = async (req, res) => {
  const { id } = req.params;
  try {
    const affectedRows = await Player.deleteById(id);
    if (affectedRows === 0) {
      return res.status(404).json({ message: "Player not found" });
    }
    res.status(200).json({ message: "Player deleted successfully" });
  } catch (error) {
    console.error("Error deleting player by ID:", error.message);
    res.status(500).json({ message: "Failed to delete player" });
  }
};

exports.updateProfile = async (req, res) => {
  const { id } = req.params;
  const { first_name, last_name, nickname } = req.body;
  try {
    const affectedRows = await Player.updateProfile(id, first_name, last_name, nickname);
    if (affectedRows === 0) {
      return res.status(404).json({ message: "Player not found or no changes made" });
    }
    res.status(200).json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error("Error updating profile:", error.message);
    res.status(500).json({ message: "Failed to update profile" });
  }
};

exports.updateEmail = async (req, res) => {
  const { id } = req.params;
  const { email } = req.body;
  try {
    const affectedRows = await Player.updateEmail(id, email);
    if (affectedRows === 0) {
      return res.status(404).json({ message: "Player not found or email unchanged" });
    }
    res.status(200).json({ message: "Email updated successfully" });
  } catch (error) {
    console.error("Error updating email:", error.message);
    res.status(500).json({ message: "Failed to update email" });
  }
};

exports.updatePassword = async (req, res) => {
  const { id } = req.params;
  const { password } = req.body;
  try {
    const affectedRows = await Player.updatePassword(id, password);
    if (affectedRows === 0) {
      return res.status(404).json({ message: "Player not found or password unchanged" });
    }
    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error updating password:", error.message);
    res.status(500).json({ message: "Failed to update password" });
  }
};

exports.updateScore = async (req, res) => {
  const { id } = req.params;
  const { score } = req.body;
  try {
    const affectedRows = await Player.updateScore(id, score);
    if (affectedRows === 0) {
      return res.status(404).json({ message: "Player not found or score unchanged" });
    }
    res.status(200).json({ message: "Score updated successfully" });
  } catch (error) {
    console.error("Error updating score:", error.message);
    res.status(500).json({ message: "Failed to update score" });
  }
};

exports.updateStats = async (req, res) => {
  const { id } = req.params;
  const { wins, losses, tournaments_participated } = req.body;
  try {
    const affectedRows = await Player.updateStats(id, wins, losses, tournaments_participated);
    if (affectedRows === 0) {
      return res.status(404).json({ message: "Player not found or stats unchanged" });
    }
    res.status(200).json({ message: "Stats updated successfully" });
  } catch (error) {
    console.error("Error updating stats:", error.message);
    res.status(500).json({ message: "Failed to update stats" });
  }
};

exports.updateMainFaction = async (req, res) => {
  const { id } = req.params;
  const { mainFaction } = req.body;
  try {
    const affectedRows = await Player.updateMainFaction(id, mainFaction);
    if (affectedRows === 0) {
      return res.status(404).json({ message: "Player not found or main faction unchanged" });
    }
    res.status(200).json({ message: "Main faction updated successfully" });
  } catch (error) {
    console.error("Error updating main faction:", error.message);
    res.status(500).json({ message: "Failed to update main faction" });
  }
};

exports.updateMedia = async (req, res) => {
  const { id } = req.params;
  const { profile_pic, banner } = req.body;
  try {
    const affectedRows = await Player.updateMedia(id, profile_pic, banner);
    if (affectedRows === 0) {
      return res.status(404).json({ message: "Player not found or media unchanged" });
    }
    res.status(200).json({ message: "Profile picture and banner updated successfully" });
  } catch (error) {
    console.error("Error updating media:", error.message);
    res.status(500).json({ message: "Failed to update media" });
  }
};