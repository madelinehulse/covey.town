import { useToast } from '@chakra-ui/react';
import Phaser from 'phaser';
import React, { useEffect, useState } from 'react';
import Player, { UserLocation } from '../../classes/Player';
import { CoveyAppState } from '../../CoveyTypes';
import useCoveyAppState from '../../hooks/useCoveyAppState';
import useNearbyPlayers from '../../hooks/useNearbyPlayers';
import { Checker, CheckersGameState } from './CheckerTypes';

type HandleCreate = () => void;
type HandleMove = (oldLoc: {col: number, row: number}, newLoc: {col: number, row: number}) => Promise<boolean>;
type HandleDelete = () => void;

interface CheckersGameProps {
  appState: CoveyAppState
}

function defualtCheckersGameState(): CheckersGameState {
  return {
    gameID: '',
    board: [],
    player1: null,
    player2: null,
    blacksTurn: false,
    redPieces: 0,
    blackPieces: 0,
    isGameOver: false
  };
}

class ReactCheckersScene extends Phaser.Scene {
  private handleCreateFunction: HandleCreate;

  private handleMoveFunction: HandleMove;

  private handleDeleteFunction: HandleDelete;

  private gameState: CheckersGameState;

  private currentPlayerID: string | undefined;

  constructor(
    handleCreateParam: HandleCreate,
    handleMoveParam: HandleMove,
    handleDeleteParam: HandleDelete,
    gameState: CheckersGameState,
    playerID: string | undefined
  ) {
    super({
      key: 'checkers',
    });
    this.handleCreateFunction = handleCreateParam;
    this.handleMoveFunction = handleMoveParam;
    this.handleDeleteFunction = handleDeleteParam;
    this.gameState = gameState;
    this.currentPlayerID = playerID;
  }

  init() {
    this.scene.bringToTop();
  }

  preload() {
    this.load.image('gameboard', './assets/checkers/checker-board.png');
    this.load.image('play-button', './assets/checkers/playGameButton.png');
    this.load.image('popupBackground', './assets/checkers/popupBackground.png');
    this.load.image(
      'checkerBoardWithBackground',
      './assets/checkers/checkerBoardWithBackground.png',
    );
    this.load.image('redChecker', './assets/checkers/redChecker.png');
    this.load.image('blackChecker', './assets/checkers/blackChecker.png');
    this.load.image('redCheckerKing', './assets/checkers/redCheckerKing.png');
    this.load.image('blackCheckerKing', './assets/checkers/blackCheckerKing.png');
    this.load.image('tanCheckerTile', './assets/checkers/tan-checker.png');
    this.load.image('brownCheckerTile', './assets/checkers/brown-checker.png');
    this.load.image('exitButton', './assets/checkers/exit-button.png');
  }

