import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { PlayerNotFoundException } from './player/exception/player-not-found.exception';
import { RoomAlreadyExistsException } from './room/exception/room-already-exists.exception';
import { BaseException } from './base.exception';
import { RoomNotFoundException } from './room/exception/room-not-found.exception';

@Catch(
  PlayerNotFoundException,
  RoomAlreadyExistsException,
  RoomNotFoundException,
)
export class AppFilter implements ExceptionFilter {
  catch(exception: BaseException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    response.status(exception.status).json({
      statusCode: exception.status,
      message: exception.message,
    });
  }
}
