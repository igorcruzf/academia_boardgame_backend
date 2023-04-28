import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Card } from './card.entity';
import { CardGateway } from './card.gateway';

@Injectable()
export class CardService {
  private readonly logger = new Logger(CardService.name);
  constructor(
    @InjectRepository(Card)
    private readonly cardRepository: Repository<Card>,
    private readonly cardGateway: CardGateway,
  ) {}

  async createCard(name: string, title: string, answer: string): Promise<Card> {
    this.logger.log(
      `Creating card with name: ${name}, title: ${title}, answer: ${answer}`,
    );
    const card = new Card();
    card.name = name;
    card.title = title;
    card.answer = answer;

    return this.cardRepository.save(card).then(async (savedCard) => {
      this.logger.log(`Card created with ID: ${savedCard.id}`);
      await this.emitAllCards();
      return savedCard;
    });
  }

  async getAllCards(): Promise<Card[]> {
    this.logger.log('Getting all cards');
    return this.cardRepository.find();
  }

  async emitAllCards(): Promise<void> {
    const cards = await this.getAllCards();
    this.logger.log(`Emitting total of ${cards.length} cards to event 'cards'`);
    this.cardGateway.server.emit('cards', cards);
    this.logger.log(`Emitted successfully'`);
  }

  async deleteAllCards(): Promise<void> {
    this.logger.log('Deleting all cards');
    const deleteResult = await this.cardRepository.delete({});
    this.logger.log(`Total of ${deleteResult.affected} cards deleted`);
  }
}
