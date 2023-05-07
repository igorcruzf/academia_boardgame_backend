import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Card } from './card.entity';
import { CardService } from './card.service';
import { CardController } from './card.controller';
import { CardGateway } from './card.gateway';
import { PlayerModule } from '../player/player.module';
import { RoomModule } from '../room/room.module';

@Module({
  imports: [TypeOrmModule.forFeature([Card]), PlayerModule, RoomModule],
  providers: [CardService, CardGateway],
  controllers: [CardController],
  exports: [CardService, TypeOrmModule.forFeature([Card]), CardGateway],
})
export class CardModule {}
