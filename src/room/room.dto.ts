export class RoomDto {
  roomName: string;
}

export class AddScoreDto {
  roomName: string;
  scores: PlayerScore[];
}

export interface PlayerScore {
  playerId: number;
  score: number;
}
