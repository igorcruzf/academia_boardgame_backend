import { Test } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Room } from './room.entity';
import { RoomService } from './room.service';
import { ScoreService } from '../score/score.service';
import { Score } from '../score/score.entity';
import { CardService } from '../card/card.service';
import { CardGateway } from '../card/card.gateway';
import { Card } from '../card/card.entity';
import { RoomController } from './room.controller';
import { PlayerService } from '../player/player.service';
import { Player } from '../player/player.entity';
import { AddScoreDto, PlayerScore, RoomDto } from './room.dto';

describe('RoomController', () => {
  let roomController: RoomController;
  let roomService: RoomService;
  let cardService: CardService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [RoomController],
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

    roomController = moduleRef.get<RoomController>(RoomController);
    roomService = moduleRef.get<RoomService>(RoomService);
    cardService = moduleRef.get<CardService>(CardService);
  });

  describe('createRoom', () => {
    it('should create a new room', async () => {
      const mockCreateRoomDto: RoomDto = {
        roomName: 'Test Room',
      };

      const mockRoom = new Room();
      mockRoom.name = mockCreateRoomDto.roomName;

      jest.spyOn(roomService, 'createRoom').mockResolvedValue(mockRoom);

      const result = await roomController.createRoom(mockCreateRoomDto);

      expect(roomService.createRoom).toHaveBeenCalledWith(
        mockCreateRoomDto.roomName,
      );
      expect(result).toBe(mockRoom);
    });
  });

  describe('startNewRound', () => {
    it('should start a new round', async () => {
      const roomName = 'Room';

      const scores: PlayerScore[] = [
        { score: 1, playerId: 1 },
        { score: 0, playerId: 3 },
        { score: 1000, playerId: 2 },
      ];

      const mockAddScoreDTO: AddScoreDto = {
        roomName,
        scores,
      };

      jest.spyOn(roomService, 'nextRound').mockResolvedValue();
      jest.spyOn(cardService, 'deleteAllCards').mockResolvedValue();

      await roomController.startNewRound(mockAddScoreDTO);

      expect(roomService.nextRound).toHaveBeenCalledWith(roomName, scores);
      expect(cardService.deleteAllCards).toHaveBeenCalledWith(roomName);
    });
  });
  describe('startNewGame', () => {
    it('should start new game', async () => {
      const roomName = 'Room';

      const mockRoomDTO: RoomDto = {
        roomName: roomName,
      };

      jest.spyOn(roomService, 'newGame').mockResolvedValue();
      jest.spyOn(cardService, 'deleteAllCards').mockResolvedValue();

      await roomController.startNewGame(mockRoomDTO);

      expect(roomService.newGame).toHaveBeenCalledWith(roomName);
      expect(cardService.deleteAllCards).toHaveBeenCalledWith(roomName);
    });
  });
});
