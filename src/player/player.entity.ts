import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { Room } from '../room/room.entity';
import { Score } from '../score/score.entity';
import { Card } from '../card/card.entity';

@Entity()
export class Player {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToOne(() => Room, (room) => room.players, {
    onUpdate: 'CASCADE',
  })
  room: Room;

  @OneToOne(() => Card, (card) => card.player, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn()
  card: Card;

  @OneToMany(() => Score, (score) => score.player)
  scores: Score[];
}
