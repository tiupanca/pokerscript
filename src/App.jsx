import React, { useState } from 'react';
import { Play, BookOpen, Code, Zap, AlertCircle, CheckCircle, Bug, Pause, SkipForward, RotateCcw, Circle } from 'lucide-react';

// Interpretador PokerScript com suporte a debugging
class PokerScriptInterpreter {
  constructor() {
    this.reset();
  }

  reset() {
    this.variables = {};
    this.output = [];
    this.deck = this.createDeck();
    this.error = null;
    this.executionSteps = [];
    this.currentStep = 0;
    this.breakpoints = new Set();
  }

  createDeck() {
    const suits = ['♠', '♥', '♦', '♣'];
    const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    const deck = [];
    for (let suit of suits) {
      for (let rank of ranks) {
        deck.push({ rank, suit, value: this.getCardValue(rank) });
      }
    }
    return deck;
  }

  getCardValue(rank) {
    const values = { '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14 };
    return values[rank];
  }

  shuffle(deck) {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  log(message) {
    this.output.push(message);
  }

  dealCards(deck, count) {
    return deck.splice(0, count);
  }

  checkPair(hand) {
    if (hand.length < 2) return false;
    const ranks = hand.map(c => c.rank);
    return new Set(ranks).size < ranks.length;
  }

  checkFlush(cards) {
    if (cards.length < 5) return false;
    const suits = cards.map(c => c.suit);
    const suitCounts = {};
    suits.forEach(s => suitCounts[s] = (suitCounts[s] || 0) + 1);
    return Object.values(suitCounts).some(count => count >= 5);
  }

  checkStraight(cards) {
    if (cards.length < 5) return false;
    const values = [...new Set(cards.map(c => c.value))].sort((a, b) => a - b);
    for (let i = 0; i <= values.length - 5; i++) {
      let isStraight = true;
      for (let j = 0; j < 4; j++) {
        if (values[i + j + 1] - values[i + j] !== 1) {
          isStraight = false;
          break;
        }
      }
      if (isStraight) return true;
    }
    return false;
  }

  getHandStrength(hand, board = []) {
    const allCards = [...hand, ...board];
    if (this.checkFlush(allCards) && this.checkStraight(allCards)) return { name: 'Straight Flush', value: 8 };
    
    const ranks = allCards.map(c => c.rank);
    const rankCounts = {};
    ranks.forEach(r => rankCounts[r] = (rankCounts[r] || 0) + 1);
    const counts = Object.values(rankCounts).sort((a, b) => b - a);
    
    if (counts[0] === 4) return { name: 'Quadra', value: 7 };
    if (counts[0] === 3 && counts[1] === 2) return { name: 'Full House', value: 6 };
    if (this.checkFlush(allCards)) return { name: 'Flush', value: 5 };
    if (this.checkStraight(allCards)) return { name: 'Sequência', value: 4 };
    if (counts[0] === 3) return { name: 'Trinca', value: 3 };
    if (counts[0] === 2 && counts[1] === 2) return { name: 'Dois Pares', value: 2 };
    if (counts[0] === 2) return { name: 'Par', value: 1 };
    return { name: 'Carta Alta', value: 0 };
  }

  captureState() {
    return {
      variables: JSON.parse(JSON.stringify(this.variables)),
      output: [...this.output]
    };
  }

  execute(code, debugMode = false) {
    this.reset();
    this.executionSteps = [];
    
    try {
      const lines = code.split('\n').map((l, idx) => ({ line: l.trim(), lineNumber: idx + 1 }))
        .filter(l => l.line && !l.line.startsWith('//'));
      
      if (debugMode) {
        for (let i = 0; i < lines.length; i++) {
          const { line, lineNumber } = lines[i];
          this.executionSteps.push({
            lineNumber,
            line,
            stateBefore: this.captureState(),
            output: ''
          });
          
          const outputBefore = this.output.length;
          this.executeLine(line);
          const outputAfter = this.output.slice(outputBefore).join('\n');
          
          this.executionSteps[i].output = outputAfter;
          this.executionSteps[i].stateAfter = this.captureState();
        }
        
        return { success: true, output: this.output.join('\n'), steps: this.executionSteps };
      } else {
        for (let { line } of lines) {
          this.executeLine(line);
        }
        
        return { success: true, output: this.output.join('\n') };
      }
    } catch (error) {
      return { success: false, output: this.output.join('\n'), error: error.message };
    }
  }

  executeLine(line) {
    if (line.includes('deck') && line.includes('shuffle')) {
      const varName = line.split('deck')[1].split('=')[0].trim();
      this.variables[varName] = this.shuffle([...this.deck]);
      this.log(`✓ Deck '${varName}' criado e embaralhado (52 cartas)`);
    }
    else if (line.startsWith('hand')) {
      const hands = line.replace('hand', '').replace(';', '').split(',').map(h => h.trim());
      hands.forEach(h => {
        this.variables[h] = [];
        this.log(`✓ Mão '${h}' criada`);
      });
    }
    else if (line.includes('deal') && line.includes('from') && line.includes('to')) {
      const match = line.match(/deal (\d+) from (\w+) to (\w+)/);
      if (match) {
        const [, count, deckName, handName] = match;
        const cards = this.dealCards(this.variables[deckName], parseInt(count));
        this.variables[handName] = cards;
        const cardStr = cards.map(c => `${c.rank}${c.suit}`).join(', ');
        this.log(`✓ ${count} carta(s) para ${handName}: [${cardStr}]`);
      }
    }
    else if (line.includes('board') && line.includes('flop')) {
      const varName = line.split('board')[1].split('=')[0].trim();
      const deckName = line.match(/flop\((\w+)\)/)[1];
      const cards = this.dealCards(this.variables[deckName], 3);
      this.variables[varName] = cards;
      const cardStr = cards.map(c => `${c.rank}${c.suit}`).join(', ');
      this.log(`✓ Flop: [${cardStr}]`);
    }
    else if (line.includes('turn')) {
      const match = line.match(/turn\((\w+),\s*(\w+)\)/);
      if (match) {
        const [, deckName, boardName] = match;
        const card = this.dealCards(this.variables[deckName], 1)[0];
        this.variables[boardName].push(card);
        this.log(`✓ Turn: [${card.rank}${card.suit}]`);
      }
    }
    else if (line.includes('river')) {
      const match = line.match(/river\((\w+),\s*(\w+)\)/);
      if (match) {
        const [, deckName, boardName] = match;
        const card = this.dealCards(this.variables[deckName], 1)[0];
        this.variables[boardName].push(card);
        this.log(`✓ River: [${card.rank}${card.suit}]`);
      }
    }
    else if (line.includes('chip') && line.includes('=')) {
      const [varPart, valuePart] = line.split('=');
      const varName = varPart.replace('chip', '').trim();
      const value = parseInt(valuePart.replace(';', '').trim());
      this.variables[varName] = value;
      this.log(`✓ '${varName}' = ${value} fichas`);
    }
    else if (line.includes('if') && line.includes('has')) {
      const match = line.match(/if\s*\((\w+)\s+has\s+(\w+)\)/);
      if (match) {
        const [, handName, combo] = match;
        const hand = this.variables[handName] || [];
        let hasCombo = false;
        
        if (combo === 'pair') hasCombo = this.checkPair(hand);
        else if (combo === 'flush') hasCombo = this.checkFlush(hand);
        
        if (hasCombo) {
          this.log(`✓ ${handName} tem ${combo}!`);
        }
      }
    }
    else if (line.includes('bet') && line.includes('from')) {
      const match = line.match(/bet (\d+) from (\w+)/);
      if (match) {
        const [, amount, player] = match;
        this.log(`✓ ${player} aposta: ${amount} fichas`);
      }
    }
    else if (line.includes('call from')) {
      const player = line.match(/call from (\w+)/)[1];
      this.log(`✓ ${player} paga`);
    }
    else if (line.includes('showdown')) {
      this.log(`\n🏆 Showdown:`);
    }
    else if (line.includes('compare') && line.includes('with')) {
      const match = line.match(/compare (\w+),\s*(\w+) with (\w+)/);
      if (match) {
        const [, p1, p2, board] = match;
        const hand1 = this.variables[p1] || [];
        const hand2 = this.variables[p2] || [];
        const community = this.variables[board] || [];
        
        const strength1 = this.getHandStrength(hand1, community);
        const strength2 = this.getHandStrength(hand2, community);
        
        this.log(`${p1}: ${strength1.name}`);
        this.log(`${p2}: ${strength2.name}`);
        
        if (strength1.value > strength2.value) {
          this.log(`\n🎊 ${p1} vence!`);
        } else if (strength2.value > strength1.value) {
          this.log(`\n🎊 ${p2} vence!`);
        } else {
          this.log(`\n🤝 Empate!`);
        }
      }
    }
  }
}

const PokerScriptIDE = () => {
  const [activeTab, setActiveTab] = useState('playground');
  const [code, setCode] = useState(`deck myDeck = shuffle(standard52);
hand player1, player2;

deal 2 from myDeck to player1;
deal 2 from myDeck to player2;

board community = flop(myDeck);

if (player1 has pair) {
  bet 100 from player1;
  call from player2;
}

turn(myDeck, community);
river(myDeck, community);

showdown {
  compare player1, player2 with community;
}`);
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [hasError, setHasError] = useState(false);
  
  const [debugMode, setDebugMode] = useState(false);
  const [debugSteps, setDebugSteps] = useState([]);
  const [currentDebugStep, setCurrentDebugStep] = useState(-1);
  const [isPaused, setIsPaused] = useState(false);

  const interpreter = new PokerScriptInterpreter();

  const executeCode = (debug = false) => {
    setIsRunning(true);
    setHasError(false);
    setDebugMode(debug);
    
    setTimeout(() => {
      const result = interpreter.execute(code, debug);
      
      if (result.success) {
        if (debug) {
          setDebugSteps(result.steps);
          setCurrentDebugStep(0);
          setIsPaused(true);
          setOutput(result.steps[0]?.output || '');
        } else {
          setOutput(`🎴 Executando PokerScript...\n\n${result.output}`);
        }
        setHasError(false);
      } else {
        setOutput(`❌ Erro:\n\n${result.error}\n\n${result.output}`);
        setHasError(true);
      }
      
      setIsRunning(false);
    }, 100);
  };

  const stepForward = () => {
    if (currentDebugStep < debugSteps.length - 1) {
      const nextStep = currentDebugStep + 1;
      setCurrentDebugStep(nextStep);
      
      const accumulatedOutput = debugSteps
        .slice(0, nextStep + 1)
        .map(s => s.output)
        .filter(Boolean)
        .join('\n');
      setOutput(accumulatedOutput);
    }
  };

  const continueExecution = () => {
    setIsPaused(false);
    const finalOutput = debugSteps.map(s => s.output).filter(Boolean).join('\n');
    setOutput(`🎴 Executando...\n\n${finalOutput}`);
    setCurrentDebugStep(debugSteps.length - 1);
  };

  const resetDebug = () => {
    setDebugMode(false);
    setDebugSteps([]);
    setCurrentDebugStep(-1);
    setIsPaused(false);
    setOutput('');
  };

  const renderVariablesPanel = () => {
    if (!debugMode || currentDebugStep < 0) return null;
    
    const currentState = debugSteps[currentDebugStep]?.stateAfter || {};
    const vars = currentState.variables || {};
    
    return (
      <div className="bg-green-900/30 border border-yellow-600/20 rounded p-4 mt-4">
        <h3 className="text-yellow-400 font-bold mb-2 flex items-center gap-2">
          <Bug size={18} />
          Estado das Variáveis
        </h3>
        <div className="space-y-2 text-sm font-mono">
          {Object.keys(vars).length === 0 ? (
            <p className="text-green-300">Nenhuma variável ainda</p>
          ) : (
            Object.entries(vars).map(([key, value]) => (
              <div key={key} className="bg-black/30 p-2 rounded">
                <span className="text-yellow-300">{key}</span>
                <span className="text-green-300"> = </span>
                <span className="text-blue-300">
                  {Array.isArray(value) 
                    ? value.length > 0 && value[0].rank 
                      ? `[${value.map(c => `${c.rank}${c.suit}`).join(', ')}]`
                      : `Array(${value.length})`
                    : JSON.stringify(value)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-emerald-900 p-6">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-5xl font-bold text-yellow-400 mb-2 drop-shadow-lg">
            ♠️ PokerScript ♥️
          </h1>
          <p className="text-green-100 text-lg">Linguagem de programação inspirada em poker</p>
          <p className="text-green-300 text-sm mt-2">✨ Com interpretador e debugger visual!</p>
        </header>

        <div className="bg-green-950/50 backdrop-blur rounded-lg border-2 border-yellow-600/30 shadow-2xl">
          <div className="flex border-b border-yellow-600/30">
            {[
              { id: 'overview', label: 'Visão Geral', icon: BookOpen },
              { id: 'playground', label: 'Playground', icon: Play }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-yellow-600 text-white'
                    : 'text-green-200 hover:bg-green-800/50'
                }`}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="text-green-100 space-y-6">
                <section>
                  <h2 className="text-2xl font-bold text-yellow-400 mb-3">🎯 Sobre</h2>
                  <p className="leading-relaxed">
                    PokerScript é uma linguagem imperativa onde toda estrutura gira em torno de poker: decks, mãos, apostas e estratégia.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-yellow-400 mb-3">🐛 Debugger Visual</h2>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Execução passo a passo</li>
                    <li>Visualização de variáveis em tempo real</li>
                    <li>Destaque da linha atual</li>
                    <li>Output progressivo</li>
                  </ul>
                </section>
              </div>
            )}

            {activeTab === 'playground' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 bg-blue-900/30 border border-blue-500/30 rounded p-3">
                  <AlertCircle className="text-blue-400" size={20} />
                  <span className="text-blue-200 text-sm">
                    <strong>Interpretador Funcional:</strong> Execute código PokerScript real com debugger visual!
                  </span>
                </div>
                
                <div>
                  <label className="block text-yellow-400 font-bold mb-2">Editor PokerScript</label>
                  <div className="relative">
                    <div className="absolute left-0 top-0 bottom-0 w-12 bg-black/40 flex flex-col text-green-500 text-xs font-mono pt-4 text-right pr-2">
                      {code.split('\n').map((_, i) => (
                        <div key={i} className={`leading-6 ${debugMode && currentDebugStep >= 0 && debugSteps[currentDebugStep]?.lineNumber === i + 1 ? 'bg-yellow-500/30 text-yellow-300 font-bold' : ''}`}>
                          {i + 1}
                        </div>
                      ))}
                    </div>
                    <textarea
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      className="w-full h-80 bg-black/60 text-green-100 p-4 pl-16 rounded border border-yellow-600/30 font-mono text-sm focus:outline-none focus:border-yellow-400 leading-6"
                      spellCheck={false}
                    />
                  </div>
                </div>
                
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => executeCode(false)}
                    disabled={isRunning || debugMode}
                    className="bg-yellow-600 hover:bg-yellow-500 disabled:bg-gray-600 text-white font-bold py-3 px-6 rounded flex items-center gap-2 transition-all"
                  >
                    <Play size={20} />
                    Executar
                  </button>
                  
                  <button
                    onClick={() => executeCode(true)}
                    disabled={isRunning || debugMode}
                    className="bg-purple-600 hover:bg-purple-500 disabled:bg-gray-600 text-white font-bold py-3 px-6 rounded flex items-center gap-2 transition-all"
                  >
                    <Bug size={20} />
                    Debug Mode
                  </button>
                  
                  {debugMode && isPaused && (
                    <>
                      <button
                        onClick={stepForward}
                        disabled={currentDebugStep >= debugSteps.length - 1}
                        className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 text-white font-bold py-3 px-6 rounded flex items-center gap-2"
                      >
                        <SkipForward size={20} />
                        Step
                      </button>
                      
                      <button
                        onClick={continueExecution}
                        className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-6 rounded flex items-center gap-2"
                      >
                        <Play size={20} />
                        Continue
                      </button>
                    </>
                  )}
                  
                  {debugMode && (
                    <button
                      onClick={resetDebug}
                      className="bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-6 rounded flex items-center gap-2"
                    >
                      <RotateCcw size={20} />
                      Reset
                    </button>
                  )}
                </div>
                
                {debugMode && (
                  <div className="bg-green-900/30 border border-yellow-600/20 rounded p-3 flex items-center gap-2">
                    <Pause className="text-yellow-400" size={18} />
                    <span className="text-yellow-300 text-sm font-bold">
                      Modo Debug Ativo - Linha {debugSteps[currentDebugStep]?.lineNumber || 0} de {debugSteps.length}
                    </span>
                  </div>
                )}
                
                {output && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <label className="block text-yellow-400 font-bold">Output</label>
                      {!hasError && <CheckCircle className="text-green-400" size={20} />}
                      {hasError && <AlertCircle className="text-red-400" size={20} />}
                    </div>
                    <pre className={`${hasError ? 'bg-red-950/60 border-red-500/30' : 'bg-black/60 border-yellow-600/30'} text-green-100 p-4 rounded border whitespace-pre-wrap font-mono text-sm`}>
                      {output}
                    </pre>
                  </div>
                )}
                
                {renderVariablesPanel()}
              </div>
            )}
          </div>
        </div>

        <footer className="mt-8 text-center text-green-300 text-sm">
          <p>♣️ PokerScript v2.0 - "All in on programming" ♦️</p>
        </footer>
      </div>
    </div>
  );
};

export default PokerScriptIDE;