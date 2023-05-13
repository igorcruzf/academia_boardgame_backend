import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Player } from './player.entity';
import { RoomService } from '../room/room.service';
import { PlayerNotFoundException } from './exception/player-not-found.exception';
import { Score } from '../score/score.entity';

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

  async createPlayer(roomName: string, name: string): Promise<Player> {
    this.logger.log(`Creating player in room ${roomName} with name ${name}`);
    const room = await this.roomService.findRoomByName(roomName);
    const player = new Player();
    player.room = room;
    player.name = name;
    return await this.playerRepository.save(player).then((newPlayer) => {
      this.logger.log(`Player created: ${JSON.stringify(newPlayer)}`);
      return newPlayer;
    });
  }

  async changeRoom(playerId: number, roomName: string): Promise<Player> {
    const player = await this.findPlayerById(playerId);
    player.room = await this.roomService.findRoomByName(roomName);
    return await this.playerRepository.save(player);
  }
  async getRankedPlayersByTotalScore(roomName: string): Promise<Player[]> {
    const players = await this.playerRepository.find({
      where: { room: { name: roomName } },
      relations: ['scores', 'room'],
    });

    await this.addPlayersMissingScores(players);

    const rankedPlayers = this.getTotalScoreByPlayer(players);

    return rankedPlayers
      .sort((first, second) => second.totalScore - first.totalScore)
      .map(({ player }) => player);
  }

  private addPlayersMissingScores(players: Player[]) {
    players.forEach(async (player) => {
      if (player.scores.length != player.room.actualRound - 1) {
        await this.addMissingScores(player);
      }
    });
  }

  private async addMissingScores(player: Player): Promise<void> {
    const existingScores = player.scores || [];
    const missingRounds = this.getMissingRounds(player, existingScores);
    const newScores = this.createNewScores(player, missingRounds);
    const allScores = this.mergeScores(existingScores, newScores);
    this.sortScoresByRound(allScores);

    player.scores = allScores;
  }
  private getMissingRounds(player: Player, existingScores: Score[]): number[] {
    const roundsWithScores = existingScores.map((score) => score.round);
    const maxRound = player.room.actualRound - 1;
    return this.range(1, maxRound).filter(
      (round) => !roundsWithScores.includes(round),
    );
  }

  private createNewScores(player: Player, rounds: number[]): Score[] {
    return rounds.map((round) => {
      const score = new Score();
      score.round = round;
      score.score = 0;
      score.player_id = player.id;
      return score;
    });
  }

  private mergeScores(existingScores: Score[], newScores: Score[]): Score[] {
    return [...existingScores, ...newScores];
  }

  private sortScoresByRound(scores: Score[]): void {
    scores.sort((a, b) => a.round - b.round);
  }

  private range(start: number, end: number): number[] {
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  private getTotalScoreByPlayer(players: Player[]) {
    return players.map((player) => {
      const totalScore = player.scores.reduce(
        (sum, score) => sum + score.score,
        0,
      );
      return { player, totalScore };
    });
  }
}
