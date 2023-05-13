import { PlayerScore } from '../room/room.dto';
import { Room } from '../room/room.entity';
import { Score } from './score.entity';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class ScoreService {
  private readonly logger = new Logger(ScoreService.name);

  constructor(
    @InjectRepository(Score)
    private readonly scoreRepository: Repository<Score>,
  ) {}
  public async deleteAllScoresByPlayerIds(playerIds: number[]) {
    await this.scoreRepository
      .createQueryBuilder()
      .delete()
      .from(Score)
      .where('player_id IN (:...playerIds)', { playerIds })
      .execute();
  }

  public async createScoresInRound(
    playerScores: PlayerScore[],
    room: Room,
  ): Promise<Score[]> {
    const scores = playerScores.map((playerScore) => {
      const score = new Score();
      score.round = room.actualRound;
      score.player_id = playerScore.playerId;
      score.score = playerScore.score;
      return score;
    });

    return await this.scoreRepository.save(scores);
  }
}
