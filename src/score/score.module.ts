import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Score } from './score.entity';
import { ScoreService } from './score.service';

@Module({
  imports: [TypeOrmModule.forFeature([Score])],
  providers: [ScoreService],
  exports: [ScoreService, TypeOrmModule.forFeature([Score])],
})
export class ScoreModule {}
