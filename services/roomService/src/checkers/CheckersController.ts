import { nanoid } from 'nanoid';
import { Checker, CheckersGameState, ServerPlayer } from '../client/TownsServiceClient';
import GameListener from '../types/GameListener';

export default class CheckersController {
  get gameID(): string {
    return this._gameID;
  }

  get player1(): ServerPlayer {
    return this._player1;
  }

  get player2(): ServerPlayer {
    return this._player2;
  }

  private _gameID: string;

  private _player1: ServerPlayer;

  private _player2: ServerPlayer;

  private board: Checker[][] = [[]];

  private player1Turn: boolean;

  private blackPieces: number;

  private redPieces: number;

  otherPlayerJoined: boolean;

  private sockets: GameListener[] = [];

  private isGameOver: boolean;

  private maxRows: number;

  private maxCols: number;

  constructor(
    player1: ServerPlayer,
    player2: ServerPlayer,
    listener1: GameListener,
    listener2: GameListener,
  ) {
    this._gameID = nanoid(8);
    this._player1 = player1;
    this._player2 = player2;
    this.createBoard();
    this.player1Turn = true;
    this.blackPieces = 12;
    this.redPieces = 12;
    this.otherPlayerJoined = false;
    this.isGameOver = false;
    this.sockets.push(listener1);
    this.sockets.push(listener2);
    this.maxCols = 8;
    this.maxRows = 8;
  }

  retrieveGameState(): CheckersGameState {
    return {
      gameID: this._gameID,
      board: this.board,
      player1: this._player1,
      player2: this._player2,
      blacksTurn: this.player1Turn,
      redPieces: this.redPieces,
      blackPieces: this.blackPieces,
      isGameOver: this.isGameOver,
    };
  }

  getIsGameOver(): boolean {
    return this.isGameOver;
  }

  playerJoined(): void {
    this.otherPlayerJoined = true;
    this.sockets.forEach(s => {
      s.onPlayerJoined();
    });
  }

  gameDestroyed(): void {
    this.sockets.forEach(s => {
      s.onGameDestroyed();
    });
    this.sockets = [];
  }

  // Builds a static hardcoded board (As start board is always the same)
  createBoard(): void {
    const empty = null;
    const row0: Checker[] = [
      empty,
      { isBlack: false, isKing: false },
      empty,
      { isBlack: false, isKing: false },
      empty,
      { isBlack: false, isKing: false },
      empty,
      { isBlack: false, isKing: false },
    ];
    const row1: Checker[] = [
      { isBlack: false, isKing: false },
      empty,
      { isBlack: false, isKing: false },
      empty,
      { isBlack: false, isKing: false },
      empty,
      { isBlack: false, isKing: false },
      empty,
    ];
    const row2: Checker[] = [
      empty,
      { isBlack: false, isKing: false },
      empty,
      { isBlack: false, isKing: false },
      empty,
      { isBlack: false, isKing: false },
      empty,
      { isBlack: false, isKing: false },
    ];
    const row3: Checker[] = [empty, empty, empty, empty, empty, empty, empty, empty];
    const row4: Checker[] = [empty, empty, empty, empty, empty, empty, empty, empty];
    const row5: Checker[] = [
      { isBlack: true, isKing: false },
      empty,
      { isBlack: true, isKing: false },
      empty,
      { isBlack: true, isKing: false },
      empty,
      { isBlack: true, isKing: false },
      empty,
    ];
    const row6: Checker[] = [
      empty,
      { isBlack: true, isKing: false },
      empty,
      { isBlack: true, isKing: false },
      empty,
      { isBlack: true, isKing: false },
      empty,
      { isBlack: true, isKing: false },
    ];
    const row7: Checker[] = [
      { isBlack: true, isKing: false },
      empty,
      { isBlack: true, isKing: false },
      empty,
      { isBlack: true, isKing: false },
      empty,
      { isBlack: true, isKing: false },
      empty,
    ];
    const newBoard: Checker[][] = [row0, row1, row2, row3, row4, row5, row6, row7];
    this.board = newBoard;
  }

  movePiece(fromRow: number, fromCol: number, toRow: number, toCol: number): boolean {
    // If the piece color is same as the player turn color && If the target row and column is in the board
    if (this.correctPiece(fromRow, fromCol) && this.checkBounds(toRow, toCol)) {
      // If the piece is a King Piece
      if (this.isCurrentKing(fromRow, fromCol)) {
        return this.kingMove(fromRow, fromCol, toRow, toCol);
      }
      // If the piece is a Normal Piece
      if (!this.isCurrentKing(fromRow, fromCol)) {
        return this.normalMove(fromRow, fromCol, toRow, toCol);
      }
    }
    // No piece - Invalid, return false
    return false;
  }

