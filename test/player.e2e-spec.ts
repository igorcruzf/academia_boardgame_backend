import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Repository } from 'typeorm';
import { Player } from '../src/player/player.entity';
import { Room } from '../src/room/room.entity';
import { CreatePlayerDto } from '../src/player/create-player.dto';
import { Score } from '../src/score/score.entity';
import {
  buildTestModule,
  createPlayersMock,
  createRoomMock,
} from './e2e.utils';

describe('PlayerController (e2e)', () => {
  let app: INestApplication;
  let playerRepository: Repository<Player>;
  let roomRepository: Repository<Room>;
  let scoreRepository: Repository<Score>;
  let room: Room;
  let player1: Player;
  let player2: Player;
  let player3: Player;

  beforeEach(async () => {
    const testModule = await buildTestModule();
    app = testModule.app;
    playerRepository = testModule.playerRepository;
    roomRepository = testModule.roomRepository;
    scoreRepository = testModule.scoreRepository;

    room = await createRoomMock(roomRepository, 'Test Room', 3);

    const players = await createPlayersMock(playerRepository, room);
    player1 = players.player1;
    player2 = players.player2;
    player3 = players.player3;
  });

  afterEach(async () => {
    await app.close();
  });

  describe('GET /players', () => {
    it('should return an array of players ranked by total score for a given room', async () => {
      await scoreRepository.save([
        {
          score: 10,
          round: 1,
          player_id: player2.id,
        },
        {
          score: 5,
          round: 1,
          player_id: player3.id,
        },
        {
          score: 1,
          round: 1,
          player_id: player1.id,
        },
        {
          score: 10,
          round: 2,
          player_id: player2.id,
        },
        {
          score: 5,
          round: 2,
          player_id: player3.id,
        },
      ]);

      const response = await request(app.getHttpServer())
        .get('/players?room=Test Room')
        .expect(200);
      const rankedPlayers = response.body;

      expect(rankedPlayers).toHaveLength(3);
      expect(rankedPlayers[0].id).toBe(player2.id);
      expect(rankedPlayers[0].scores.length).toBe(2);
      expect(rankedPlayers[1].id).toBe(player3.id);
      expect(rankedPlayers[1].scores.length).toBe(2);
      expect(rankedPlayers[2].id).toBe(player1.id);
      expect(rankedPlayers[2].scores.length).toBe(2);
      expect(rankedPlayers[2].scores[1].score).toBe(0);
      expect(rankedPlayers[2].scores[1].round).toBe(2);
    });
  });

  describe('POST /players', () => {
    it('should create a new player in the specified room', async () => {
      const newPlayer: CreatePlayerDto = {
        name: 'New Player',
        roomName: room.name,
      };

      const response = await request(app.getHttpServer())
        .post('/players')
        .send(newPlayer)
        .expect(201);

      const createdPlayer = await playerRepository.findOne({
        where: { id: response.body.id },
        relations: ['room'],
      });

      expect(createdPlayer).toBeDefined();
      expect(createdPlayer.name).toBe(newPlayer.name);
      expect(createdPlayer.room).toBeDefined();
      expect(createdPlayer.room.name).toBe(room.name);
    });

    it('should throw an error for an invalid room', async () => {
      const invalidRoomName = 'Invalid Room';

      const newPlayer: CreatePlayerDto = {
        name: 'New Player',
        roomName: invalidRoomName,
      };

      const response = await request(app.getHttpServer())
        .post('/players')
        .send(newPlayer)
        .expect(404);

      expect(response.body).toHaveProperty(
        'message',
        `Room with name ${invalidRoomName} not found.`,
      );
    });
  });

  describe('PATCH /players', () => {
    it('should change a player to a new room', async () => {
      const newRoom = await roomRepository.save({
        name: 'Test Room 2',
        actualRound: 1,
        players: [],
      });

      const response = await request(app.getHttpServer())
        .patch(`/players/${player1.id}`)
        .send({ roomName: newRoom.name })
        .expect(200);

      expect(response.body.name).toBe(player1.name);
      expect(response.body.id).toBe(player1.id);
      expect(response.body.room.name).toBe(newRoom.name);
    });

    it('should throw an error for an invalid player', async () => {
      const newRoom = await roomRepository.save({
        name: 'Test Room 2',
        actualRound: 1,
        players: [],
      });

      const invalidPlayerId = 12321321;

      const response = await request(app.getHttpServer())
        .patch(`/players/${invalidPlayerId}`)
        .send({ roomName: newRoom.name })
        .expect(404);

      expect(response.body).toHaveProperty(
        'message',
        `Player with ID ${invalidPlayerId} not found.`,
      );
    });

    it('should throw an error for an invalid room', async () => {
      const invalidRoomName = 'Invalid Room';

      const response = await request(app.getHttpServer())
        .patch(`/players/${player1.id}`)
        .send({ roomName: invalidRoomName })
        .expect(404);

      expect(response.body).toHaveProperty(
        'message',
        `Room with name ${invalidRoomName} not found.`,
      );
    });
  });
});
