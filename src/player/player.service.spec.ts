import { CardService } from '../card/card.service';
import { PlayerService } from './player.service';
import { Repository } from 'typeorm';
import { Card } from '../card/card.entity';
import { Test } from '@nestjs/testing';
import { CardGateway } from '../card/card.gateway';
import { RoomService } from '../room/room.service';
import { ScoreService } from '../score/score.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Player } from './player.entity';
import { Room } from '../room/room.entity';
import { Score } from '../score/score.entity';
import { RoomNotFoundException } from '../room/exception/room-not-found.exception';
import { PlayerNotFoundException } from './exception/player-not-found.exception';

describe('PlayerService', () => {
  let roomService: RoomService;
  let playerService: PlayerService;
  let playerRepository: Repository<Player>;

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
    playerService = moduleRef.get<PlayerService>(PlayerService);
    playerRepository = moduleRef.get<Repository<Player>>(
      getRepositoryToken(Player),
    );
  });

  describe('createPlayer', () => {
    it('should create a player', async () => {
      const playerName = 'Teste';
      const roomName = 'Test Room';

      const mockRoom = new Room();
      mockRoom.name = roomName;

      const mockPlayer = new Player();
      mockPlayer.name = playerName;
      mockPlayer.room = mockRoom;

      jest.spyOn(roomService, 'findRoomByName').mockResolvedValue(mockRoom);
      jest.spyOn(playerRepository, 'save').mockResolvedValue(mockPlayer);

      const result = await playerService.createPlayer(roomName, playerName);

      expect(roomService.findRoomByName).toHaveBeenCalledWith(roomName);
      expect(playerRepository.save).toHaveBeenCalledWith(mockPlayer);
      expect(result).toBe(mockPlayer);
    });

    it('should throw error if room does not exists', async () => {
      const playerName = 'Teste';
      const roomName = 'Test Room';

      const mockRoom = new Room();
      mockRoom.name = roomName;

      const mockPlayer = new Player();
      mockPlayer.name = playerName;
      mockPlayer.room = mockRoom;

      jest
        .spyOn(roomService, 'findRoomByName')
        .mockRejectedValue(new RoomNotFoundException(roomName));

      await expect(
        playerService.createPlayer(roomName, playerName),
      ).rejects.toThrow(new RoomNotFoundException(roomName));
    });
  });

  describe('getRankedPlayersByTotalScore', () => {
    it('should get players ranked by total score', async () => {
      function buildMockPlayer(
        playerId: number,
        scoreValue: number,
        roomName: string,
      ): Player {
        const player = new Player();
        player.id = playerId;
        const score = new Score();
        score.score = scoreValue;
        score.round = 1;
        score.player_id = player.id;
        player.scores = [score, score, score];
        const room = new Room();
        room.name = roomName;
        room.actualRound = 1;
        player.room = room;
        return player;
      }

      const roomName = 'Test Room';
      const mockPlayer1 = buildMockPlayer(1, 1, roomName);
      const mockPlayer2 = buildMockPlayer(2, 10, roomName);
      const mockPlayer3 = buildMockPlayer(3, 5, roomName);

      jest
        .spyOn(playerRepository, 'find')
        .mockResolvedValue([mockPlayer1, mockPlayer2, mockPlayer3]);

      const result = await playerService.getRankedPlayersByTotalScore(roomName);

      expect(playerRepository.find).toHaveBeenCalled();
      expect(result).toEqual([mockPlayer2, mockPlayer3, mockPlayer1]);
    });
  });

  describe('findPlayerById', () => {
    it('should find player', async () => {
      const playerId = 1;
      const roomName = 'Test Room';

      const mockRoom = new Room();
      mockRoom.name = roomName;

      const mockPlayer = new Player();
      mockPlayer.id = playerId;
      mockPlayer.name = 'Test';
      mockPlayer.room = mockRoom;

      jest.spyOn(playerRepository, 'findOne').mockResolvedValue(mockPlayer);

      const result = await playerService.findPlayerById(mockPlayer.id);

      expect(playerRepository.findOne).toHaveBeenCalled();
      expect(result).toBe(mockPlayer);
    });

    it('should throw error if player does not exists', async () => {
      const playerId = 1;

      jest.spyOn(playerRepository, 'findOne').mockResolvedValue(null);

      await expect(playerService.findPlayerById(playerId)).rejects.toThrow(
        new PlayerNotFoundException(playerId),
      );
    });
  });

  describe('changeRoom', () => {
    it('should change player room', async () => {
      const playerId = 1;
      const roomName = 'Test Room';

      const mockRoom = new Room();
      mockRoom.name = roomName;

      const mockPlayer = new Player();
      mockPlayer.id = playerId;
      mockPlayer.name = 'Test';
      mockPlayer.room = mockRoom;

      const newRoomName = 'Test Room 2';
      const newMockRoom = new Room();
      newMockRoom.name = newRoomName;

      const mockPlayerWithNewRoom = new Player();
      mockPlayerWithNewRoom.id = playerId;
      mockPlayerWithNewRoom.name = 'Test';
      mockPlayerWithNewRoom.room = newMockRoom;

      jest.spyOn(playerService, 'findPlayerById').mockResolvedValue(mockPlayer);
      jest.spyOn(roomService, 'findRoomByName').mockResolvedValue(newMockRoom);
      jest
        .spyOn(playerRepository, 'save')
        .mockResolvedValue(mockPlayerWithNewRoom);

      const result = await playerService.changeRoom(mockPlayer.id, newRoomName);

      expect(roomService.findRoomByName).toHaveBeenCalledWith(newMockRoom.name);
      expect(playerRepository.save).toHaveBeenCalledWith(mockPlayer);
      expect(result).toBe(mockPlayerWithNewRoom);
    });

    it('should throw error if player does not exists', async () => {
      const playerId = 1;

      jest
        .spyOn(playerService, 'findPlayerById')
        .mockRejectedValue(new PlayerNotFoundException(playerId));

      await expect(playerService.changeRoom(playerId, 'room')).rejects.toThrow(
        new PlayerNotFoundException(playerId),
      );
    });

    it('should throw error if room does not exists', async () => {
      const roomName = 'Test';

      jest
        .spyOn(playerService, 'findPlayerById')
        .mockResolvedValue(new Player());

      jest
        .spyOn(roomService, 'findRoomByName')
        .mockRejectedValue(new RoomNotFoundException(roomName));

      await expect(playerService.changeRoom(1, roomName)).rejects.toThrow(
        new RoomNotFoundException(roomName),
      );
    });
  });
});
