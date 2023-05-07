import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { Repository } from 'typeorm';
import { Player } from '../src/player/player.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Room } from '../src/room/room.entity';
import { Score } from '../src/score/score.entity';
import { Card } from '../src/card/card.entity';

export async function buildTestModule() {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();
  await app.init();

  const playerRepository = moduleFixture.get<Repository<Player>>(
    getRepositoryToken(Player),
  );
  const roomRepository = moduleFixture.get<Repository<Room>>(
    getRepositoryToken(Room),
  );
  const scoreRepository = moduleFixture.get<Repository<Score>>(
    getRepositoryToken(Score),
  );
  const cardRepository = moduleFixture.get<Repository<Card>>(
    getRepositoryToken(Card),
  );
  return {
    app,
    playerRepository,
    roomRepository,
    scoreRepository,
    cardRepository,
  };
}

export async function createRoomMock(
  roomRepository: Repository<Room>,
  roomName = 'Test Room',
) {
  return await roomRepository.save({
    name: roomName,
    actualRound: 1,
    players: [],
  });
}

export async function createPlayersMock(
  playerRepository: Repository<Player>,
  room: Room,
) {
  const player1 = await playerRepository.save({
    name: 'Player 1',
    room,
  });
  const player2 = await playerRepository.save({
    name: 'Player 2',
    room,
  });
  const player3 = await playerRepository.save({
    name: 'Player 3',
    room,
  });
  return { player1, player2, player3 };
}

export async function createCardMocks(
  cardRepository: Repository<Card>,
  player: Player,
  player2: Player,
) {
  return await cardRepository.save([
    {
      title: 'Card 1',
      answer: 'Answer 1',
      player: player,
    },
    {
      title: 'Card 2',
      answer: 'Answer 2',
      player: player2,
    },
  ]);
}
