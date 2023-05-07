import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Card } from './card.entity';
import { CardGateway } from './card.gateway';
import { CardService } from './card.service';
import { Server } from 'socket.io';
import { Room } from '../room/room.entity';
import { Player } from '../player/player.entity';
import { PlayerService } from '../player/player.service';
import { RoomService } from '../room/room.service';
import { ScoreService } from '../score/score.service';
import { Score } from '../score/score.entity';
import { PlayerNotFoundException } from '../player/exception/player-not-found.exception';

describe('CardService', () => {
  let cardService: CardService;
  let playerService: PlayerService;
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
        {
          provide: CardGateway,
          useValue: {
            server: mockServer,
          },
        },
      ],
    }).compile();

    cardService = moduleRef.get<CardService>(CardService);
    playerService = moduleRef.get<PlayerService>(PlayerService);
    cardRepository = moduleRef.get<Repository<Card>>(getRepositoryToken(Card));
  });

  describe('createCard', () => {
    it('should create a new card', async () => {
      const mockRoom = new Room();
      mockRoom.name = 'Test Room';

      const playerId = 1;

      const mockPlayer = new Player();
      mockPlayer.room = mockRoom;
      mockPlayer.name = 'Test Name';
      mockPlayer.id = playerId;

      const mockCard = new Card();
      mockCard.title = 'Test Title';
      mockCard.answer = 'Test Answer';
      mockCard.player = mockPlayer;

      jest.spyOn(playerService, 'findPlayerById').mockResolvedValue(mockPlayer);
      jest.spyOn(cardService, 'emitAllCards').mockResolvedValue();
      jest.spyOn(cardRepository, 'save').mockResolvedValue(mockCard);

      const result = await cardService.createCard(
        playerId,
        mockCard.title,
        mockCard.answer,
      );

      expect(cardRepository.save).toHaveBeenCalledWith(mockCard);
      expect(cardService.emitAllCards).toHaveBeenCalled();
      expect(result).toBe(mockCard);
    });

    it('should throw error if player not found', async () => {
      const playerId = 1;
      jest
        .spyOn(playerService, 'findPlayerById')
        .mockRejectedValue(new PlayerNotFoundException(playerId));

      await expect(
        cardService.createCard(playerId, 'title', 'answer'),
      ).rejects.toThrow(new PlayerNotFoundException(playerId));
    });
  });

  describe('getAllCardsByRoom', () => {
    it('should return an array of cards', async () => {
      const mockRoom = new Room();
      mockRoom.name = 'Test room';

      const mockCards = [new Card(), new Card()];

      jest.spyOn(cardRepository, 'find').mockResolvedValue(mockCards);

      const result = await cardService.getAllCardsByRoom(mockRoom.name);

      expect(cardRepository.find).toHaveBeenCalled();
      expect(result).toBe(mockCards);
    });
  });
  describe('deleteAllCards', () => {
    it('should delete all cards', async () => {
      const cards = [new Card(), new Card()];
      jest.spyOn(cardService, 'getAllCardsByRoom').mockResolvedValue(cards);
      const removeSpy = jest
        .spyOn(cardRepository, 'remove')
        .mockResolvedValue(cards[0]);
      await cardService.deleteAllCards('room');

      expect(removeSpy).toHaveBeenCalledWith(cards);
    });
  });
  describe('emitCards', () => {
    it('should emit all cards', async () => {
      const mockCards = [new Card(), new Card()];
      const roomName = 'Test Room';
      jest.spyOn(cardService, 'getAllCardsByRoom').mockResolvedValue(mockCards);

      await cardService.emitAllCards(roomName);
      expect(cardService.getAllCardsByRoom).toHaveBeenCalled();
      expect(mockServer.emit).toHaveBeenCalledWith(
        `cardsOf${roomName}`,
        mockCards,
      );
    });
  });
});
