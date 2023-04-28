import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseModule } from './card/database.module';
import { Card } from './card/card.entity';
import { CardService } from './card/card.service';
import { CardController } from './card/card.controller';
import { CardGateway } from './card/card.gateway';

@Module({
  imports: [DatabaseModule, TypeOrmModule.forFeature([Card])],
  controllers: [CardController],
  providers: [CardService, CardGateway],
})
export class AppModule {}
