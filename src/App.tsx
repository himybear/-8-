/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useCrazyEights } from './useCrazyEights';
import { Card } from './components/Card';
import { Suit } from './types';
import { getSuitSymbol, getSuitColor } from './constants';
import { Trophy, RotateCcw, Info, User, Bot, Layers } from 'lucide-react';

export default function App() {
  const { state, playCard, drawCard, selectWildSuit, initGame, isCardPlayable } = useCrazyEights();

  const topDiscard = state.discardPile[state.discardPile.length - 1];

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans selection:bg-indigo-100 overflow-hidden flex flex-col">
      {/* Header */}
      <header className="p-4 bg-white border-b border-slate-200 flex justify-between items-center shadow-sm z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <Layers size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">笑语疯狂 8 点</h1>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Crazy Eights</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-full border border-slate-200">
            <div className={`w-2 h-2 rounded-full ${state.currentTurn === 'player' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
            <span className="text-sm font-semibold">{state.currentTurn === 'player' ? '你的回合' : 'AI 正在思考...'}</span>
          </div>
          <button 
            onClick={initGame}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600"
            title="重新开始"
          >
            <RotateCcw size={20} />
          </button>
        </div>
      </header>

      {/* Main Game Area */}
      <main className="flex-1 relative p-4 flex flex-col items-center justify-between max-w-6xl mx-auto w-full">
        
        {/* AI Hand */}
        <section className="w-full flex flex-col items-center gap-2">
          <div className="flex items-center gap-2 text-slate-500 mb-2">
            <Bot size={18} />
            <span className="text-sm font-bold uppercase tracking-widest">AI 对手 ({state.aiHand.length})</span>
          </div>
          <div className="flex justify-center -space-x-12 sm:-space-x-16 h-44 items-start">
            <AnimatePresence>
              {state.aiHand.map((card, idx) => (
                <Card 
                  key={card.id} 
                  card={card} 
                  isFaceUp={false} 
                  index={idx}
                  className="scale-90 origin-top"
                />
              ))}
            </AnimatePresence>
          </div>
        </section>

        {/* Center: Draw & Discard */}
        <section className="flex flex-col sm:flex-row items-center gap-8 sm:gap-16 my-8">
          {/* Draw Pile */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              {state.deck.length > 0 && (
                <div className="absolute -top-1 -left-1 w-24 h-36 sm:w-28 sm:h-40 bg-indigo-800 rounded-xl translate-x-2 translate-y-2" />
              )}
              <Card 
                card={{ id: 'back', suit: Suit.SPADES, rank: '8' as any }} 
                isFaceUp={false} 
                onClick={() => state.currentTurn === 'player' && drawCard('player')}
                isPlayable={state.currentTurn === 'player' && !state.playerHand.some(isCardPlayable)}
                className={state.deck.length === 0 ? 'opacity-20' : ''}
              />
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-white px-2 py-0.5 rounded-full border border-slate-200 shadow-sm text-[10px] font-bold text-slate-500">
                {state.deck.length} 张
              </div>
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">摸牌堆</span>
          </div>

          {/* Discard Pile */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <AnimatePresence mode="popLayout">
                {topDiscard && (
                  <Card 
                    key={topDiscard.id}
                    card={topDiscard} 
                    isFaceUp={true}
                    className="shadow-xl"
                  />
                )}
              </AnimatePresence>
              
              {state.wildSuit && (
                <motion.div 
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ scale: 1, rotate: 0 }}
                  className="absolute -top-4 -right-4 w-12 h-12 bg-white rounded-full shadow-lg border-2 border-indigo-500 flex items-center justify-center text-2xl z-20"
                >
                  <span className={getSuitColor(state.wildSuit)}>{getSuitSymbol(state.wildSuit)}</span>
                </motion.div>
              )}
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">弃牌堆</span>
          </div>
        </section>

        {/* Player Hand */}
        <section className="w-full flex flex-col items-center gap-2">
          <div className="flex items-center gap-2 text-indigo-600 mb-2">
            <User size={18} />
            <span className="text-sm font-bold uppercase tracking-widest">你的手牌 ({state.playerHand.length})</span>
          </div>
          <div className="flex justify-center -space-x-12 sm:-space-x-16 h-44 items-end overflow-x-auto w-full pb-4 px-8">
            <AnimatePresence>
              {state.playerHand.map((card, idx) => (
                <Card 
                  key={card.id} 
                  card={card} 
                  isFaceUp={true} 
                  index={idx}
                  isPlayable={state.currentTurn === 'player' && isCardPlayable(card)}
                  onClick={() => playCard(card.id)}
                  className="hover:z-50 transition-all"
                />
              ))}
            </AnimatePresence>
          </div>
        </section>
      </main>

      {/* Wild Suit Selector Modal */}
      <AnimatePresence>
        {state.status === 'selecting_suit' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-3xl p-8 shadow-2xl max-w-sm w-full text-center"
            >
              <h2 className="text-2xl font-black mb-2">选择新花色</h2>
              <p className="text-slate-500 mb-8">你打出了 8！请指定接下来的花色。</p>
              
              <div className="grid grid-cols-2 gap-4">
                {[Suit.HEARTS, Suit.DIAMONDS, Suit.CLUBS, Suit.SPADES].map(suit => (
                  <button
                    key={suit}
                    onClick={() => selectWildSuit(suit)}
                    className={`
                      p-6 rounded-2xl border-2 border-slate-100 hover:border-indigo-500 hover:bg-indigo-50 
                      transition-all flex flex-col items-center gap-2 group
                    `}
                  >
                    <span className={`text-4xl group-hover:scale-125 transition-transform ${getSuitColor(suit)}`}>
                      {getSuitSymbol(suit)}
                    </span>
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-400 group-hover:text-indigo-600">
                      {suit === Suit.HEARTS ? '红心' : suit === Suit.DIAMONDS ? '方块' : suit === Suit.CLUBS ? '梅花' : '黑桃'}
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Over Modal */}
      <AnimatePresence>
        {state.status === 'game_over' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.8, rotate: -5 }}
              animate={{ scale: 1, rotate: 0 }}
              className="bg-white rounded-[2rem] p-10 shadow-2xl max-w-md w-full text-center relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-indigo-600" />
              
              <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6 text-yellow-600">
                <Trophy size={40} />
              </div>
              
              <h2 className="text-4xl font-black mb-2">
                {state.winner === 'player' ? '你赢了！' : 'AI 获胜'}
              </h2>
              <p className="text-slate-500 mb-10">
                {state.winner === 'player' ? '太棒了！你清空了所有手牌。' : '再接再厉，下次一定能赢！'}
              </p>
              
              <button
                onClick={initGame}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-lg shadow-xl shadow-indigo-200 transition-all flex items-center justify-center gap-2"
              >
                <RotateCcw size={20} />
                再玩一局
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer Info */}
      <footer className="p-4 bg-white border-t border-slate-200 flex justify-center items-center gap-6 text-slate-400">
        <div className="flex items-center gap-1.5">
          <Info size={14} />
          <span className="text-[10px] font-bold uppercase tracking-widest">规则：匹配花色或点数，8 是万能牌</span>
        </div>
      </footer>
    </div>
  );
}
