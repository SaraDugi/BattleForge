const request = require('supertest');
const app = require('../src/app');

describe('Player Endpoints (Integration Tests)', () => {
  let token;
  let createdId;

  beforeAll(async () => {
    const res = await request(app).get('/generate-token');
    token = res.body.token;
  });

  describe('POST /players', () => {
    it('ustvari novega igralca in vrne status 201 ter playerId', async () => {
      const newPlayer = {
        first_name: 'Integration',
        last_name: 'Test',
        nickname: 'itest',
        email: 'itest@example.com',
        account_password: 'secretPass'
      };

      const response = await request(app)
        .post('/players')
        .send(newPlayer);

      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('playerId');
      createdId = response.body.playerId;
    });
  });

  describe('PATCH /players/:id/achievement', () => {
    it('dodaja dosežek igralcu, če je zahtevek avtoriziran', async () => {
      const response = await request(app)
        .patch(`/players/${createdId}/achievement`)
        .set('Authorization', `Bearer ${token}`)
        .send({ achievement: 'Integration Win' });

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('GET /players (no query)', () => {
    it('vrne seznam vseh igralcev', async () => {
      const response = await request(app).get('/players');
      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('GET /players?id=', () => {
    it('vrne igralca z določenim ID', async () => {
      const response = await request(app).get(`/players?id=${createdId}`);
      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0].id).toBe(createdId);
    });
  });

  describe('GET /players?score=', () => {
    it('vrne seznam igralcev z določenim score, če obstajajo', async () => {
      await request(app)
        .put(`/players/${createdId}/score`)
        .set('Authorization', `Bearer ${token}`)
        .send({ score: 555 });

      const response = await request(app).get('/players?score=555');
      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('GET /players?nickname=', () => {
    it('vrne seznam igralcev z določenim nickname', async () => {
      const response = await request(app).get('/players?nickname=itest');
      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('GET /players?main_faction=', () => {
    it('vrne seznam igralcev z določeno frakcijo, če obstajajo', async () => {
      await request(app)
        .put(`/players/${createdId}/main_faction`)
        .set('Authorization', `Bearer ${token}`)
        .send({ mainFaction: 'Orcs' });

      const response = await request(app).get('/players?main_faction=Orcs');
      expect([200, 404]).toContain(response.statusCode);
    });
  });

  describe('PUT /players/:id/profile', () => {
    it('posodobi ime, priimek in vzdevek', async () => {
      const response = await request(app)
        .put(`/players/${createdId}/profile`)
        .set('Authorization', `Bearer ${token}`)
        .send({ first_name: 'NewName', last_name: 'NewLast', nickname: 'newnick' });

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('PUT /players/:id/email', () => {
    it('posodobi email', async () => {
      const response = await request(app)
        .put(`/players/${createdId}/email`)
        .set('Authorization', `Bearer ${token}`)
        .send({ email: 'newemail@example.com' });

      expect(response.statusCode).toBe(200);
    });
  });

  describe('PUT /players/:id/password', () => {
    it('posodobi geslo', async () => {
      const response = await request(app)
        .put(`/players/${createdId}/password`)
        .set('Authorization', `Bearer ${token}`)
        .send({ password: 'newSecretPass' });

      expect(response.statusCode).toBe(200);
    });
  });

  describe('PUT /players/:id/score', () => {
    it('posodobi score', async () => {
      const response = await request(app)
        .put(`/players/${createdId}/score`)
        .set('Authorization', `Bearer ${token}`)
        .send({ score: 1000 });

      expect(response.statusCode).toBe(200);
    });
  });

  describe('PUT /players/:id/stats', () => {
    it('posodobi wins, losses, tournaments_participated', async () => {
      const response = await request(app)
        .put(`/players/${createdId}/stats`)
        .set('Authorization', `Bearer ${token}`)
        .send({ wins: 10, losses: 5, tournaments_participated: 2 });

      expect(response.statusCode).toBe(200);
    });
  });

  describe('PUT /players/:id/main_faction', () => {
    it('posodobi glavno frakcijo', async () => {
      const response = await request(app)
        .put(`/players/${createdId}/main_faction`)
        .set('Authorization', `Bearer ${token}`)
        .send({ mainFaction: 'Elves' });

      expect(response.statusCode).toBe(200);
    });
  });

  describe('PUT /players/:id/media', () => {
    it('posodobi profile_pic in banner', async () => {
      const response = await request(app)
        .put(`/players/${createdId}/media`)
        .set('Authorization', `Bearer ${token}`)
        .send({ profile_pic: 'path/to/pic.png', banner: 'path/to/banner.png' });

      expect(response.statusCode).toBe(200);
    });
  });

  describe('DELETE /players/:id', () => {
    it('izbriše igralca z določenim ID', async () => {
      const response = await request(app)
        .delete(`/players/${createdId}`)
        .set('Authorization', `Bearer ${token}`);
      expect([200, 204]).toContain(response.statusCode);
    });
  });
});