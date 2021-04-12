import { nanoid } from "nanoid";
import { Piece } from "../CoveyTypes"
import Player from "../types/Player";

export default class CheckersController {

    get gameID() {
        return this._gameID;
    }
    
    private _gameID: string;

    private _player1: Player; //We have these as sockets

    private _player2: Player;

    private board: Piece[][] = [[]];

    private player1Turn: boolean;

    private blackPieces: number;

	private redPieces: number;


 constructor(player1: Player, player2: Player) {
     this._gameID = nanoid(8);
     this._player1 = player1;
     this._player2 = player2;
     this.board = this.createBoard();
     this.player1Turn = true;
     this.blackPieces = 12;
     this.redPieces = 12;
 }   

 // Builds a static hardcoded board (As start board is always the same)
 createBoard() {
	 const empty = null;
	 const redPiece: Piece = {isBlack: false, isKing: false,};
	 const blackPiece: Piece = {isBlack: false, isKing: false,};

	 const row0: Piece[] = [empty,redPiece,empty,redPiece,empty,redPiece,empty,redPiece];
	 const row1: Piece[] = [redPiece,empty,redPiece,empty,redPiece,empty,redPiece,empty];
	 const row2: Piece[] = [empty,redPiece,empty,redPiece,empty,redPiece,empty,redPiece];
	 const row3: Piece[] = [empty,empty,empty,empty,empty,empty,empty,empty]
	 const row4: Piece[] = [empty,empty,empty,empty,empty,empty,empty,empty]
	 const row5: Piece[] = [blackPiece,empty,blackPiece,empty,blackPiece,empty,blackPiece,empty];
	 const row6: Piece[] = [empty,blackPiece,empty,blackPiece,empty,blackPiece,empty,blackPiece];
	 const row7: Piece[] = [blackPiece,empty,blackPiece,empty,blackPiece,empty,blackPiece,empty];
	 const newBoard: Piece[][] = [row0, row1, row2, row3, row4, row5, row6, row7];

     return newBoard;
 }
​
movePiece(fromRow: number, fromCol: number, toRow: number, toCol: number):boolean {
	//If the piece color is same as the player turn color && If the target row and column is in the board
    if (this.correctPiece(fromRow,fromCol) && this.checkBounds(toRow, toCol)) {
		//If the piece is a King Piece
		if(this.isCurrentKing(fromRow,fromCol)){
			return this.kingMove(fromRow, fromCol, toRow, toCol);
		}
		//If the piece is a Normal Piece
		if(!this.isCurrentKing(fromRow,fromCol)) {
			return this.normalMove(fromRow, fromCol, toRow, toCol);
		}
}
	//No piece - Invalid, return false
	return false;
}
​
​
//Handles functions for a normal piece
// All 4 parameters are integers that represent
//X,Y for the from move
//X,Y coordinates for the to location
normalMove(fromRow: number, fromCol: number, toRow: number, toCol: number): boolean{
	//Get current piece
	const piece = this.board[fromRow][fromCol];
	const rowDifference = fromRow - toRow;
	const colDifference = fromCol - toCol;
​
    if (piece) {
	//Checks for Single move
	const blackCorrectMove = ((rowDifference === -1) && (piece.isBlack));
	const redCorrectMove = ((rowDifference === 1) && (piece.isBlack === false));
​
	//Checks to see if attempting a hop over another piece.
	const blackHop = ((rowDifference === -2) && (piece.isBlack));
	const redHop = ((rowDifference === -2) && (piece.isBlack === false));
	const hopMove = (Math.abs(colDifference) === 2);
​
	if((blackCorrectMove || redCorrectMove) 
	&& this.checkSingleMove(fromRow, fromCol, toRow,toCol)) {
		//If the target location doesn't have a piece...
		//Move the piece.
		//Move current piece to the location
		this.board[toRow][toCol] = piece;
		//Make the origin place empty
		this.board[fromRow][fromCol] = null;
		this.endTurn();
		return true;
	}
​   
​
	if((blackHop||redHop) && hopMove) {
		const middleRow = ((fromRow+toRow)/2);
		const middleCol = ((fromCol+toCol)/2);
​
		if(this.checkHop(fromRow,fromCol,middleRow,middleCol,toRow,toCol)) {
			//Move current piece to the location
			this.board[toRow][toCol] = piece;
			//Make the origin place empty
			this.board[fromRow][fromCol] = null;
			//Eliminate the middle piece
			this.board[middleRow][middleCol] = null;
            //Updates count of pieces
            this.updateCount(fromRow,fromCol);
			this.endTurn();
			return true;
		}
​
	}
	
}
	return false;
}
​
//Handles functions for a king piece
// All 4 parameters are integers that represent
//X,Y for the from move
//X,Y coordinates for the to location
kingMove(fromRow: number, fromCol: number, toRow: number, toCol: number):boolean {
	//Get current piece
	const piece = this.board[fromRow][fromCol];
	const rowDifference = fromRow - toRow;
	const colDifference = fromCol - toCol;
​   
    if (piece) {
	//Checks for Single move
	const singleRowDifference = (Math.abs(rowDifference) === 1);
​
	//Checks to see if attempting a hop over another piece.
	const singleHopDifference = (Math.abs(rowDifference) === 2);
	const hopMove = (Math.abs(colDifference) === 2);

​
	if(singleRowDifference && this.checkSingleMove(fromRow, fromCol, toRow,toCol)) {
		//If the target location doesn't have a piece...
		//Move the piece.
		//Move current piece to the location
		this.board[toRow][toCol] = piece;
		//Make the origin place empty
		this.board[fromRow][fromCol] = null;
		this.endTurn();
		return true;
		
	}
​
​
	if(singleHopDifference && hopMove) {
		const middleRow = ((fromRow+toRow)/2);
		const middleCol = ((fromCol+toCol)/2);

		if(this.checkHop(fromRow,fromCol,middleRow,middleCol,toRow,toCol)) {
			//Move current piece to the location
			this.board[toRow][toCol] = piece;
			//Make the origin place empty
			this.board[fromRow][fromCol] = null;
			//Eliminate the middle piece
			this.board[middleRow][middleCol] = null;
            //Updates count of pieces
            this.updateCount(fromRow,fromCol);
			this.endTurn();
			return true;
		}
​
	}
	
}
	return false;
}

// Checks if a given Row and Column is within the board limits
checkBounds(row: number, col: number) {
	const rowFine = row >= 0 && row < 8;
	const colFine = col>=0 && col<8;
    return (rowFine && colFine);
}

isGameOver() {
	//Game End Scenario 1: One of them loses all their pieces
	if(this.blackPieces ===0 || this.redPieces === 0) {
		return true;
	}

	// Game End Scenario 2: There are no valid moves
	//IN every row
	for(let rowNum =0; rowNum<8; rowNum++){
		//In every column
		for(let colNum = 0; colNum<8; colNum++) {
			// Top right corner check
			if(rowNum === 0 && colNum === 7){
				return this.checkBottomLeftMove(rowNum,colNum) 
			}
			// Bottom Left corner check
			if(rowNum === 7 && colNum === 0){
				return this.checkTopRightMove(rowNum,colNum) 
			}
			// if in the left column, can only more right
			if(colNum === 0){
				return this.checkTopRightMove(rowNum,colNum) || this.checkBottomRightMove(rowNum,colNum);
			}
			// if in the right column, can only move left
			if(colNum === 7){
				return this.checkBottomLeftMove(rowNum,colNum) || this.checkTopLeftMove(rowNum,colNum);
			}
			// If in the top column, can only move down
			if(rowNum === 0){
				return this.checkBottomLeftMove(rowNum,colNum) || this.checkBottomRightMove(rowNum,colNum);
			}
			// if in the bottom column, can only move up
			if(rowNum === 7){
				return this.checkTopLeftMove(rowNum,colNum) || this.checkTopRightMove(rowNum,colNum);
			}
			//Otherwise can move in all directions
			return this.checkBottomLeftMove(rowNum,colNum) 
			|| this.checkBottomRightMove(rowNum, colNum)
			|| this.checkTopLeftMove(rowNum,colNum)
			|| this.checkTopRightMove(rowNum,colNum);
		}
	}
}

// Checks whether a piece can move OR hop in top left direction
checkTopLeftMove(row:number, col: number){
	//Only black piece or king piece can move up
	if(this.isCurrentBlack(row,col) || this.isCurrentKing(row,col)){
		return this.checkSingleMove(row, col, row-1, col-1)
		&& this.checkHop(row, col, row-1, col-1, row-2, col-2);
	}
	return false;
}

// Checks whether a piece can move OR hop in top right direction
checkTopRightMove(row:number, col: number) {
	//Only black piece or king piece can move up
	if(this.isCurrentBlack(row,col) || this.isCurrentKing(row,col)){
		return this.checkSingleMove(row, col, row-1, col+1)
		&& this.checkHop(row, col, row-1, col+1, row-2, col+2);
	}
	return false;
}

// Checks whether a piece can move OR hop in bottom left direction
checkBottomLeftMove(row:number, col: number) {
	//Only red piece or king piece can move down
	if(this.isCurrentRed(row,col) || this.isCurrentKing(row,col)){
		return this.checkSingleMove(row, col, row+1, col-1)
		&& this.checkHop(row, col, row+1, col-1, row+2, col-2);
	}
	return false;
}
// Checks whether a piece can move OR hop in bottom right direction
checkBottomRightMove(row:number, col: number) {
	//Only red piece or king piece can move down
	if(this.isCurrentRed(row,col) || this.isCurrentKing(row,col)){
		return this.checkSingleMove(row, col, row+1, col+1)
		&& this.checkHop(row, col, row+1, col+1, row+2, col+2);
	}
	return false;
}

// Returns true if current piece is King
isCurrentKing(row:number, col:number){
	const piece = this.board[row][col];
	if(piece){
		return (piece.isKing);
	}
	return false
}

// Returns true for black piece
isCurrentBlack(row:number, col:number){
	const piece = this.board[row][col];
	if(piece){
		return (piece.isBlack);
	}
	return false
}

// Returns true for Red Piece
isCurrentRed(row:number, col:number){
	const piece = this.board[row][col];
	if(piece){
		return (!piece.isBlack);
	}
	return false
}

// Checks if a single move can be made
checkSingleMove(fromRow:number,fromCol:number,toRow:number,toCol:number){
	if(this.checkBounds(toRow,toCol)){
		const piece = this.board[fromRow][fromCol];
		const target = this.board[fromRow][fromCol];
		return (!piece===null && target===null);
	}
	return false;
}

//Check is a hop can be made
checkHop(fromRow:number,fromCol:number,midRow:number, midCol: number, toRow:number,toCol:number){
	if(this.checkBounds(toRow,toCol)&& this.checkBounds(midRow, midCol)){
		const piece = this.board[fromRow][fromCol];
		const midPiece = this.board[fromRow][fromCol];
		const target = this.board[fromRow][fromCol];

		const pieceFine = (piece && !piece===null);
		const midPieceFine = (midPiece && !midPiece===null);
		const targetFine = (target===null);
		return (pieceFine && midPieceFine && targetFine && (piece?.isBlack !== midPiece?.isBlack))
	}
	return false;
}

//Returns true if it is the player's move and they move their own piece.
correctPiece(fromRow:number,fromCol:number){
	return ((this.isCurrentBlack(fromRow,fromCol) && this.player1Turn) 
	|| (this.isCurrentRed(fromRow,fromCol) && !this.player1Turn));
}

// After each end turn call, the boolean changes. So this is used to flip whose turn is it. 
endTurn() {
	this.player1Turn = !this.player1Turn;
}

updateCount(fromRow:number, fromCol:number) {
	if (this.isCurrentBlack(fromRow,fromCol)) {
		this.redPieces -=1;
	} else {
		this.blackPieces -=1;
	}
}
}