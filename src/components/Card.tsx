import React from 'react';
import { motion } from 'motion/react';
import { CardData, Suit } from '../types';
import { getSuitColor, getSuitSymbol } from '../constants';

interface CardProps {
  card: CardData;
  isFaceUp?: boolean;
  onClick?: () => void;
  isPlayable?: boolean;
  className?: string;
  index?: number;
}

export const Card: React.FC<CardProps> = ({ 
  card, 
  isFaceUp = true, 
  onClick, 
  isPlayable = false,
  className = "",
  index = 0
}) => {
  return (
    <motion.div
      layout
      initial={{ scale: 0.8, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      whileHover={isPlayable ? { y: -15, scale: 1.05 } : {}}
      transition={{ delay: index * 0.05, type: "spring", stiffness: 300, damping: 20 }}
      onClick={isPlayable ? onClick : undefined}
      className={`
        relative w-24 h-36 sm:w-28 sm:h-40 rounded-xl shadow-lg cursor-pointer
        flex flex-col items-center justify-center border-2
        ${isFaceUp ? 'bg-white border-slate-200' : 'bg-indigo-700 border-indigo-800'}
        ${isPlayable ? 'ring-4 ring-emerald-400 ring-offset-2' : ''}
        ${className}
      `}
    >
      {isFaceUp ? (
        <>
          <div className={`absolute top-2 left-2 font-bold text-lg leading-none ${getSuitColor(card.suit)}`}>
            {card.rank}
            <div className="text-sm">{getSuitSymbol(card.suit)}</div>
          </div>
          
          <div className={`text-4xl ${getSuitColor(card.suit)}`}>
            {getSuitSymbol(card.suit)}
          </div>
          
          <div className={`absolute bottom-2 right-2 font-bold text-lg leading-none rotate-180 ${getSuitColor(card.suit)}`}>
            {card.rank}
            <div className="text-sm">{getSuitSymbol(card.suit)}</div>
          </div>
        </>
      ) : (
        <div className="w-full h-full flex items-center justify-center p-2">
          <div className="w-full h-full border-2 border-indigo-400/30 rounded-lg flex items-center justify-center">
            <div className="text-indigo-300/50 transform rotate-45 text-4xl">♠</div>
          </div>
        </div>
      )}
    </motion.div>
  );
};
