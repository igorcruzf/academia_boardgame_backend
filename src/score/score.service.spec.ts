import { Repository } from 'typeorm';
import { Test } from '@nestjs/testing';
import { ScoreService } from './score.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Room } from '../room/room.entity';
import { Score } from './score.entity';
import { PlayerScore } from '../room/room.dto';

describe('ScoreService', () => {
  let scoreService: ScoreService;
  let scoreRepository: Repository<Score>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        ScoreService,
        {
          provide: getRepositoryToken(Score),
          useClass: Repository,
        },
      ],
    }).compile();

    scoreService = moduleRef.get<ScoreService>(ScoreService);
    scoreRepository = moduleRef.get<Repository<Score>>(
      getRepositoryToken(Score),
    );
  });

  describe('createScoresInRound', () => {
    it('should create scores in a round', async () => {
      const playerScores: PlayerScore[] = [
        { score: 1, playerId: 1 },
        { score: 2, playerId: 2 },
      ];

      const mockRoom = new Room();
      mockRoom.actualRound = 2;

      const score1 = new Score();
      score1.round = mockRoom.actualRound;
      score1.score = playerScores[0].score;
      score1.player_id = playerScores[0].playerId;

      const score2 = new Score();
      score2.round = mockRoom.actualRound;
      score2.score = playerScores[1].score;
      score2.player_id = playerScores[1].playerId;

      const scores = [score1, score2];

      jest.spyOn(scoreRepository, 'save').mockResolvedValue(scores as any);

      const result = await scoreService.createScoresInRound(
        playerScores,
        mockRoom,
      );

      expect(scoreRepository.save).toHaveBeenCalled();
      expect(result).toEqual(scores);
    });
  });

  describe('deleteAllScoresByPlayerIds', () => {
    it('should delete all scores by player ids', async () => {
      const playerIds = [1, 2, 3];
      const createQueryBuilder: any = {
        delete: () => createQueryBuilder,
        from: () => createQueryBuilder,
        where: () => createQueryBuilder,
        execute: () => null,
      };

      jest
        .spyOn(scoreRepository, 'createQueryBuilder')
        .mockImplementation(() => createQueryBuilder);

      await scoreService.deleteAllScoresByPlayerIds(playerIds);

      expect(scoreRepository.createQueryBuilder).toHaveBeenCalled();
    });
  });
});
