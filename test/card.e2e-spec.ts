import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { CreateCardDto } from '../src/card/create-card.dto';
import { Card } from '../src/card/card.entity';
import { Player } from '../src/player/player.entity';
import { Repository } from 'typeorm';
import { Room } from '../src/room/room.entity';
import {
  buildTestModule,
  createCardMocks,
  createPlayersMock,
  createRoomMock,
} from './e2e.utils';
describe('CardController (e2e)', () => {
  let app: INestApplication;
  let server;
  let playerRepository: Repository<Player>;
  let roomRepository: Repository<Room>;
  let cardRepository: Repository<Card>;

  const roomName = 'Test Room';
  let cards: Card[];
  let player: Player;

  beforeEach(async () => {
    const testModule = await buildTestModule();
    app = testModule.app;
    playerRepository = testModule.playerRepository;
    roomRepository = testModule.roomRepository;
    cardRepository = testModule.cardRepository;
    server = app.getHttpServer();

    const room = await createRoomMock(roomRepository, roomName);

    const players = await createPlayersMock(playerRepository, room);
    player = players.player1;
    cards = await createCardMocks(cardRepository, player, players.player2);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /cards', () => {
    it('should return all cards by room', async () => {
      const response = await request(server)
        .get('/cards')
        .query({ room: roomName });

      expect(response.status).toBe(200);
      expect(response.body.length).toEqual(cards.length);
    });
  });

  describe('POST /cards', () => {
    it('should create a new card', async () => {
      const createCardDto: CreateCardDto = {
        playerId: player.id,
        title: 'New Card',
        answer: 'New Answer',
      };

      const response = await request(server)
        .post('/cards')
        .send(createCardDto)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body.title).toEqual(createCardDto.title);
      expect(response.body.answer).toEqual(createCardDto.answer);
      expect(response.body.player.id).toEqual(createCardDto.playerId);
    });

    it('should throw an error if player not found', async () => {
      const playerId = 12321;
      const createCardDto: CreateCardDto = {
        playerId,
        title: 'New Card',
        answer: 'New Answer',
      };

      const response = await request(server)
        .post('/cards')
        .send(createCardDto)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body).toHaveProperty(
        'message',
        `Player with ID ${playerId} not found.`,
      );
    });
  });

  describe('DELETE /cards', () => {
    it('should delete all cards by room', async () => {
      const response = await request(server)
        .delete('/cards')
        .query({ room: roomName })
        .expect(200);

      expect(response.text).toBe('');
    });
  });
});
