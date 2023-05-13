import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from 'typeorm';
import { Player } from '../player/player.entity';

@Entity()
export class Card {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  answer: string;

  @OneToOne(() => Player, (player) => player.card, { onDelete: 'SET NULL' })
  player: Player;
  @Column('boolean', { default: false })
  isRightAnswer?: boolean = false;
}
