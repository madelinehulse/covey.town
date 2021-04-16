import { Socket } from "socket.io/dist/socket";
import { CheckersGameState, ServerPlayer } from "../client/TownsServiceClient";
import CoveyTownsStore from "../lib/CoveyTownsStore";
import GameListener from "../types/GameListener";
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

  
  createGame(player1: ServerPlayer, player2: ServerPlayer, townID: string): CheckersController {
    
    const existingGame = this._games.find(game => ((game.player1._id === player2._id) || (game.player2._id === player2._id)));

    if (existingGame && (existingGame.player1._id === player1._id || existingGame.player2._id === player1._id)) {
      existingGame.playerJoined();
      return existingGame;
    }

    if (existingGame) {
      throw new Error();
    }
   
    else {
    const townsStore = CoveyTownsStore.getInstance();
    const townController = townsStore.getControllerForTown(townID);

    if (townController) {
    
    const socket1 = townController?.getSocket(player1._id);
    const socket2 = townController?.getSocket(player2._id);
  
    const listener1 = this.gameSocketAdapter(socket1);
    const listener2 = this.gameSocketAdapter(socket2);


    
    const newGame = new CheckersController(player1, player2, listener1, listener2);
    this._games.push(newGame);
    return newGame;
    }
    else throw new Error();
  }}

  
  updateGame(gameID:string, fromRow:number,fromCol:number,toRow:number,toCol:number): boolean {
    const existingGame = this.getControllerForGame(gameID);
    if(existingGame) {
      return existingGame.movePiece(fromRow, fromCol, toRow, toCol);
    }
    return false;
  }

  //TODO: We might need something to disconnet all the players when game is over. 
  // Also how are we sending the message of who won the game?
  deleteGame(gameID: string): boolean {
    const existingGame = this.getControllerForGame(gameID);
    if (existingGame) {
      existingGame.gameDestroyed();
      this._games = this._games.filter(game => game !== existingGame);
      return true;
      //Would we need something like this?
      //existingTown.disconnectAllPlayers();
    }
    return false;
  }

  

  gameSocketAdapter(socket: Socket): GameListener {
    return {
      onMoveMade(gameState: CheckersGameState) {
        socket.emit('moveMade', gameState);
      },
      onPlayerJoined() {
        socket.emit('playerJoinedGame');
      },
      onGameDestroyed() {
        socket.emit('gameDestroyed');
      }
    }
  }
}