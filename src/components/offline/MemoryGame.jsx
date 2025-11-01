'use client';

import { useState, useEffect } from 'react';

/**
 * Memory Card Game Component
 * A fun offline game to pass the time while waiting for connection
 */
export default function MemoryGame() {
  const [cards, setCards] = useState([]);
  const [flippedIndices, setFlippedIndices] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [moves, setMoves] = useState(0);
  const [isGameWon, setIsGameWon] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  // Card emojis for the memory game
  const emojis = ['📸', '🎤', '📍', '🎨', '🎵', '⭐', '🎯', '🔥'];

  // Initialize game
  const initializeGame = () => {
    // Create pairs of cards
    const cardPairs = [...emojis, ...emojis];

    // Shuffle cards
    const shuffled = cardPairs
      .map((emoji, index) => ({ id: index, emoji, matched: false }))
      .sort(() => Math.random() - 0.5);

    setCards(shuffled);
    setFlippedIndices([]);
    setMatchedPairs([]);
    setMoves(0);
    setIsGameWon(false);
    setGameStarted(true);
  };

  // Handle card click
  const handleCardClick = (index) => {
    // Don't allow more than 2 cards to be flipped
    if (flippedIndices.length >= 2) return;

    // Don't allow clicking already flipped or matched cards
    if (flippedIndices.includes(index) || matchedPairs.includes(index)) return;

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    // Check for match when 2 cards are flipped
    if (newFlipped.length === 2) {
      setMoves(moves + 1);

      const [first, second] = newFlipped;
      if (cards[first].emoji === cards[second].emoji) {
        // Match found!
        setMatchedPairs([...matchedPairs, first, second]);
        setFlippedIndices([]);

        // Check if game is won
        if (matchedPairs.length + 2 === cards.length) {
          setTimeout(() => setIsGameWon(true), 500);
        }
      } else {
        // No match, flip back after delay
        setTimeout(() => {
          setFlippedIndices([]);
        }, 1000);
      }
    }
  };

  if (!gameStarted) {
    return (
      <div className="text-center py-8">
        <div className="mb-4">
          <div className="text-6xl mb-4">🎮</div>
          <h3 className="text-xl font-bold text-gray-100 mb-2">Memory Game</h3>
          <p className="text-gray-400 mb-6">
            Match the pairs to pass the time while offline!
          </p>
        </div>
        <button
          onClick={initializeGame}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
        >
          Start Game
        </button>
      </div>
    );
  }

  return (
    <div className="py-6">
      {/* Game Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-100">Memory Game</h3>
          <p className="text-sm text-gray-400">Moves: {moves}</p>
        </div>
        <button
          onClick={initializeGame}
          className="bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-sm"
        >
          New Game
        </button>
      </div>

      {/* Game Won Message */}
      {isGameWon && (
        <div className="mb-6 bg-green-900/30 border border-green-600 rounded-lg p-4 text-center">
          <div className="text-4xl mb-2">🎉</div>
          <p className="text-green-400 font-bold text-lg mb-1">Congratulations!</p>
          <p className="text-gray-300 text-sm">
            You won in {moves} moves!
          </p>
        </div>
      )}

      {/* Game Grid */}
      <div className="grid grid-cols-4 gap-3 max-w-md mx-auto">
        {cards.map((card, index) => {
          const isFlipped = flippedIndices.includes(index) || matchedPairs.includes(index);
          const isMatched = matchedPairs.includes(index);

          return (
            <button
              key={card.id}
              onClick={() => handleCardClick(index)}
              disabled={isFlipped}
              className={`
                aspect-square rounded-lg text-3xl font-bold transition-all duration-300
                ${isFlipped
                  ? isMatched
                    ? 'bg-green-600 text-white scale-105'
                    : 'bg-blue-600 text-white'
                  : 'bg-gray-700 hover:bg-gray-600 text-transparent'
                }
                ${!isFlipped && 'cursor-pointer active:scale-95'}
                disabled:cursor-not-allowed
              `}
            >
              {isFlipped ? card.emoji : '?'}
            </button>
          );
        })}
      </div>

      {/* Game Instructions */}
      {!isGameWon && moves === 0 && (
        <p className="text-center text-gray-400 text-sm mt-6">
          Click on cards to find matching pairs
        </p>
      )}
    </div>
  );
}
