import { CheckersGameState } from "../client/TownsServiceClient";

export default interface GameListener {
    onMoveMade(gameState: CheckersGameState): void;

    onPlayerJoined(): void;
}