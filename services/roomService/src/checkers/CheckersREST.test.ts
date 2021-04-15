import { CheckersGameState, Checker, ServerPlayer } from "../client/TownsServiceClient";

export type TestCheckersGameState = {
    gameID: string,
    board: Checker[][],
    player1: ServerPlayer | null,
    player2: ServerPlayer | null,
    myPlayerTurn: boolean,
    redPieces: number,
    blackPieces: number,
    isGameOver: boolean
  }

    const empty = null;
    const redPiece: Checker = {isBlack: false, isKing: false,};
    const blackPiece: Checker = {isBlack: true, isKing: false,};
    const redKingPiece: Checker = {isBlack: false, isKing: true,};
    const blackKingPiece: Checker = {isBlack: true, isKing: true,};

     function getNormalBoard(): Checker[][] {

        const row0: Checker[] = [empty,redPiece,empty,redPiece,empty,redPiece,empty,redPiece];
        const row1: Checker[] = [redPiece,empty,redPiece,empty,redPiece,empty,redPiece,empty];
        const row2: Checker[] = [empty,redPiece,empty,redPiece,empty,redPiece,empty,redPiece];
        const row3: Checker[] = [empty,empty,empty,empty,empty,empty,empty,empty]
        const row4: Checker[] = [empty,empty,empty,empty,empty,empty,empty,empty]
        const row5: Checker[] = [blackPiece,empty,blackPiece,empty,blackPiece,empty,blackPiece,empty];
        const row6: Checker[] = [empty,blackPiece,empty,blackPiece,empty,blackPiece,empty,blackPiece];
        const row7: Checker[] = [blackPiece,empty,blackPiece,empty,blackPiece,empty,blackPiece,empty];
        const normalBoard: Checker[][] = [row0, row1, row2, row3, row4, row5, row6, row7];

        return normalBoard;
    }

     function getSinglePieceMovementBoard(): Checker[][] {

        const row0: Checker[] = [empty,empty,empty,redPiece,empty,empty,empty,empty];
        const row1: Checker[] = [empty,empty,empty,empty,empty,empty,empty,empty];
        const row2: Checker[] = [empty,empty,empty,empty,empty,empty,empty,empty];
        const row3: Checker[] = [empty,empty,empty,empty,empty,empty,empty,empty];
        const row4: Checker[] = [empty,empty,empty,empty,empty,empty,empty,empty];
        const row5: Checker[] = [empty,empty,empty,empty,empty,empty,empty,empty];
        const row6: Checker[] = [empty,empty,empty,empty,empty,empty,empty,empty];
        const row7: Checker[] = [empty,empty,blackPiece,empty,empty,empty,empty,empty];
        const board: Checker[][] = [row0, row1, row2, row3, row4, row5, row6, row7];

        return board;
    }

    function getKingMovementBoard(): Checker[][] {

        const row0: Checker[] = [empty,empty,empty,redKingPiece,empty,empty,empty,empty];
        const row1: Checker[] = [empty,empty,empty,empty,empty,empty,empty,empty];
        const row2: Checker[] = [empty,empty,empty,empty,empty,empty,empty,empty];
        const row3: Checker[] = [empty,empty,empty,empty,empty,empty,empty,empty];
        const row4: Checker[] = [empty,empty,empty,empty,empty,empty,empty,empty];
        const row5: Checker[] = [empty,empty,empty,empty,empty,empty,empty,empty];
        const row6: Checker[] = [empty,empty,empty,empty,empty,empty,empty,empty];
        const row7: Checker[] = [empty,empty,blackKingPiece,empty,empty,empty,empty,empty];
        const board: Checker[][] = [row0, row1, row2, row3, row4, row5, row6, row7];

        return board;
    }

    // CAN BE USED FOR IsGameOver AS WELL
    // CAN BE USED FOR INVALID HOP
    function getHopBoard(): Checker[][] {
        const row0: Checker[] = [empty,empty,empty,redKingPiece,empty,empty,empty,empty];
        const row1: Checker[] = [empty,empty,redKingPiece,empty,empty,empty,empty,empty];
        const row2: Checker[] = [empty,empty,empty,empty,empty,empty,empty,empty];
        const row3: Checker[] = [empty,empty,empty,empty,empty,empty,empty,empty];
        const row4: Checker[] = [empty,empty,empty,empty,empty,empty,empty,empty];
        const row5: Checker[] = [empty,empty,empty,empty,empty,redKingPiece,empty,empty];
        const row6: Checker[] = [empty,empty,empty,blackKingPiece,empty,empty,empty,empty];
        const row7: Checker[] = [empty,empty,empty,empty,empty,empty,empty,empty];
        const board: Checker[][] = [row0, row1, row2, row3, row4, row5, row6, row7];

        return board;
    }