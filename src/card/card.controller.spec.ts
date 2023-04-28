import { Test } from '@nestjs/testing';
import { CardController } from './card.controller';
import { CardService } from './card.service';
import { Card } from './card.entity';
import { CreateCardDto } from './create-card.dto';
import { CardGateway } from './card.gateway';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('CardController', () => {
  let cardController: CardController;
  let cardService: CardService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [CardController],
      providers: [
        CardService,
        {
          provide: getRepositoryToken(Card),
          useClass: Repository,
        },
        CardGateway,
      ],
    }).compile();

    cardController = moduleRef.get<CardController>(CardController);
    cardService = moduleRef.get<CardService>(CardService);
  });

  describe('getAllCards', () => {
    it('should return an array of cards', async () => {
      const mockCards = [new Card(), new Card()];
      jest.spyOn(cardService, 'getAllCards').mockResolvedValue(mockCards);

      const result = await cardController.getAllCards();

      expect(cardService.getAllCards).toHaveBeenCalled();
      expect(result).toBe(mockCards);
    });
  });

  describe('createCard', () => {
    it('should create a new card', async () => {
      const mockCreateCardDto: CreateCardDto = {
        name: 'Test Card',
        title: 'Test Title',
        answer: 'Test Answer',
      };
      const mockCard = new Card();

      jest.spyOn(cardService, 'createCard').mockResolvedValue(mockCard);

      const result = await cardController.createCard(mockCreateCardDto);

      expect(cardService.createCard).toHaveBeenCalledWith(
        mockCreateCardDto.name,
        mockCreateCardDto.title,
        mockCreateCardDto.answer,
      );
      expect(result).toBe(mockCard);
    });
  });

  describe('deleteAllCards', () => {
    it('should delete all cards', async () => {
      jest.spyOn(cardService, 'deleteAllCards').mockResolvedValue();

      await cardController.deleteAllCards();

      expect(cardService.deleteAllCards).toHaveBeenCalled();
    });
  });
});
