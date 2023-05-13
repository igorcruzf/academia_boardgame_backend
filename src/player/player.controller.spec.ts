import { Test } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Room } from '../room/room.entity';
import { PlayerService } from './player.service';
import { RoomService } from '../room/room.service';
import { ScoreService } from '../score/score.service';
import { Player } from './player.entity';
import { Score } from '../score/score.entity';
import { CardService } from '../card/card.service';
import { CardGateway } from '../card/card.gateway';
import { Card } from '../card/card.entity';
import { CreatePlayerDto } from './create-player.dto';
import { PlayerController } from './player.controller';

describe('PlayerController', () => {
  let playerController: PlayerController;
  let playerService: PlayerService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [PlayerController],
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

    playerController = moduleRef.get<PlayerController>(PlayerController);
    playerService = moduleRef.get<PlayerService>(PlayerService);
  });

  describe('createPlayer', () => {
    it('should create a new player', async () => {
      const mockCreatePlayerDto: CreatePlayerDto = {
        name: 'Test Player',
        roomName: 'Test Room',
      };

      const mockPlayer = new Player();
      mockPlayer.name = mockCreatePlayerDto.name;

      jest.spyOn(playerService, 'createPlayer').mockResolvedValue(mockPlayer);

      const result = await playerController.createPlayer(mockCreatePlayerDto);

      expect(playerService.createPlayer).toHaveBeenCalledWith(
        mockCreatePlayerDto.roomName,
        mockCreatePlayerDto.name,
      );
      expect(result).toBe(mockPlayer);
    });
  });

  describe('getPlayers', () => {
    it('should get players', async () => {
      const mockPlayer = new Player();
      mockPlayer.name = 'Test';

      const roomName = 'Room';

      const mockPlayers = [mockPlayer, mockPlayer, mockPlayer];

      jest
        .spyOn(playerService, 'getRankedPlayersByTotalScore')
        .mockResolvedValue(mockPlayers);

      const result = await playerController.getPlayers(roomName);

      expect(playerService.getRankedPlayersByTotalScore).toHaveBeenCalledWith(
        roomName,
      );
      expect(result).toEqual(mockPlayers);
    });
  });
  describe('changeRoom', () => {
    it('should return player when changing room', async () => {
      const playerId = 1;
      const mockPlayer = new Player();
      mockPlayer.name = 'Test';
      mockPlayer.id = playerId;

      const roomName = 'Room';

      jest.spyOn(playerService, 'changeRoom').mockResolvedValue(mockPlayer);

      const result = await playerController.changeRoom(playerId, roomName);

      expect(playerService.changeRoom).toHaveBeenCalledWith(playerId, roomName);
      expect(result).toEqual(mockPlayer);
    });
  });
});