  create() {
    
    // Create container
    const windowContainer = this.add.container(
      this.game.renderer.width * 0.2,
      this.game.renderer.height * 0.1,
    );

    if (!this.gameState.player1) {
    // Add play button and background image
    const playButton: Phaser.GameObjects.Image = this.addPlayButton(150, 350, windowContainer);
    const backgroundImage = this.add
      .image(0, 0, 'popupBackground', 0)
      .setScale(0.75, 0.75)
      .setOrigin(0);
    windowContainer.add([backgroundImage, playButton]);
    } else {
      this.startGame(windowContainer);
      // Handle drag input for checkers
      let origPos: {x: number, y: number} = {x: 0, y: 0};
      
      const isPlayer1: boolean = this.currentPlayerID === this.gameState.player1?._id;
      const myTurn = (this.gameState.blacksTurn && isPlayer1) || (!this.gameState.blacksTurn && !isPlayer1);

      // Add text elements to screen
      let msg = '';
      if (myTurn) {
        if (isPlayer1) {
          msg = 'Your turn to move: Black';
        } else {
          msg = 'Your turn to move: Red';
        }
      } else {
        msg = 'Waiting for other player to move';
      }
      const turnText = this.add.text(220, 640, msg).setFontSize(30);

      // Game Score
      const redScoreText = this.add.text(250, 85, `Red: ${this.gameState.redPieces}`).setFontSize(30);
      const blackScoreText = this.add.text(600, 85, `Black: ${this.gameState.blackPieces}`).setFontSize(30);

      // If game over
      if (this.gameState.isGameOver) {
        const gameOverText = this.add.text(this.game.renderer.width * 0.5, this.game.renderer.height * 0.5, `Game Over`).setFontSize(64);
      }

      // Function to compute row and col of checker in gameBoard
      const computeLoc = (x: number, y: number) => {
        const column = Math.round((x - 90) / 60);
        const row = Math.round((y - 90) / 60);
        return { col: column, row };
      };

      this.input.on('dragstart', (pointer: Phaser.Input.Pointer, gameObject: any) => {
        origPos = {x: gameObject.x, y: gameObject.y};
      });

      this.input.on('drag', (pointer: Phaser.Input.Pointer, gameObject: any, dragX: number, dragY: number) => {
        const object = gameObject;
        object.x = dragX;
        object.y = dragY;
      });

      this.input.on('dragend', (pointer: Phaser.Input.Pointer, gameObject: any) => {
        if (myTurn) {
          const origCheckerLoc = computeLoc(origPos.x, origPos.y);
          const newCheckerLoc = computeLoc(gameObject.x, gameObject.y);
          const success = this.handleMoveFunction(origCheckerLoc, newCheckerLoc);
          console.log(success);
          if (!success) {
            const object = gameObject;
            object.x = origPos.x;
            object.y = origPos.y;
          }
        } else {
          const object = gameObject;
          object.x = origPos.x;
          object.y = origPos.y;
        }
      });
    }
  }

  addPlayButton(x: number, y: number, container: Phaser.GameObjects.Container) {
    const playButton = this.add.image(x, y, 'play-button', 1).setOrigin(0).setInteractive();
    // Add tint on button hover
    playButton.on('pointerover', () => {
      playButton.setTint(0x44ff44);
    });
    // Clear tint on hover exit
    playButton.on('pointerout', () => {
      playButton.clearTint();
    });
    playButton.on(
      'pointerup',
      () => {
        this.handleCreateFunction();
        this.startGame(container);
      },
      this,
    );
    return playButton;
  }

 startGame(container: Phaser.GameObjects.Container) {
    // Remove popup items from container
    container.removeAll(true);

    // Add gameboard background
    const gameboardImage = this.add
      .image(0, 0, 'checkerBoardWithBackground', 0)
      .setScale(0.75, 0.75)
      .setOrigin(0);
    this.addCheckersToBoard(container);
    container.add(gameboardImage);
    container.sendToBack(gameboardImage);
  }

  addCheckersToBoard(container: Phaser.GameObjects.Container) {
    for (let r = 0; r < this.gameState.board.length; r += 1) {
      for (let c = 0; c < this.gameState.board[r].length; c += 1) {
        const spacePiece = this.gameState.board[r][c];
        if (spacePiece) {
          let checker: Phaser.GameObjects.Image;
          // If black checker
          if (spacePiece.isBlack) {
            if (spacePiece.isKing) {
              checker = this.add
              .image(c * 60 + 90, r * 60 + 90, 'blackCheckerKing')
              .setScale(0.75, 0.75)
              .setInteractive();
            } else {
              checker = this.add
              .image(c * 60 + 90, r * 60 + 90, 'blackChecker')
              .setScale(0.75, 0.75)
              .setInteractive();
            }
          } 
          // If red checker
          else if (spacePiece.isKing) {
              checker = this.add
              .image(c * 60 + 90, r * 60 + 90, 'redCheckerKing')
              .setScale(0.75, 0.75)
              .setInteractive();
          }
          else {
              checker = this.add
              .image(c * 60 + 90, r * 60 + 90, 'redChecker')
              .setScale(0.75, 0.75)
              .setInteractive();
          }
          this.input.setDraggable(checker);
          container.add(checker);
        }
      }
    }
  }
}

