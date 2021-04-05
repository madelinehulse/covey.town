import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    useDisclosure,
    Button,
    Alert,
    AlertIcon,
    AlertTitle,
    AlertDescription,
    CloseButton,
    VStack,
    Container,
    Image,
    Box,
  } from "@chakra-ui/react";
import React, { useEffect, useState } from 'react';
import useNearbyPlayers from '../../hooks/useNearbyPlayers';
import GameBoard from '../world/GameBoard';
import * as board from "./checker-board.png";

// interface Props {
//     showing : boolean;
// }

export default function Popup(): JSX.Element {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { nearbyPlayers } = useNearbyPlayers();
  const hasNearbyPlayer = nearbyPlayers.length > 0;

  return (
    <>
      <Button top="60" left="80" style={{ display: hasNearbyPlayer ? "block" : "none" }} height="148px" width="300px" onClick={onOpen}>Play Checkers</Button>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Modal Title</ModalHeader>
          <ModalCloseButton />
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              Close
            </Button>
            <Button variant="ghost">Secondary Action</Button>
          </ModalFooter>
          <Box boxSize="sm">
            <Image src="./checker-board.png" alt="Checkerboard" />
          </Box>
        </ModalContent>
      </Modal>
    </>
  )
  
  }