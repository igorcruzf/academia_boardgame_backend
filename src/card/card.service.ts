import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Card } from './card.entity';

@Injectable()
export class CardService {
  constructor(
    @InjectRepository(Card)
    private readonly cardRepository: Repository<Card>,
  ) {}

  async createCard(name: string, title: string, answer: string): Promise<Card> {
    const card = new Card();
    card.name = name;
    card.title = title;
    card.answer = answer;
    return this.cardRepository.save(card);
  }

  async getAllCards(): Promise<Card[]> {
    return this.cardRepository.find();
  }

  async getCardById(id: number): Promise<Card | undefined> {
    return this.cardRepository.findOneBy({ id });
  }

  async updateCard(
    id: number,
    name: string,
    title: string,
    answer: string,
  ): Promise<Card | undefined> {
    const card = await this.cardRepository.findOneBy({ id });
    if (!card) {
      return undefined;
    }
    card.name = name;
    card.title = title;
    card.answer = answer;
    return this.cardRepository.save(card);
  }

  async deleteCard(id: number): Promise<void> {
    await this.cardRepository.delete(id);
  }

  async deleteAllCards(): Promise<void> {
    await this.cardRepository.delete({});
  }
}
