import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Player } from './player.entity';
import { RoomService } from '../room/room.service';
import { PlayerNotFoundException } from './exception/player-not-found.exception';

@Injectable()
export class PlayerService {
  private readonly logger = new Logger(PlayerService.name);
  constructor(
    @InjectRepository(Player)
    private readonly playerRepository: Repository<Player>,
    private readonly roomService: RoomService,
  ) {}

  async findPlayerById(playerId: number) {
    this.logger.log(`Finding player with id ${playerId}`);
    const player = await this.playerRepository.findOne({
      where: { id: playerId },
      relations: ['room'],
    });

    if (!player) {
      throw new PlayerNotFoundException(playerId);
    }
    this.logger.log(`Player found: ${JSON.stringify(player)}`);

    return player;
  }
  async getRankedPlayersByTotalScore(roomName: string): Promise<Player[]> {
    const players = await this.playerRepository.find({
      where: { room: { name: roomName } },
      relations: ['scores'],
    });

    const rankedPlayers = players.map((player) => {
      const totalScore = player.scores.reduce(
        (sum, score) => sum + score.score,
        0,
      );
      return { player, totalScore };
    });

    return rankedPlayers
      .sort((first, second) => second.totalScore - first.totalScore)
      .map(({ player }) => player);
  }
  async createPlayer(roomName: string, name: string): Promise<Player> {
    const room = await this.roomService.findRoomByName(roomName);
    const player = new Player();
    player.room = room;
    player.name = name;
    return await this.playerRepository.save(player);
  }

  async changeRoom(playerId: number, roomName: string): Promise<Player> {
    const player = await this.findPlayerById(playerId);
    player.room = await this.roomService.findRoomByName(roomName);
    return await this.playerRepository.save(player);
  }
}
