import React, { useState, useEffect, useCallback } from 'react';
import { CardData, GameState, Suit, Rank, GameStatus } from './types';
import { createDeck, RANKS, SUITS } from './constants';

export const useCrazyEights = () => {
  const [state, setState] = useState<GameState>({
    deck: [],
    playerHand: [],
    aiHand: [],
    discardPile: [],
    currentTurn: 'player',
    status: 'dealing',
    wildSuit: null,
    winner: null,
  });

  const initGame = useCallback(() => {
    const deck = createDeck();
    const playerHand = deck.splice(0, 8);
    const aiHand = deck.splice(0, 8);
    
    // Find a starting card that isn't an 8
    let firstCardIndex = 0;
    while (deck[firstCardIndex].rank === Rank.EIGHT) {
      firstCardIndex++;
    }
    const discardPile = deck.splice(firstCardIndex, 1);

    setState({
      deck,
      playerHand,
      aiHand,
      discardPile,
      currentTurn: 'player',
      status: 'playing',
      wildSuit: null,
      winner: null,
    });
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const isCardPlayable = (card: CardData) => {
    const topCard = state.discardPile[state.discardPile.length - 1];
    if (card.rank === Rank.EIGHT) return true;
    
    const targetSuit = state.wildSuit || topCard.suit;
    return card.suit === targetSuit || card.rank === topCard.rank;
  };

  const drawCard = (turn: 'player' | 'ai') => {
    if (state.deck.length === 0) {
      // If deck is empty, maybe reshuffle discard pile? 
      // For simplicity, just skip if deck is empty as per rules
      if (turn === 'player') {
        setState(prev => ({ ...prev, currentTurn: 'ai' }));
      } else {
        setState(prev => ({ ...prev, currentTurn: 'player' }));
      }
      return;
    }

    const newDeck = [...state.deck];
    const drawnCard = newDeck.pop()!;
    
    setState(prev => {
      const isPlayer = turn === 'player';
      return {
        ...prev,
        deck: newDeck,
        playerHand: isPlayer ? [...prev.playerHand, drawnCard] : prev.playerHand,
        aiHand: !isPlayer ? [...prev.aiHand, drawnCard] : prev.aiHand,
        currentTurn: isPlayer ? 'ai' : 'player'
      };
    });
  };

  const playCard = (cardId: string) => {
    const isPlayer = state.currentTurn === 'player';
    const hand = isPlayer ? state.playerHand : state.aiHand;
    const card = hand.find(c => c.id === cardId);

    if (!card || !isCardPlayable(card)) return;

    const newHand = hand.filter(c => c.id !== cardId);
    const newDiscardPile = [...state.discardPile, card];

    if (card.rank === Rank.EIGHT) {
      setState(prev => ({
        ...prev,
        [isPlayer ? 'playerHand' : 'aiHand']: newHand,
        discardPile: newDiscardPile,
        status: isPlayer ? 'selecting_suit' : 'playing',
        wildSuit: isPlayer ? null : SUITS[Math.floor(Math.random() * SUITS.length)], // AI picks random suit
        currentTurn: isPlayer ? 'player' : 'player', // If AI plays 8, it's player's turn next (after suit selection)
      }));
      
      if (!isPlayer) {
        // AI played an 8, it already picked a suit above, now switch turn
        setState(prev => ({ ...prev, currentTurn: 'player' }));
      }
    } else {
      setState(prev => ({
        ...prev,
        [isPlayer ? 'playerHand' : 'aiHand']: newHand,
        discardPile: newDiscardPile,
        wildSuit: null,
        currentTurn: isPlayer ? 'ai' : 'player',
      }));
    }

    // Check win condition
    if (newHand.length === 0) {
      setState(prev => ({
        ...prev,
        status: 'game_over',
        winner: isPlayer ? 'player' : 'ai'
      }));
    }
  };

  const selectWildSuit = (suit: Suit) => {
    setState(prev => ({
      ...prev,
      wildSuit: suit,
      status: 'playing',
      currentTurn: 'ai'
    }));
  };

  // AI Logic
  useEffect(() => {
    if (state.currentTurn === 'ai' && state.status === 'playing' && !state.winner) {
      const timer = setTimeout(() => {
        const playableCards = state.aiHand.filter(isCardPlayable);
        if (playableCards.length > 0) {
          // AI strategy: play non-8 cards first, then 8s
          const nonEight = playableCards.find(c => c.rank !== Rank.EIGHT);
          const cardToPlay = nonEight || playableCards[0];
          playCard(cardToPlay.id);
        } else {
          drawCard('ai');
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [state.currentTurn, state.status, state.aiHand, state.discardPile, state.wildSuit]);

  return {
    state,
    playCard,
    drawCard,
    selectWildSuit,
    initGame,
    isCardPlayable
  };
};
