import { Controller, Post, Body } from '@nestjs/common';
import { AddScoreDto, RoomDto } from './room.dto';
import { Room } from './room.entity';
import { RoomService } from './room.service';
import { CardService } from '../card/card.service';

@Controller('rooms')
export class RoomController {
  constructor(
    private readonly roomService: RoomService,
    private readonly cardService: CardService,
  ) {}
  @Post('/')
  async createRoom(@Body() roomDto: RoomDto): Promise<Room> {
    const { roomName } = roomDto;
    return await this.roomService.createRoom(roomName);
  }
  @Post('/newRound')
  async startNewRound(@Body() addScoreDto: AddScoreDto): Promise<void> {
    const { roomName, scores } = addScoreDto;
    await this.roomService.nextRound(roomName, scores);
    await this.cardService.deleteAllCards(roomName);
  }
  @Post('/newGame')
  async startNewGame(@Body() roomDto: RoomDto): Promise<void> {
    const { roomName } = roomDto;
    await this.cardService.deleteAllCards(roomName);
    await this.roomService.newGame(roomName);
  }
}
