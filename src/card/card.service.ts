import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Card } from './card.entity';
import { CardGateway } from './card.gateway';
import { Player } from '../player/player.entity';
import { PlayerService } from '../player/player.service';
import { CreateCardDto } from './create-card.dto';

@Injectable()
export class CardService {
  private readonly logger = new Logger(CardService.name);
  constructor(
    @InjectRepository(Card)
    private readonly cardRepository: Repository<Card>,
    private readonly cardGateway: CardGateway,
    private readonly playerService: PlayerService,
  ) {}
  async createCard(createCardDto: CreateCardDto): Promise<Card> {
    this.logger.log(
      `Creating card with playerId: ${createCardDto.playerId}, 
      title: ${createCardDto.title}, 
      answer: ${createCardDto.answer}, 
      isRightAnswer: ${createCardDto.isRightAnswer}`,
    );

    const player = await this.playerService.findPlayerById(
      createCardDto.playerId,
    );
    const card = this.buildCard(createCardDto, player);

    return this.cardRepository.save(card).then(async (savedCard) => {
      this.logger.log(`Card created with ID: ${savedCard.id}`);
      await this.emitAllCards(player.room.name);
      return savedCard;
    });
  }

  private buildCard(createCardDto: CreateCardDto, player: Player) {
    const card = new Card();
    card.title = createCardDto.title;
    card.answer = createCardDto.answer;
    card.player = player;
    card.isRightAnswer = createCardDto.isRightAnswer;
    return card;
  }
  async getAllCardsByRoom(roomName: string): Promise<Card[]> {
    this.logger.log(`Getting all cards of room ${roomName}`);
    return this.cardRepository.find({
      where: { player: { room: { name: roomName } } },
      relations: ['player'],
    });
  }
  async emitAllCards(room: string): Promise<void> {
    const cards = await this.getAllCardsByRoom(room);
    this.logger.log(
      `Emitting total of ${cards.length} cards to event 'cardsOf${room}'`,
    );
    this.cardGateway.server.emit(`cardsOf${room}`, cards);
    this.logger.log(`Emitted successfully'`);
  }

  public async deleteAllCards(roomName: string): Promise<void> {
    this.logger.log(`Deleting all cards from room ${roomName}`);

    const cards = await this.getAllCardsByRoom(roomName);
    await this.cardRepository.remove(cards);
    this.logger.log(`Total of ${cards.length} cards deleted`);
  }
}
