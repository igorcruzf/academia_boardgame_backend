import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Repository } from 'typeorm';
import { Player } from '../src/player/player.entity';
import { Room } from '../src/room/room.entity';
import { RoomDto } from '../src/room/room.dto';
import { Card } from '../src/card/card.entity';
import { Score } from '../src/score/score.entity';
import {
  buildTestModule,
  createCardMocks,
  createPlayersMock,
  createRoomMock,
} from './e2e.utils';

describe('RoomController (E2E)', () => {
  let app: INestApplication;

  let playerRepository: Repository<Player>;
  let roomRepository: Repository<Room>;
  let cardRepository: Repository<Card>;
  let scoreRepository: Repository<Score>;

  const roomName = 'Test Room';
  let room: Room;
  let player: Player;
  let player2: Player;

  beforeEach(async () => {
    const testModule = await buildTestModule();
    app = testModule.app;
    playerRepository = testModule.playerRepository;
    roomRepository = testModule.roomRepository;
    scoreRepository = testModule.scoreRepository;
    cardRepository = testModule.cardRepository;

    room = await createRoomMock(roomRepository, roomName);

    const players = await createPlayersMock(playerRepository, room);
    player = players.player1;
    player2 = players.player2;
    await createCardMocks(cardRepository, player, players.player2);
  });

  afterEach(async () => {
    await app.close();
  });

  describe('POST /rooms', () => {
    it('should create a new room', async () => {
      const roomDto: RoomDto = { roomName: 'New Room' };

      const response = await request(app.getHttpServer())
        .post('/rooms')
        .send(roomDto)
        .expect(HttpStatus.CREATED);

      const createdRoom = response.body;
      expect(createdRoom.name).toBe(roomDto.roomName);
    });
  });

  describe('POST /rooms/newRound', () => {
    it('should start a new round and delete all cards for the room', async () => {
      const scores = [
        { playerId: player.id, score: 10 },
        { playerId: player2.id, score: 5 },
      ];

      await request(app.getHttpServer())
        .post('/rooms/newRound')
        .send({ roomName, scores })
        .expect(HttpStatus.CREATED);

      const room = await roomRepository.findOne({
        where: { name: roomName },
        relations: ['players', 'players.scores', 'players.card'],
      });

      expect(room.actualRound).toBe(2);
      expect(room.players[0].scores[0].score).toBe(10);
      expect(room.players[0].scores[0].round).toBe(1);
      expect(room.players[0].card).toBe(null);
      expect(room.players[1].scores[0].score).toBe(5);
      expect(room.players[1].scores[0].round).toBe(1);
      expect(room.players[1].card).toBe(null);
    });
  });

  describe('POST /rooms/newGame', () => {
    it('should start a new game and delete all cards for the room', async () => {
      const roomDto: RoomDto = { roomName: roomName };

      await scoreRepository.save([
        {
          score: 10,
          round: 1,
          player_id: player2.id,
        },
        {
          score: 1,
          round: 1,
          player_id: player.id,
        },
      ]);

      await request(app.getHttpServer())
        .post('/rooms/newGame')
        .send({ roomDto })
        .expect(HttpStatus.CREATED);

      const room = await roomRepository.findOne({
        where: { name: roomName },
        relations: ['players', 'players.scores', 'players.card'],
      });

      expect(room.actualRound).toBe(1);
      expect(room.players[0].scores).toEqual([]);
      expect(room.players[0].card).toBe(null);
      expect(room.players[1].scores).toEqual([]);
      expect(room.players[1].card).toBe(null);
    });
  });
});
