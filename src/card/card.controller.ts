import { Controller, Get, Post, Delete, Body, Query } from '@nestjs/common';
import { CardService } from './card.service';
import { Card } from './card.entity';
import { CreateCardDto } from './create-card.dto';

@Controller('cards')
export class CardController {
  constructor(private readonly cardService: CardService) {}

  @Get('/')
  async getAllCards(@Query('roomName') roomName: string): Promise<Card[]> {
    return await this.cardService.getAllCardsByRoom(roomName);
  }
  @Post('/')
  async createCard(@Body() createCardDto: CreateCardDto): Promise<Card> {
    return await this.cardService.createCard(createCardDto);
  }
  @Delete('/')
  async deleteAllCards(@Query('roomName') roomName: string): Promise<void> {
    await this.cardService.deleteAllCards(roomName);
  }
}