  // Handles functions for a normal piece
  // All 4 parameters are integers that represent
  // X,Y for the from move
  // X,Y coordinates for the to location
  normalMove(fromRow: number, fromCol: number, toRow: number, toCol: number): boolean {
    // Get current piece
    const piece = this.board[fromRow][fromCol];
    const rowDifference = toRow - fromRow;
    const colDifference = toCol - fromCol;
    if (piece !== null) {
      // Checks for Single move
      const blackCorrectMove = rowDifference === -1 && piece.isBlack;
      const redCorrectMove = rowDifference === 1 && piece.isBlack === false;
      // Checks to see if attempting a hop over another piece.
      const blackHop = rowDifference === -2 && piece.isBlack;
      const redHop = rowDifference === 2 && piece.isBlack === false;
      const hopMove = Math.abs(colDifference) === 2;
      if (
        (blackCorrectMove || redCorrectMove) &&
        this.checkSingleMove(fromRow, fromCol, toRow, toCol)
      ) {
        // If the target location doesn't have a piece...
        // Move the piece.
        // Move current piece to the location
        if ((toRow === 0 && piece.isBlack) || (toRow === 7 && !piece.isBlack)) {
          piece.isKing = true;
        }
        this.board[toRow][toCol] = piece;
        // Make the origin place empty
        this.board[fromRow][fromCol] = null;
        this.endTurn();
        this.checkIsGameOver();
        const gameState = this.retrieveGameState();
        this.sockets.forEach(s => {
          s.onMoveMade(gameState);
        });
        return true;
      }
      if ((blackHop || redHop) && hopMove) {
        const middleRow = (fromRow + toRow) / 2;
        const middleCol = (fromCol + toCol) / 2;
        if (this.checkHop(fromRow, fromCol, middleRow, middleCol, toRow, toCol)) {
          if ((toRow === 0 && piece.isBlack) || (toRow === 7 && !piece.isBlack)) {
            piece.isKing = true;
          }
          // Move current piece to the location
          this.board[toRow][toCol] = piece;
          // Make the origin place empty
          this.board[fromRow][fromCol] = null;
          // Eliminate the middle piece
          this.board[middleRow][middleCol] = null;
          // Updates count of pieces
          this.updateCount(toRow, toCol);
          this.endTurn();
          this.checkIsGameOver();
          const gameState = this.retrieveGameState();
          this.sockets.forEach(s => {
            s.onMoveMade(gameState);
          });
          return true;
        }
      }
    }
    return false;
  }

  // Handles functions for a king piece
  // All 4 parameters are integers that represent
  // X,Y for the from move
  // X,Y coordinates for the to location
  kingMove(fromRow: number, fromCol: number, toRow: number, toCol: number): boolean {
    // Get current piece
    const piece = this.board[fromRow][fromCol];
    const rowDifference = fromRow - toRow;
    const colDifference = fromCol - toCol;
    if (piece) {
      // Checks for Single move
      const singleRowDifference = Math.abs(rowDifference) === 1;
      // Checks to see if attempting a hop over another piece.
      const singleHopDifference = Math.abs(rowDifference) === 2;
      const hopMove = Math.abs(colDifference) === 2;

      if (singleRowDifference && this.checkSingleMove(fromRow, fromCol, toRow, toCol)) {
        // If the target location doesn't have a piece...
        // Move the piece.
        // Move current piece to the location
        this.board[toRow][toCol] = piece;
        // Make the origin place empty
        this.board[fromRow][fromCol] = null;
        this.endTurn();
        this.checkIsGameOver();
        const gameState = this.retrieveGameState();
        this.sockets.forEach(s => {
          s.onMoveMade(gameState);
        });
        return true;
      }
      if (singleHopDifference && hopMove) {
        const middleRow = (fromRow + toRow) / 2;
        const middleCol = (fromCol + toCol) / 2;

        if (this.checkHop(fromRow, fromCol, middleRow, middleCol, toRow, toCol)) {
          // Move current piece to the location
          this.board[toRow][toCol] = piece;
          // Make the origin place empty
          this.board[fromRow][fromCol] = null;
          // Eliminate the middle piece
          this.board[middleRow][middleCol] = null;
          // Updates count of pieces
          this.updateCount(toRow, toCol);
          this.endTurn();
          this.checkIsGameOver();
          const gameState = this.retrieveGameState();
          this.sockets.forEach(s => {
            s.onMoveMade(gameState);
          });
          return true;
        }
      }
    }
    return false;
  }

