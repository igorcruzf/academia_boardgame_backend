import { Test } from '@nestjs/testing';
import { CardController } from './card.controller';
import { CardService } from './card.service';
import { Card } from './card.entity';
import { CreateCardDto } from './create-card.dto';
import { CardGateway } from './card.gateway';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Room } from '../room/room.entity';
import { PlayerService } from '../player/player.service';
import { RoomService } from '../room/room.service';
import { ScoreService } from '../score/score.service';
import { Player } from '../player/player.entity';
import { Score } from '../score/score.entity';

describe('CardController', () => {
  let cardController: CardController;
  let cardService: CardService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [CardController],
      providers: [
        CardService,
        CardGateway,
        PlayerService,
        RoomService,
        ScoreService,
        {
          provide: getRepositoryToken(Card),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Player),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Room),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Score),
          useClass: Repository,
        },
      ],
    }).compile();

    cardController = moduleRef.get<CardController>(CardController);
    cardService = moduleRef.get<CardService>(CardService);
  });

  describe('getAllCards', () => {
    it('should return an array of cards', async () => {
      const mockCards = [new Card(), new Card()];
      jest.spyOn(cardService, 'getAllCardsByRoom').mockResolvedValue(mockCards);

      const result = await cardController.getAllCards('room');

      expect(cardService.getAllCardsByRoom).toHaveBeenCalled();
      expect(result).toBe(mockCards);
    });
  });

  describe('createCard', () => {
    it('should create a new card', async () => {
      const mockCreateCardDto: CreateCardDto = {
        title: 'Test Title',
        answer: 'Test Answer',
        playerId: 1,
      };
      const mockCard = new Card();

      jest.spyOn(cardService, 'createCard').mockResolvedValue(mockCard);

      const result = await cardController.createCard(mockCreateCardDto);

      expect(cardService.createCard).toHaveBeenCalledWith(
        mockCreateCardDto.playerId,
        mockCreateCardDto.title,
        mockCreateCardDto.answer,
      );
      expect(result).toBe(mockCard);
    });
  });

  describe('deleteAllCards', () => {
    it('should delete all cards', async () => {
      jest.spyOn(cardService, 'deleteAllCards').mockResolvedValue();

      await cardController.deleteAllCards('room');

      expect(cardService.deleteAllCards).toHaveBeenCalled();
    });
  });
});
