import { Controller, Get, Post, Delete, Body } from "@nestjs/common";
import { CardService } from './card.service';
import { Card } from './card.entity';
import { CreateCardDto } from "./create-card.dto";

@Controller('cards')
export class CardController {
  constructor(private readonly cardService: CardService) {}

  @Get()
  async getAllCards(): Promise<Card[]> {
    return this.cardService.getAllCards();
  }

  @Post()
  async createCard(@Body() createCardDto: CreateCardDto): Promise<Card> {
    const { name, title, answer } = createCardDto;
    return this.cardService.createCard(name, title, answer);
  }

  @Delete()
  async deleteAllCards(): Promise<void> {
    await this.cardService.deleteAllCards();
  }
}
