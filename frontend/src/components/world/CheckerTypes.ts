import { ServerPlayer } from "../../classes/Player";

export type Checker = {
  isBlack: boolean,
  isKing: boolean
} | null;

export type CheckersGameState = {
  gameID: string,
  board: Checker[][],
  player1: ServerPlayer | null,
  player2: ServerPlayer | null,
  myPlayerTurn: boolean,
  redPieces: number,
  blackPieces: number,
  isGameOver: boolean
}