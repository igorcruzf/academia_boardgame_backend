import { HttpStatus } from '@nestjs/common';
import { BaseException } from '../../base.exception';

export class RoomNotFoundException extends BaseException {
  constructor(roomName: string) {
    super(`Room with name ${roomName} not found.`);
    this.name = 'RoomNotFoundException';
    this.status = HttpStatus.NOT_FOUND;
  }
}
