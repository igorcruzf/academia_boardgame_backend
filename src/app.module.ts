import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseModule } from './database.module';
import { Score } from './score/score.entity';
import { CardModule } from './card/card.module';
import { PlayerModule } from './player/player.module';
import { RoomModule } from './room/room.module';
import { ScoreModule } from './score/score.module';
import { APP_FILTER } from '@nestjs/core';
import { AppFilter } from './app.filter';

@Module({
  imports: [
    DatabaseModule,
    TypeOrmModule.forFeature([Score]),
    CardModule,
    PlayerModule,
    RoomModule,
    ScoreModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AppFilter,
    },
  ],
})
export class AppModule {}