export default function ReactCheckers({
  appState
}: CheckersGameProps): JSX.Element {
  const [gameState, setGameState] = useState<CheckersGameState>(defualtCheckersGameState());
  const { nearbyPlayers } = useNearbyPlayers();
  const hasNearbyPlayer = nearbyPlayers.length > 0;
  /* eslint-disable prefer-destructuring */
  const nearbyPlayer1: Player = nearbyPlayers[0];
  const [waitingForOtherPlayer, setWaitingForOtherPlayer] = useState<boolean>(false);
  const { apiClient } = useCoveyAppState();
  const toast = useToast();

  useEffect(() => {
    appState.socket?.on('moveMade', (newGameState: CheckersGameState) => {
      console.log('recieved update from other player move');
      console.log(newGameState);
      setGameState(newGameState);
    });
  }, [gameState]);

  useEffect(() => {
    if (waitingForOtherPlayer) {
      appState.socket?.on('playerJoinedGame', () => {
        setWaitingForOtherPlayer(false);
        toast({
          title: `Other player has joined the game!`,
          status: 'success',
          isClosable: true,
          duration: 2000,
        });
      });
    }
  }, [waitingForOtherPlayer]);

  async function handleMove(oldLoc: {col: number, row: number}, newLoc: {col: number, row: number}): Promise<boolean> {
    try {
      await apiClient.updateGame({
        gameID: gameState.gameID,
        toRow: newLoc.row,
        toCol: newLoc.col,
        fromRow: oldLoc.row,
        fromCol: oldLoc.col,
      });
      toast({
        title: `You made a move!`,
        description: <>Your turn is over</>,
        status: 'success',
        isClosable: true,
        duration: 2000,
      });
      return true;
    } catch (err) {
      toast({
        title: 'Invalid move',
        description: err.toString(),
        status: 'error',
      });
      return false;
    }
  }

  async function handleDelete() {
    try {
      const gameUpdate = await apiClient.deleteGame({
        gameID: '',
      });
      toast({
        title: `Game over!`,
        description: <>Find another player to start a game</>,
        status: 'success',
        isClosable: true,
        duration: 2000,
      });
    } catch (err) {
      toast({
        title: 'Cannot end game',
        description: err.toString(),
        status: 'error',
      });
    }
  }

  async function handleCreate() {
    try {
      const newGameInfo = await apiClient.createGame({
        player1: { _id: appState.myPlayerID, _userName: appState.userName, location: appState.currentLocation! },
        player2: { _id: nearbyPlayer1.id, _userName: nearbyPlayer1.userName, location: nearbyPlayer1.location! },
        townID: appState.currentTownID,
      });
      console.log(newGameInfo.gameID);
      console.log(newGameInfo.board);
      console.log(gameState);
      setGameState(newGameInfo.gameState);
      console.log(newGameInfo.gameState);
      // Message to display to player
      let msg = '';
      if (newGameInfo.otherPlayerReady) {
        msg = `Game is ready to go!`;
      } else {
        msg = 'Waiting on other player to start game.';
        setWaitingForOtherPlayer(true);
      }
      toast({
        title: msg,
        status: 'success',
        isClosable: true,
        duration: null,
      });
    } catch (err) {
      toast({
        title: 'Unable to start game',
        description: err.toString(),
        status: 'error',
      });
    }
  }

  useEffect(() => {
    const config = {
      type: Phaser.AUTO,
      parent: 'board-container',
      transparent: true,
      minWidth: 200,
      minHeight: 150,
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 0 }, // Top down game, so no gravity
        },
      },
    };
    const game = new Phaser.Game(config);
    const newGameScene = new ReactCheckersScene(
      handleCreate,
      handleMove,
      handleDelete,
      gameState,
      appState.myPlayerID
    );
    game.scene.add('checkers', newGameScene, true);

    return () => {
      game.destroy(true);
    };
  }, [gameState, nearbyPlayers]);

  return <div id='board-container' style={{ display: hasNearbyPlayer ? 'block' : 'none' }} />;
}