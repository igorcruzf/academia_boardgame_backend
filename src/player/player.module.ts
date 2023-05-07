import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlayerController } from './player.controller';
import { PlayerService } from './player.service';
import { Player } from './player.entity';
import { RoomModule } from '../room/room.module';

@Module({
  imports: [TypeOrmModule.forFeature([Player]), RoomModule],
  providers: [PlayerService],
  controllers: [PlayerController],
  exports: [PlayerService, TypeOrmModule.forFeature([Player])],
})
export class PlayerModule {}
