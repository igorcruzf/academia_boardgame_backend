import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Player } from '../player/player.entity';

@Entity()
export class Score {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  round: number;

  @Column()
  score: number;

  @ManyToOne(() => Player, (player) => player.scores)
  @JoinColumn({ name: 'player_id' })
  player: Player;

  @Column()
  player_id: number;
}
