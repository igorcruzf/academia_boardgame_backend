import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Card } from './card/card.entity';
import { Room } from './room/room.entity';
import { Player } from './player/player.entity';
import { Score } from './score/score.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: ':memory:',
      entities: [Card, Room, Player, Score],
      synchronize: true,
    }),
  ],
})
export class DatabaseModule {}
