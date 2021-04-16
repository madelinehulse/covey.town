import BodyParser from 'body-parser';
import { Express } from 'express';
import { Server } from 'http';
import { StatusCodes } from 'http-status-codes';
import io from 'socket.io';
import {
  gameCreateHandler,
  gameDeleteHandler,
  gameUpdateHandler,
  townCreateHandler,
  townDeleteHandler,
  townJoinHandler,
  townListHandler,
  townSubscriptionHandler,
  townUpdateHandler,
} from '../requestHandlers/CoveyTownRequestHandlers';
import { logError } from '../Utils';

export default function addTownRoutes(http: Server, app: Express): io.Server {
  /*
   * Create a new session (aka join a town)
   */
  app.post('/sessions', BodyParser.json(), async (req, res) => {
    try {
      const result = await townJoinHandler({
        userName: req.body.userName,
        coveyTownID: req.body.coveyTownID,
      });
      res.status(StatusCodes.OK).json(result);
    } catch (err) {
      logError(err);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Internal server error, please see log in server for more details',
      });
    }
  });

  /**
   * Delete a game
   */
  app.delete('/towns/games/:gameID', BodyParser.json(), async (req, res) => {
    try {
      const result = await gameDeleteHandler({
        gameID: req.params.gameID,
      });
      res.status(StatusCodes.OK).json(result);
    } catch (err) {
      logError(err);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Internal server error, please see log in server for details',
      });
    }
  });

  /**
   * Delete a town
   */
  app.delete('/towns/:townID/:townPassword', BodyParser.json(), async (req, res) => {
    try {
      const result = await townDeleteHandler({
        coveyTownID: req.params.townID,
        coveyTownPassword: req.params.townPassword,
      });
      res.status(200).json(result);
    } catch (err) {
      logError(err);
      res.status(500).json({
        message: 'Internal server error, please see log in server for details',
      });
    }
  });

  /**
   * List all towns
   */
  app.get('/towns', BodyParser.json(), async (_req, res) => {
    try {
      const result = await townListHandler();
      res.status(StatusCodes.OK).json(result);
    } catch (err) {
      logError(err);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Internal server error, please see log in server for more details',
      });
    }
  });

  /**
   * Create a town
   */
  app.post('/towns', BodyParser.json(), async (req, res) => {
    try {
      const result = await townCreateHandler(req.body);
      res.status(StatusCodes.OK).json(result);
    } catch (err) {
      logError(err);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Internal server error, please see log in server for more details',
      });
    }
  });
  /**
   * Create a game
   */
  app.post('/towns/games', BodyParser.json(), async (req, res) => {
    try {
      const result = await gameCreateHandler(req.body);
      res.status(StatusCodes.OK).json(result);
    } catch (err) {
      logError(err);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Internal server error, please see log in server for more details',
      });
    }
  });
  /**
   * Update a game
   */
  app.patch('/towns/games/:gameID', BodyParser.json(), async (req, res) => {
    try {
      const result = await gameUpdateHandler(req.body);
      res.status(StatusCodes.OK).json(result);
    } catch (err) {
      logError(err);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Internal server error, please see log in server for more details',
      });
    }
  });
  /**
   * Update a town
   */
  app.patch('/towns/:townID', BodyParser.json(), async (req, res) => {
    try {
      const result = await townUpdateHandler({
        coveyTownID: req.params.townID,
        isPubliclyListed: req.body.isPubliclyListed,
        friendlyName: req.body.friendlyName,
        coveyTownPassword: req.body.coveyTownPassword,
      });
      res.status(StatusCodes.OK).json(result);
    } catch (err) {
      logError(err);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Internal server error, please see log in server for more details',
      });
    }
  });

<<<<<<< HEAD
=======
  // App.post ,patch delete for checkers game
>>>>>>> master

  const socketServer = new io.Server(http, { cors: { origin: '*' } });
  socketServer.on('connection', townSubscriptionHandler);
  return socketServer;
}
