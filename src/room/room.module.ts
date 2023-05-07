import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomService } from './room.service';
import { Room } from './room.entity';
import { RoomController } from './room.controller';
import { CardModule } from '../card/card.module';
import { PlayerModule } from '../player/player.module';
import { Score } from '../score/score.entity';
import { ScoreModule } from '../score/score.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Room]),
    TypeOrmModule.forFeature([Score]),
    forwardRef(() => CardModule),
    forwardRef(() => PlayerModule),
    ScoreModule,
  ],
  providers: [RoomService],
  controllers: [RoomController],
  exports: [RoomService, TypeOrmModule.forFeature([Room])],
})
export class RoomModule {}
