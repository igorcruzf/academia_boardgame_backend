import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from './room.entity';
import { RoomAlreadyExistsException } from './exception/room-already-exists.exception';
import { PlayerScore } from './room.dto';
import { ScoreService } from '../score/score.service';
import { RoomNotFoundException } from './exception/room-not-found.exception';

@Injectable()
export class RoomService {
  private readonly logger = new Logger(RoomService.name);
  constructor(
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
    private readonly scoreService: ScoreService,
  ) {}

  async createRoom(roomName: string): Promise<Room> {
    this.logger.log(`Creating room ${roomName}`);

    const targetRoom = await this.roomRepository.findOneBy({ name: roomName });
    if (targetRoom) {
      this.logger.error(`Room ${roomName} already exists`);
      throw new RoomAlreadyExistsException(roomName);
    }

    const newRoom = new Room();
    newRoom.name = roomName;
    newRoom.actualRound = 1;

    return this.roomRepository.save(newRoom);
  }
  async findRoomByName(room: string): Promise<Room> {
    const targetRoom = await this.roomRepository.findOne({
      where: { name: room },
      relations: ['players'],
    });
    if (!targetRoom) {
      throw new RoomNotFoundException(room);
    }
    return targetRoom;
  }

  async deleteAllScoresForRoom(roomName: string): Promise<void> {
    const room = await this.findRoomByName(roomName);
    const playerIds = room.players.map((player) => player.id);
    await this.scoreService.deleteAllScoresByPlayerIds(playerIds);
  }
  async newGame(roomName: string): Promise<void> {
    await this.deleteAllScoresForRoom(roomName);

    await this.roomRepository
      .createQueryBuilder()
      .update(Room)
      .set({ actualRound: 1 })
      .where('name = :room', { room: roomName })
      .execute();
  }
  async nextRound(
    roomName: string,
    playerScores: PlayerScore[],
  ): Promise<void> {
    const room = await this.roomRepository.findOne({
      where: { name: roomName },
    });

    if (!room) {
      throw new RoomNotFoundException(roomName);
    }

    await this.scoreService.createScoresInRound(playerScores, room);

    room.actualRound += 1;
    await this.roomRepository.update(room.name, room);
  }
}
