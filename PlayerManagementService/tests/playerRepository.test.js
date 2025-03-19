const db = require('../src/db');
const Player = require('../src/player');

jest.mock('../src/db');

describe('Player Repository (Unit Tests)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('ustvari novega igralca in vrne insertId', async () => {
      db.query.mockResolvedValueOnce([{ insertId: 123 }]);
      const newPlayerData = {
        first_name: 'Test',
        last_name: 'User',
        nickname: 'testuser',
        email: 'test@example.com',
        account_password: 'secret'
      };

      const result = await Player.create(newPlayerData);
      expect(result).toBe(123);
      expect(db.query).toHaveBeenCalledTimes(1);
      const [sql, params] = db.query.mock.calls[0];
      expect(sql).toContain('INSERT INTO player');
      expect(params).toContain('Test');
      expect(params).toContain('User');
    });

    it('vrže napako, če se zgodi napaka v bazi', async () => {
      db.query.mockRejectedValueOnce(new Error('DB error'));
      await expect(Player.create({})).rejects.toThrow('Database error');
    });
  });

  describe('addAchievement', () => {
    it('doda dosežek k obstoječim dosežkom', async () => {
      db.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
      const affectedRows = await Player.addAchievement(1, 'Nova zmaga');
      expect(affectedRows).toBe(1);
      expect(db.query).toHaveBeenCalledTimes(1);
      const [sql, params] = db.query.mock.calls[0];
      expect(sql).toContain('JSON_ARRAY_APPEND');
      expect(params).toEqual(['Nova zmaga', 1]);
    });

    it('vrže napako, če db ne uspe posodobiti', async () => {
      db.query.mockRejectedValueOnce(new Error('DB error'));
      await expect(Player.addAchievement(999, 'Fail')).rejects.toThrow('Database error');
    });
  });

  describe('getAll', () => {
    it('vrne vse igralce iz baze', async () => {
      const mockPlayers = [
        { id: 1, nickname: 'test1' },
        { id: 2, nickname: 'test2' },
      ];
      db.query.mockResolvedValueOnce([mockPlayers]);
      const result = await Player.getAll();
      expect(result).toHaveLength(2);
      expect(result[0].nickname).toBe('test1');
    });

    it('vrže napako, če pride do napake v bazi', async () => {
      db.query.mockRejectedValueOnce(new Error('DB error'));
      await expect(Player.getAll()).rejects.toThrow('Database error');
    });
  });

  describe('getById', () => {
    it('vrne igralca s podanim ID', async () => {
      db.query.mockResolvedValueOnce([[{ id: 5, nickname: 'specialOne' }]]);
      const result = await Player.getById(5);
      expect(result).toEqual({ id: 5, nickname: 'specialOne' });
      expect(db.query).toHaveBeenCalledWith('SELECT * FROM player WHERE id = ?', [5]);
    });
  });

  describe('getByScore', () => {
    it('vrne seznam igralcev z določenim score', async () => {
      db.query.mockResolvedValueOnce([[{ id: 10, score: 100 }]]);
      const players = await Player.getByScore(100);
      expect(Array.isArray(players)).toBe(true);
    });
  });

  describe('getByNickname', () => {
    it('vrne seznam igralcev z določenim nickname', async () => {
      db.query.mockResolvedValueOnce([[{ id: 1, nickname: 'nick' }]]);
      const result = await Player.getByNickname('nick');
      expect(Array.isArray(result)).toBe(true);
      expect(result[0].nickname).toBe('nick');
    });
  });

  describe('getByMainFaction', () => {
    it('vrne seznam igralcev z določeno frakcijo', async () => {
      db.query.mockResolvedValueOnce([[{ id: 2, main_faction: 'Orcs' }]]);
      const result = await Player.getByMainFaction('Orcs');
      expect(result[0].main_faction).toBe('Orcs');
    });
  });

  describe('deleteById', () => {
    it('izbriše igralca in vrne affectedRows', async () => {
      db.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
      const rows = await Player.deleteById(10);
      expect(rows).toBe(1);
    });
  });

  describe('updateProfile', () => {
    it('posodobi profil (ime, priimek, vzdevek)', async () => {
      db.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
      const rows = await Player.updateProfile(1, 'Ime', 'Priimek', 'Vzdevek');
      expect(rows).toBe(1);
      const [sql, params] = db.query.mock.calls[0];
      expect(sql).toContain('UPDATE player SET first_name = ?, last_name = ?, nickname = ? WHERE id = ?');
      expect(params).toEqual(['Ime', 'Priimek', 'Vzdevek', 1]);
    });
  });

  describe('updateEmail', () => {
    it('posodobi email igralca', async () => {
      db.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
      const rows = await Player.updateEmail(1, 'nov.email@example.com');
      expect(rows).toBe(1);
    });
  });

  describe('updatePassword', () => {
    it('posodobi geslo igralca', async () => {
      db.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
      const rows = await Player.updatePassword(1, 'newSecret');
      expect(rows).toBe(1);
    });
  });

  describe('updateScore', () => {
    it('posodobi score igralca', async () => {
      db.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
      const rows = await Player.updateScore(1, 999);
      expect(rows).toBe(1);
    });
  });

  describe('updateStats', () => {
    it('posodobi wins, losses in tournaments_participated', async () => {
      db.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
      const rows = await Player.updateStats(1, 10, 5, 2);
      expect(rows).toBe(1);
    });
  });

  describe('updateMainFaction', () => {
    it('posodobi glavno frakcijo igralca', async () => {
      db.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
      const rows = await Player.updateMainFaction(1, 'Elves');
      expect(rows).toBe(1);
    });
  });

  describe('updateMedia', () => {
    it('posodobi profile_pic in banner', async () => {
      db.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
      const rows = await Player.updateMedia(1, 'path/to/pic.jpg', 'path/to/banner.jpg');
      expect(rows).toBe(1);
    });
  });
});