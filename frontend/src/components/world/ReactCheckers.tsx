import { useToast } from '@chakra-ui/react';
import Phaser from 'phaser';
import React, { useCallback, useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import Player, { UserLocation } from '../../classes/Player';
import { CoveyAppState } from '../../CoveyTypes';
import useCoveyAppState from '../../hooks/useCoveyAppState';
import useNearbyPlayers from '../../hooks/useNearbyPlayers';
import { Checker, CheckersGameState } from './CheckerTypes';

type HandleCreate = () => void;
type HandleMove = () => void;
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
    myPlayerTurn: false,
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

  constructor(
    handleCreateParam: HandleCreate,
    handleMoveParam: HandleMove,
    handleDeleteParam: HandleDelete,
    gameState: CheckersGameState
  ) {
    super({
      key: 'checkers',
    });
    this.handleCreateFunction = handleCreateParam;
    this.handleMoveFunction = handleMoveParam;
    this.handleDeleteFunction = handleDeleteParam;
    this.gameState = gameState;
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
    }

    this.input.on(
      'drag',
      (pointer: Phaser.Input.Pointer, gameObject: any, dragX: number, dragY: number) => {
        const object = gameObject;
        object.x = dragX;
        object.y = dragY;
      },
    );
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
    // // Iterate through rows of the board
    // for (let r = 0; r <= 7; r += 1) {
    //   switch (r) {
    //     case 0:
    //       this.addCheckerRow(r, 'redChecker', 2, container);
    //       break;
    //     case 1:
    //       this.addCheckerRow(r, 'redChecker', 1, container);
    //       break;
    //     case 2:
    //       this.addCheckerRow(r, 'redChecker', 2, container);
    //       break;
    //     case 3:
    //       // (no checkers)
    //       break;
    //     case 4:
    //       // (no checkers)
    //       break;
    //     case 5:
    //       this.addCheckerRow(r, 'blackChecker', 1, container);
    //       break;
    //     case 6:
    //       this.addCheckerRow(r, 'blackChecker', 2, container);
    //       break;
    //     case 7:
    //       this.addCheckerRow(r, 'blackChecker', 1, container);
    //       break;
    //     default:
    //       break;
    //   }
    // }
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
    // this.gameState.board.forEach(row => {
    //   row.forEach(checker => {

    //   })
    // });
    console.log('added checkers to board');
  }

  addCheckerRow(row: number, color: string, type: number, container: Phaser.GameObjects.Container) {
    if (type === 1) {
      for (let i = 0; i <= 7; i += 1) {
        if (i % 2 === 0) {
          const checker = this.add
            .image(i * 60 + 90, row * 60 + 90, color)
            .setScale(0.75, 0.75)
            .setInteractive();
          this.input.setDraggable(checker);
          container.add(checker);
          console.log('added red checker');
        }
      }
    } else {
      for (let i = 0; i <= 7; i += 1) {
        if (i % 2 === 1) {
          const checker = this.add
            .image(i * 60 + 90, row * 60 + 90, color)
            .setScale(0.75, 0.75)
            .setInteractive();
          this.input.setDraggable(checker);
          container.add(checker);
          console.log('added black checker');
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
  const [playingGame, setPlayingGame] = useState<boolean>(false);

  // appState.socket?.on('checkersPlayerMove', (gameState: CheckersGameState) => {
    
  // })

  const checkForGameUpdate = useCallback(() => {
    console.log('checking for game updates');
  }, []);

  useEffect(() => {
    // maybe pass a new game scene here?
    console.log(nearbyPlayers);
    console.log('giraffe');
  }, [nearbyPlayers]);

  async function handleMove() {
    try {
      const gameUpdate = await apiClient.updateGame({
        gameID: '',
        toRow: 0,
        toCol: 0,
        fromRow: 0,
        fromCol: 0,
      });
      toast({
        title: `You made a move!`,
        description: <>Your turn is over</>,
        status: 'success',
        isClosable: true,
        duration: null,
      });
    } catch (err) {
      console.log(err.toString());
      console.log('toast');
      toast({
        title: 'Invalid move',
        description: err.toString(),
        status: 'error',
      });
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
        duration: null,
      });
    } catch (err) {
      console.log(err.toString());
      console.log('toast');
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
      console.log(err.toString());
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
    console.log('gameState effect triggered');
    const game = new Phaser.Game(config);
    const newGameScene = new ReactCheckersScene(
      handleCreate,
      handleMove,
      handleDelete,
      gameState
    );
    game.scene.add('checkers', newGameScene, true);

    return () => {
      game.destroy(true);
    };
  }, [gameState, nearbyPlayers]);

  // useEffect(() => {
  //   const config = {
  //     type: Phaser.AUTO,
  //     parent: 'board-container',
  //     transparent: true,
  //     minWidth: 200,
  //     minHeight: 150,
  //     physics: {
  //       default: 'arcade',
  //       arcade: {
  //         gravity: { y: 0 }, // Top down game, so no gravity
  //       },
  //     },
  //   };
  //   console.log('nearby player effect triggered');
  //   const game = new Phaser.Game(config);
  //   const newGameScene = new ReactCheckersScene(
  //     handleCreate,
  //     handleMove,
  //     handleDelete,
  //   );
  //   game.scene.add('checkers', newGameScene, true);

  //   return () => {
  //     game.destroy(true);
  //   };
  // }, [nearbyPlayers]);

  return <div id='board-container' style={{ display: hasNearbyPlayer ? 'block' : 'none' }} />;
}

// // Check if the other player has indicated that they are ready to start playing
  // useEffect(() => {
  //   // Check if other player has started game
  //   checkOtherPlayerReady();
  //   const timer = setInterval(checkOtherPlayerReady, 2000);
  //   // If not waiting for other player, stop checking
  //   if (!waitingForOtherPlayer) {
  //     toast({
  //       title: 'Other player is ready to play!',
  //       status: 'success',
  //       isClosable: true,
  //       duration: null,
  //     });
  //     clearInterval(timer);
  //     // Set-up GameBoard
  //     // TODO - 
  //   }
  // }, [waitingForOtherPlayer]);

  // // Check for game updates on other player's turn
  // useEffect(() => {
  //   const timer = setInterval(checkForGameUpdate, 2000);
  //   if (playingGame) {
  //     checkForGameUpdate();
  //   } else {
  //     console.log('game not being played');
  //     clearInterval(timer);
  //   }
  // })

  // const checkOtherPlayerReady = useCallback(() => {
  //   console.log('checking if other player is ready');
  //   apiClient.checkOtherPlayerReadyToPlay({ otherPlayerID: nearbyPlayer1.id }).then(res => {
  //     if (res.otherPlayerReady) {
  //       setWaitingForOtherPlayer(res.otherPlayerReady);
  //     }
  //   });
  // }, [waitingForOtherPlayer]);