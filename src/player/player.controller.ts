import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Player } from './player.entity';
import { CreatePlayerDto } from './create-player.dto';
import { PlayerService } from './player.service';

@Controller('players')
export class PlayerController {
  constructor(private readonly playerService: PlayerService) {}
  @Get('/')
  async getPlayers(@Query('roomName') roomName: string): Promise<Player[]> {
    return await this.playerService.getRankedPlayersByTotalScore(roomName);
  }
  @Post('/')
  async createPlayer(
    @Body() createPlayerDto: CreatePlayerDto,
  ): Promise<Player> {
    const { roomName, name } = createPlayerDto;
    return await this.playerService.createPlayer(roomName, name);
  }

  @Patch(':id')
  async changeRoom(
    @Param('id') playerId: number,
    @Body('roomName') roomName: string,
  ): Promise<Player> {
    return await this.playerService.changeRoom(playerId, roomName);
  }
}
