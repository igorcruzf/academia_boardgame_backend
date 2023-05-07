import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { Player } from '../player/player.entity';

@Entity()
export class Room {
  @PrimaryColumn()
  name: string;

  @Column()
  actualRound: number;

  @OneToMany(() => Player, (player) => player.room)
  players: Player[];
}
