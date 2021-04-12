import Player from "../types/Player";
import CheckersController from "./CheckersController";

export default class CheckersStore {
    private static _instance: CheckersStore;

  private _games: CheckersController[] = [];

  static getInstance(): CheckersStore {
    if (CheckersStore._instance === undefined) {
      CheckersStore._instance = new CheckersStore();
    }
    return CheckersStore._instance;
  }

  //Game ID from the game controller
  getControllerForGame(gameID: string): CheckersController | undefined {
    return this._games.find(town => town.gameID === gameID);
  }

  
  createGame(player1: Player, player2:Player): CheckersController {
    const newGame = new CheckersController(player1, player2);
    this._games.push(newGame);
    return newGame;
  }

  
  updateGame(gameID:string, fromRow:number,fromCol:number,toRow:number,toCol:number): boolean {
    const existingGame = this.getControllerForGame(gameID);
    if(existingGame) {
      existingGame.movePiece(fromRow, fromCol, toRow, toCol);
      return true;
    }
    return false;
  }

  //TODO: We might need something to disconnet all the players when game is over. 
  // Also how are we sending the message of who won the game?
  deleteGame(gameID: string): boolean {
    const existingGame = this.getControllerForGame(gameID);

    if (existingGame && existingGame.isGameOver()) {
      this._games = this._games.filter(game => game !== existingGame);
      return true;
      //Would we need something like this?
      //existingTown.disconnectAllPlayers();
    }
    return false;
  }
}