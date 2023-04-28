import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { Card } from './card.entity';
import { CardGateway } from './card.gateway';
import { CardService } from './card.service';
import { Server } from 'socket.io';

describe('CardService', () => {
  let cardService: CardService;
  let cardRepository: Repository<Card>;

  let mockServer: Partial<Server>;

  beforeEach(async () => {
    mockServer = {
      emit: jest.fn(),
    } as any;

    const moduleRef = await Test.createTestingModule({
      providers: [
        CardService,
        CardGateway,
        {
          provide: getRepositoryToken(Card),
          useClass: Repository,
        },
        {
          provide: CardGateway,
          useValue: {
            server: mockServer,
          },
        },
      ],
    }).compile();

    cardService = moduleRef.get<CardService>(CardService);
    cardRepository = moduleRef.get<Repository<Card>>(getRepositoryToken(Card));
  });

  describe('createCard', () => {
    it('should create a new card', async () => {
      const mockCard = new Card();
      mockCard.name = 'Test Card';
      mockCard.title = 'Test Title';
      mockCard.answer = 'Test Answer';

      jest.spyOn(cardRepository, 'save').mockResolvedValue(mockCard);
      jest.spyOn(cardService, 'emitAllCards').mockResolvedValue();

      const result = await cardService.createCard(
        mockCard.name,
        mockCard.title,
        mockCard.answer,
      );

      expect(cardRepository.save).toHaveBeenCalledWith(mockCard);
      expect(cardService.emitAllCards).toHaveBeenCalled();
      expect(result).toBe(mockCard);
    });
  });

  describe('getAllCards', () => {
    it('should return an array of cards', async () => {
      const mockCards = [new Card(), new Card()];

      jest.spyOn(cardRepository, 'find').mockResolvedValue(mockCards);

      const result = await cardService.getAllCards();

      expect(cardRepository.find).toHaveBeenCalled();
      expect(result).toBe(mockCards);
    });
  });
  describe('deleteAllCards', () => {
    it('should delete all cards', async () => {
      const mockDeleteResult: DeleteResult = { affected: 2, raw: {} };

      const deleteSpy = jest
        .spyOn(cardRepository, 'delete')
        .mockResolvedValue(mockDeleteResult);
      await cardService.deleteAllCards();

      expect(deleteSpy).toHaveBeenCalledWith({});
    });
  });
  describe('emitCards', () => {
    it('should emit all cards', async () => {
      const mockCards = [new Card(), new Card()];
      jest.spyOn(cardRepository, 'find').mockResolvedValue(mockCards);

      await cardService.emitAllCards();
      expect(cardRepository.find).toHaveBeenCalled();
      expect(mockServer.emit).toHaveBeenCalledWith('cards', mockCards);
    });
  });
});
