const grpc = require('@grpc/grpc-js');
const playerService = require('../src/playerService');

jest.mock('../src/player', () => ({
  getById: jest.fn(),
  getByNickname: jest.fn(),
  getByScore: jest.fn(),
  getByMainFaction: jest.fn(),
  getAll: jest.fn(),
  create: jest.fn(),
  addAchievement: jest.fn(),
  deleteById: jest.fn(),
  updateProfile: jest.fn(),
  updateEmail: jest.fn(),
  updatePassword: jest.fn(),
  updateScore: jest.fn(),
  updateStats: jest.fn(),
  updateMainFaction: jest.fn(),
  updateMedia: jest.fn(),
  getByEmail: jest.fn()
}));
const Player = require('../src/player');

jest.mock('../src/auth', () => ({
  authenticate: jest.fn()
}));
const { authenticate } = require('../src/auth');

function createCall(requestData) {
  return {
    request: requestData,
    metadata: {
      get: jest.fn(() => []), 
    }
  };
}

function createCallback() {
  return jest.fn();
}

describe('playerService Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('FindPlayers', () => {
    it('should return a player by ID', async () => {
      Player.getById.mockResolvedValue({
        id: 123,
        first_name: 'Test',
        last_name: 'User',
      });

      const call = createCall({ id: 123 });
      const callback = createCallback();

      await playerService.FindPlayers(call, callback);

      expect(Player.getById).toHaveBeenCalledWith(123);
      expect(callback).toHaveBeenCalledWith(null, {
        players: [
          expect.objectContaining({ id: 123, firstName: 'Test' })
        ]
      });
    });

    it('should return NOT_FOUND if no player is found by ID', async () => {
      Player.getById.mockResolvedValue(null);

      const call = createCall({ id: 999 });
      const callback = createCallback();

      await playerService.FindPlayers(call, callback);

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          code: grpc.status.NOT_FOUND,
          message: 'Player not found'
        })
      );
    });

    it('should handle errors gracefully', async () => {
      Player.getById.mockRejectedValue(new Error('DB error'));

      const call = createCall({ id: 123 });
      const callback = createCallback();

      await playerService.FindPlayers(call, callback);

      expect(callback).toHaveBeenCalledWith(
        expect.any(Error),
        null
      );
    });
  });

  describe('CreatePlayer', () => {
    it('should create a new player', async () => {
      Player.create.mockResolvedValue(101); 

      const call = createCall({ firstName: 'New', lastName: 'User' });
      const callback = createCallback();

      await playerService.CreatePlayer(call, callback);

      expect(Player.create).toHaveBeenCalled();
      expect(callback).toHaveBeenCalledWith(null, { id: 101 });
    });

    it('should handle DB error', async () => {
      Player.create.mockRejectedValue(new Error('DB error'));

      const call = createCall({ firstName: 'X' });
      const callback = createCallback();

      await playerService.CreatePlayer(call, callback);

      expect(callback).toHaveBeenCalledWith(
        expect.any(Error),
        null
      );
    });
  });

  describe('AddAchievement', () => {
    it('should add an achievement when authenticated', async () => {
      authenticate.mockImplementation(() => true); 
      Player.addAchievement.mockResolvedValue(1); 

      const call = createCall({ id: 10, achievement: 'Won Tournament' });
      const callback = createCallback();

      await playerService.AddAchievement(call, callback);

      expect(Player.addAchievement).toHaveBeenCalledWith(10, 'Won Tournament');
      expect(callback).toHaveBeenCalledWith(null, {});
    });

    it('should return UNAUTHENTICATED if token is invalid', async () => {
      authenticate.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const call = createCall({ id: 10, achievement: 'Test' });
      const callback = createCallback();

      await playerService.AddAchievement(call, callback);

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          code: grpc.status.UNAUTHENTICATED,
          message: 'Invalid token'
        })
      );
    });

    it('should return NOT_FOUND if no row is updated', async () => {
      authenticate.mockImplementation(() => true);
      Player.addAchievement.mockResolvedValue(0); 

      const call = createCall({ id: 999, achievement: 'Test' });
      const callback = createCallback();

      await playerService.AddAchievement(call, callback);

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          code: grpc.status.NOT_FOUND,
          message: 'Player not found'
        })
      );
    });
  });

  describe('DeletePlayerById', () => {
    it('should delete player if found', async () => {
      authenticate.mockImplementation(() => true);
      Player.deleteById.mockResolvedValue(1);

      const call = createCall({ id: 22 });
      const callback = createCallback();

      await playerService.DeletePlayerById(call, callback);

      expect(Player.deleteById).toHaveBeenCalledWith(22);
      expect(callback).toHaveBeenCalledWith(null, {});
    });

    it('should return NOT_FOUND if no player was deleted', async () => {
      authenticate.mockImplementation(() => true);
      Player.deleteById.mockResolvedValue(0);

      const call = createCall({ id: 999 });
      const callback = createCallback();

      await playerService.DeletePlayerById(call, callback);

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          code: grpc.status.NOT_FOUND,
          message: 'Player not found'
        })
      );
    });
  });

  describe('UpdateProfile', () => {
    it('should update profile if found', async () => {
      authenticate.mockImplementation(() => true);
      Player.updateProfile.mockResolvedValue(1);

      const call = createCall({
        id: 123,
        firstName: 'John',
        lastName: 'Doe',
        nickname: 'JD'
      });
      const callback = createCallback();

      await playerService.UpdateProfile(call, callback);

      expect(Player.updateProfile).toHaveBeenCalledWith(123, 'John', 'Doe', 'JD');
      expect(callback).toHaveBeenCalledWith(null, {});
    });

    it('should return NOT_FOUND if no changes', async () => {
      authenticate.mockImplementation(() => true);
      Player.updateProfile.mockResolvedValue(0);

      const call = createCall({
        id: 123,
        firstName: 'NoChange'
      });
      const callback = createCallback();

      await playerService.UpdateProfile(call, callback);

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          code: grpc.status.NOT_FOUND
        })
      );
    });
  });

  describe('UpdateEmail', () => {
    it('should update email if found', async () => {
      authenticate.mockImplementation(() => true);
      Player.updateEmail.mockResolvedValue(1);

      const call = createCall({ id: 1, email: 'new@example.com' });
      const callback = createCallback();

      await playerService.UpdateEmail(call, callback);

      expect(Player.updateEmail).toHaveBeenCalledWith(1, 'new@example.com');
      expect(callback).toHaveBeenCalledWith(null, {});
    });
  });

  describe('UpdatePassword', () => {
    it('should update password if found', async () => {
      authenticate.mockImplementation(() => true);
      Player.updatePassword.mockResolvedValue(1);

      const call = createCall({ id: 7, accountPassword: 'secret' });
      const callback = createCallback();

      await playerService.UpdatePassword(call, callback);

      expect(Player.updatePassword).toHaveBeenCalledWith(7, 'secret');
      expect(callback).toHaveBeenCalledWith(null, {});
    });
  });

  describe('UpdateScore', () => {
    it('should update score if found', async () => {
      authenticate.mockImplementation(() => true);
      Player.updateScore.mockResolvedValue(1);

      const call = createCall({ id: 10, score: 999 });
      const callback = createCallback();

      await playerService.UpdateScore(call, callback);

      expect(Player.updateScore).toHaveBeenCalledWith(10, 999);
      expect(callback).toHaveBeenCalledWith(null, {});
    });
  });

  describe('UpdateStats', () => {
    it('should update stats if found', async () => {
      authenticate.mockImplementation(() => true);
      Player.updateStats.mockResolvedValue(1);

      const call = createCall({ id: 33, wins: 5, losses: 2, tournamentsParticipated: 3 });
      const callback = createCallback();

      await playerService.UpdateStats(call, callback);

      expect(Player.updateStats).toHaveBeenCalledWith(33, 5, 2, 3);
      expect(callback).toHaveBeenCalledWith(null, {});
    });
  });

  describe('UpdateMainFaction', () => {
    it('should update main faction if found', async () => {
      authenticate.mockImplementation(() => true);
      Player.updateMainFaction.mockResolvedValue(1);

      const call = createCall({ id: 88, mainFaction: 'NewFaction' });
      const callback = createCallback();

      await playerService.UpdateMainFaction(call, callback);

      expect(Player.updateMainFaction).toHaveBeenCalledWith(88, 'NewFaction');
      expect(callback).toHaveBeenCalledWith(null, {});
    });
  });

  describe('UpdateMedia', () => {
    it('should update media if found', async () => {
      authenticate.mockImplementation(() => true);
      Player.updateMedia.mockResolvedValue(1);

      const call = createCall({ id: 50, profilePic: 'pic.png', banner: 'banner.png' });
      const callback = createCallback();

      await playerService.UpdateMedia(call, callback);

      expect(Player.updateMedia).toHaveBeenCalledWith(50, 'pic.png', 'banner.png');
      expect(callback).toHaveBeenCalledWith(null, {});
    });
  });

  describe('Login', () => {
    it('should return token if valid credentials', async () => {
      Player.getByEmail.mockResolvedValue({
        id: 99,
        account_password: 'pass123'
      });

      const call = createCall({ email: 'test@example.com', password: 'pass123' });
      const callback = createCallback();

      await playerService.Login(call, callback);

      expect(callback.mock.calls[0][0]).toBeNull();
      const response = callback.mock.calls[0][1];
      expect(response.token).toBeDefined();
      expect(response.message).toBe('Login successful');
    });

    it('should return UNAUTHENTICATED if user not found', async () => {
      Player.getByEmail.mockResolvedValue(null);

      const call = createCall({ email: 'doesnot@exist.com', password: 'secret' });
      const callback = createCallback();

      await playerService.Login(call, callback);

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          code: grpc.status.UNAUTHENTICATED,
          message: 'Invalid email or password'
        }),
        undefined
      );
    });

    it('should return UNAUTHENTICATED if password mismatch', async () => {
      Player.getByEmail.mockResolvedValue({
        id: 99,
        account_password: 'someOtherPass'
      });

      const call = createCall({ email: 'test@example.com', password: 'wrongpass' });
      const callback = createCallback();

      await playerService.Login(call, callback);

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          code: grpc.status.UNAUTHENTICATED,
          message: 'Invalid email or password'
        }),
        undefined
      );
    });
  });
});