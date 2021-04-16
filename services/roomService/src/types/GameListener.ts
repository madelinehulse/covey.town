import { CheckersGameState, ServerPlayer } from "../client/TownsServiceClient";

export default interface GameListener {
    onMoveMade(gameState: CheckersGameState): void;

    onPlayerJoined(): void;

}