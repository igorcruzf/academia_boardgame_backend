import { CardService } from '../card/card.service';
import { Repository } from 'typeorm';
import { Card } from '../card/card.entity';
import { Test } from '@nestjs/testing';
import { CardGateway } from '../card/card.gateway';
import { RoomService } from './room.service';
import { ScoreService } from '../score/score.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Room } from './room.entity';
import { Score } from '../score/score.entity';
import { PlayerService } from '../player/player.service';
import { Player } from '../player/player.entity';
import { RoomAlreadyExistsException } from './exception/room-already-exists.exception';
import { RoomNotFoundException } from './exception/room-not-found.exception';

describe('RoomService', () => {
  let roomService: RoomService;
  let scoreService: ScoreService;
  let roomRepository: Repository<Room>;

  beforeEach(async () => {
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
      ],
    }).compile();

    roomService = moduleRef.get<RoomService>(RoomService);
    scoreService = moduleRef.get<ScoreService>(ScoreService);
    roomRepository = moduleRef.get<Repository<Room>>(getRepositoryToken(Room));
  });

  describe('createRoom', () => {
    it('should create a room', async () => {
      const roomName = 'Test Room';

      const mockRoom = new Room();
      mockRoom.name = roomName;
      mockRoom.actualRound = 1;

      jest.spyOn(roomRepository, 'findOneBy').mockResolvedValue(null);
      jest.spyOn(roomRepository, 'save').mockResolvedValue(mockRoom);

      const result = await roomService.createRoom(roomName);

      expect(roomRepository.findOneBy).toHaveBeenCalledWith({ name: roomName });
      expect(roomRepository.save).toHaveBeenCalledWith(mockRoom);
      expect(result).toBe(mockRoom);
    });
    it('should not create a room if it already exists', async () => {
      const roomName = 'Test Room';

      const mockRoom = new Room();
      mockRoom.name = roomName;
      mockRoom.actualRound = 1;

      jest.spyOn(roomRepository, 'findOneBy').mockResolvedValue(mockRoom);
      await expect(roomService.createRoom(roomName)).rejects.toThrow(
        new RoomAlreadyExistsException(roomName),
      );
    });
  });
  describe('findRoomByName', () => {
    it('should find a room', async () => {
      const roomName = 'Test Room';

      const mockRoom = new Room();
      mockRoom.name = roomName;
      mockRoom.actualRound = 1;

      jest.spyOn(roomRepository, 'findOne').mockResolvedValue(mockRoom);

      const result = await roomService.findRoomByName(roomName);

      expect(roomRepository.findOne).toHaveBeenCalled();
      expect(result).toBe(mockRoom);
    });
    it('should not find a room if it does not exists', async () => {
      const roomName = 'Test Room';

      jest.spyOn(roomRepository, 'findOne').mockResolvedValue(null);

      await expect(roomService.findRoomByName(roomName)).rejects.toThrow(
        new RoomNotFoundException(roomName),
      );
    });
  });
  describe('deleteAllScoresForRoom', () => {
    it('should delete all scores for room', async () => {
      const roomName = 'Test Room';

      const player = new Player();
      player.id = 1;

      const player2 = new Player();
      player.id = 2;

      const player3 = new Player();
      player.id = 3;

      const mockRoom = new Room();
      mockRoom.name = roomName;
      mockRoom.actualRound = 1;
      mockRoom.players = [player, player2, player3];

      jest.spyOn(roomService, 'findRoomByName').mockResolvedValue(mockRoom);
      jest
        .spyOn(scoreService, 'deleteAllScoresByPlayerIds')
        .mockResolvedValue(null);

      await roomService.deleteAllScoresForRoom(roomName);

      expect(roomService.findRoomByName).toHaveBeenCalledWith(roomName);
      expect(scoreService.deleteAllScoresByPlayerIds).toHaveBeenCalledWith([
        player.id,
        player2.id,
        player3.id,
      ]);
    });

    it('should not delete scores for a room if the room does not exists', async () => {
      const roomName = 'Test Room';

      jest
        .spyOn(roomService, 'findRoomByName')
        .mockRejectedValue(new RoomNotFoundException(roomName));

      await expect(
        roomService.deleteAllScoresForRoom(roomName),
      ).rejects.toThrow(new RoomNotFoundException(roomName));
    });
  });
  describe('newGame', () => {
    it('should create a new game', async () => {
      const roomName = 'Test Room';

      jest.spyOn(roomService, 'deleteAllScoresForRoom').mockResolvedValue(null);

      const createQueryBuilder: any = {
        update: () => createQueryBuilder,
        set: () => createQueryBuilder,
        where: () => createQueryBuilder,
        execute: () => null,
      };

      jest
        .spyOn(roomRepository, 'createQueryBuilder')
        .mockImplementation(() => createQueryBuilder);

      await roomService.newGame(roomName);
      expect(roomService.deleteAllScoresForRoom).toHaveBeenCalledWith(roomName);
    });

    it('should not create new game for a room if the room does not exists', async () => {
      const roomName = 'Test Room';

      jest
        .spyOn(roomService, 'deleteAllScoresForRoom')
        .mockRejectedValue(new RoomNotFoundException(roomName));

      await expect(roomService.newGame(roomName)).rejects.toThrow(
        new RoomNotFoundException(roomName),
      );
    });
  });
  describe('nextRound', () => {
    it('should go to next round', async () => {
      const roomName = 'Test Room';

      const mockRoom = new Room();
      mockRoom.name = roomName;
      mockRoom.actualRound = 1;

      jest.spyOn(roomRepository, 'findOne').mockResolvedValue(mockRoom);
      jest.spyOn(scoreService, 'createScoresInRound').mockResolvedValue(null);
      jest.spyOn(roomRepository, 'update').mockResolvedValue(null);

      const updatedRoom = new Room();
      updatedRoom.name = mockRoom.name;
      updatedRoom.actualRound = mockRoom.actualRound + 1;

      await roomService.nextRound(roomName, []);
      expect(roomRepository.findOne).toHaveBeenCalled();
      expect(scoreService.createScoresInRound).toHaveBeenCalledWith(
        [],
        mockRoom,
      );
      expect(roomRepository.update).toHaveBeenCalledWith(roomName, updatedRoom);
    });

    it('should not go to next round for a room if the room does not exists', async () => {
      const roomName = 'Test Room';

      jest.spyOn(roomRepository, 'findOne').mockResolvedValue(null);

      await expect(roomService.nextRound(roomName, [])).rejects.toThrow(
        new RoomNotFoundException(roomName),
      );
    });
  });
});
