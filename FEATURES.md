# Checkers Game
## Starting a game
To initiate a checkers game with another user in a Covey Town, simply walk up to them and click the Play Game button. Once both the users are ready, a checkers board will pop up and the game will start. 

## Game Objective
The objective of the game is to capture all of the opponent's tokens, or block them in such a way that they are not able to make a valid move.

## Piece Movement
To make a move, the user selects the piece and drags it to their desired location. If the move is valid, the algorithm would permit the move and pass to the opponent. Otherwise, the move will not be made and the player has to make another move. 

### As a Player, there are 2 possible moves:
#### Single Space movement - moving in the front direction where an empty space is possible
#### Single Hop: Jumping over an opponent’s piece, removing it from the board and progressing towards victory. 

At start the pieces can only move in a single direction (top for black, bottom for red). Once a player’s piece reaches the opponent’s base, their piece is converted to a King Piece. King pieces have the added advantage of moving in 4 directions. Hence the specific piece no longer needs to move in one direction only, it can move in multiple directions. 
