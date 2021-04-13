import React, { useCallback, useEffect, useState } from 'react';
import assert from "assert";
import {
  useToast
} from '@chakra-ui/react';
import useVideoContext from '../VideoCall/VideoFrontend/hooks/useVideoContext/useVideoContext';
import Video from '../../classes/Video/Video';
import { CoveyTownInfo, TownJoinResponse, } from '../../classes/TownsServiceClient';
import useCoveyAppState from '../../hooks/useCoveyAppState';
import Player from '../../classes/Player';
import useNearbyPlayers from '../../hooks/useNearbyPlayers';

export default function CheckersSelection() : JSX.Element {
  const { apiClient } = useCoveyAppState();
  const toast = useToast();
  const { nearbyPlayers } = useNearbyPlayers();

  const handleCreate = async () => {
    try {
      const nearbyPlayer1 : Player = nearbyPlayers[0];
      const nearbyPlayer2 : Player = nearbyPlayers[1];

      const newTownInfo = await apiClient.createGame({
        player1: { _id: nearbyPlayer1.id, _userName: nearbyPlayer1.userName, location: nearbyPlayer1.location! },
        player2: { _id: nearbyPlayer1.id, _userName: nearbyPlayer1.userName, location: nearbyPlayer1.location! }
      });

      toast({
        title: `Game is ready to go!`,
        description: <>You are now ready to player checkers</>,
        status: 'success',
        isClosable: true,
        duration: null,
      })
    } catch (err) {
      toast({
        title: 'Unable to connect to Towns Service',
        description: err.toString(),
        status: 'error'
      })
    }
  };
  return (
    <>

    </>
  );
}

