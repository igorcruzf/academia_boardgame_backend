import { HttpStatus } from '@nestjs/common';
import { BaseException } from '../../base.exception';

export class PlayerNotFoundException extends BaseException {
  constructor(playerId: number) {
    super(`Player with ID ${playerId} not found.`);
    this.name = 'PlayerNotFoundException';
    this.status = HttpStatus.NOT_FOUND;
  }
}
