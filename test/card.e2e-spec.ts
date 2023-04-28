import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { CardController } from '../src/card/card.controller';
import { CardService } from '../src/card/card.service';
import { CreateCardDto } from '../src/card/create-card.dto';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Card } from '../src/card/card.entity';
import { CardGateway } from '../src/card/card.gateway';
import { DatabaseModule } from '../src/card/database.module';
import { Server } from 'socket.io';

describe('CardController (e2e)', () => {
  let app: INestApplication;
  let cardService: CardService;
  let mockServer: Partial<Server>;

  beforeEach(async () => {
    mockServer = {
      emit: jest.fn(),
    } as any;

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        DatabaseModule, // Include the DatabaseModule with the in-memory database configuration
        TypeOrmModule.forFeature([Card]),
      ],
      controllers: [CardController],
      providers: [
        CardService,
        {
          provide: CardGateway,
          useValue: {
            server: mockServer,
          },
        },
      ],
    }).compile();
    cardService = moduleFixture.get<CardService>(CardService);
    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await cardService.deleteAllCards();
  });

  describe('/cards (GET)', () => {
    it('should return an array of cards', async () => {
      const card1 = await cardService.createCard(
        'Card 1',
        'Title 1',
        'Answer 1',
      );
      const card2 = await cardService.createCard(
        'Card 2',
        'Title 2',
        'Answer 2',
      );

      const response = await request(app.getHttpServer())
        .get('/cards')
        .expect(200);

      expect(response.body).toEqual([card1, card2]);
    });
  });

  describe('/cards (POST)', () => {
    it('should create a new card', async () => {
      const createCardDto: CreateCardDto = {
        name: 'New Card',
        title: 'New Title',
        answer: 'New Answer',
      };
      await request(app.getHttpServer())
        .post('/cards')
        .send(createCardDto)
        .expect(201);
      const createdCard = await cardService
        .getAllCards()
        .then((cards) => cards[0]);

      expect(createdCard).toBeDefined();
      expect(createdCard.name).toBe(createCardDto.name);
      expect(createdCard.title).toBe(createCardDto.title);
      expect(createdCard.answer).toBe(createCardDto.answer);
    });
  });

  describe('/cards (DELETE)', () => {
    it('should delete all cards', async () => {
      await cardService.createCard('Card 1', 'Title 1', 'Answer 1');
      await cardService.createCard('Card 2', 'Title 2', 'Answer 2');

      await request(app.getHttpServer()).delete('/cards').expect(200);

      const allCards = await cardService.getAllCards();
      expect(allCards).toHaveLength(0);
    });
  });
});