  // Checks if a given Row and Column is within the board limits
  checkBounds(row: number, col: number): boolean {
    const rowFine = row >= 0 && row < this.maxRows;
    const colFine = col >= 0 && col < this.maxCols;
    return rowFine && colFine;
  }

  checkIsGameOver(): void {
    // Game End Scenario 1: One of them loses all their pieces
    if (this.blackPieces === 0 || this.redPieces === 0) {
      this.isGameOver = true;
    }
  }


  // Checks whether a piece can move OR hop in top left direction
  checkTopLeftMove(row: number, col: number): boolean {
    // Only black piece or king piece can move up
    if (this.isCurrentBlack(row, col) || this.isCurrentKing(row, col)) {
      return (
        this.checkSingleMove(row, col, row - 1, col - 1) &&
        this.checkHop(row, col, row - 1, col - 1, row - 2, col - 2)
      );
    }
    return false;
  }

  // Checks whether a piece can move OR hop in top right direction
  checkTopRightMove(row: number, col: number): boolean {
    // Only black piece or king piece can move up
    if (this.isCurrentBlack(row, col) || this.isCurrentKing(row, col)) {
      return (
        this.checkSingleMove(row, col, row - 1, col + 1) &&
        this.checkHop(row, col, row - 1, col + 1, row - 2, col + 2)
      );
    }
    return false;
  }

  // Checks whether a piece can move OR hop in bottom left direction
  checkBottomLeftMove(row: number, col: number): boolean {
    // Only red piece or king piece can move down
    if (this.isCurrentRed(row, col) || this.isCurrentKing(row, col)) {
      return (
        this.checkSingleMove(row, col, row + 1, col - 1) &&
        this.checkHop(row, col, row + 1, col - 1, row + 2, col - 2)
      );
    }
    return false;
  }

  // Checks whether a piece can move OR hop in bottom right direction
  checkBottomRightMove(row: number, col: number): boolean {
    // Only red piece or king piece can move down
    if (this.isCurrentRed(row, col) || this.isCurrentKing(row, col)) {
      return (
        this.checkSingleMove(row, col, row + 1, col + 1) &&
        this.checkHop(row, col, row + 1, col + 1, row + 2, col + 2)
      );
    }
    return false;
  }

  // Returns true if current piece is King
  isCurrentKing(row: number, col: number): boolean {
    const piece = this.board[row][col];
    if (piece) {
      return piece.isKing;
    }
    return false;
  }

  // Returns true for black piece
  isCurrentBlack(row: number, col: number): boolean {
    const piece = this.board[row][col];
    if (piece) {
      return piece.isBlack;
    }
    return false;
  }

  // Returns true for Red Piece
  isCurrentRed(row: number, col: number): boolean {
    const piece = this.board[row][col];
    if (piece) {
      return !piece.isBlack;
    }
    return false;
  }

  // Checks if a single move can be made
  checkSingleMove(fromRow: number, fromCol: number, toRow: number, toCol: number): boolean {
    if (this.checkBounds(toRow, toCol)) {
      const piece = this.board[fromRow][fromCol];
      const target = this.board[toRow][toCol];
      if (piece && target === null) {
        return true;
      }
    }
    return false;
  }

  // Check is a hop can be made
  checkHop(
    fromRow: number,
    fromCol: number,
    midRow: number,
    midCol: number,
    toRow: number,
    toCol: number,
  ): boolean {
    if (this.checkBounds(toRow, toCol) && this.checkBounds(midRow, midCol)) {
      const piece = this.board[fromRow][fromCol];
      const midPiece = this.board[midRow][midCol];
      const target = this.board[toRow][toCol];

      const pieceFine = piece !== null;
      const midPieceFine = midPiece !== null;
      const targetFine = target === null;
      if (pieceFine && midPieceFine && targetFine && piece?.isBlack !== midPiece?.isBlack) {
        return true;
      }
    }
    return false;
  }

  // Returns true if it is the player's move and they move their own piece.
  correctPiece(fromRow: number, fromCol: number): boolean {
    return (
      (this.isCurrentBlack(fromRow, fromCol) && this.player1Turn) ||
      (this.isCurrentRed(fromRow, fromCol) && !this.player1Turn)
    );
  }

  // After each end turn call, the boolean changes. So this is used to flip whose turn is it.
  endTurn(): void {
    this.player1Turn = !this.player1Turn;
  }

  updateCount(fromRow: number, fromCol: number): void {
    if (this.isCurrentBlack(fromRow, fromCol)) {
      this.redPieces -= 1;
    } else {
      this.blackPieces -= 1;
    }
  }
}