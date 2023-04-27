import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseModule } from './card/database.module';
import { Card } from './card/card.entity';
import { CardService } from './card/card.service';
import { CardController } from './card/card.controller';

@Module({
  imports: [
    DatabaseModule,
    TypeOrmModule.forFeature([Card]),
  ],
  controllers: [CardController],
  providers: [CardService],
})
export class AppModule {}
