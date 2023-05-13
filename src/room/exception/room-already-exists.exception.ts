import { HttpStatus } from '@nestjs/common';
import { BaseException } from '../../base.exception';

export class RoomAlreadyExistsException extends BaseException {
  constructor(roomName: string) {
    super(
      `Cannot create room with name '${roomName}' because it already exists.`,
    );
    this.name = 'RoomAlreadyExistsException';
    this.status = HttpStatus.CONFLICT;
  }
}
