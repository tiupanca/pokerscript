import React, { useState } from 'react';
import { Play, BookOpen, Code, Zap, AlertCircle, CheckCircle } from 'lucide-react';

// Interpretador PokerScript
class PokerScriptInterpreter {
  constructor() {
    this.reset();
  }

  reset() {
    this.variables = {};
    this.output = [];
    this.deck = this.createDeck();
    this.error = null;
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

  execute(code) {
    this.reset();
    
    try {
      const lines = code.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('//'));
      
      for (let line of lines) {
        this.executeLine(line);
      }
      
      return { success: true, output: this.output.join('\n') };
    } catch (error) {
      return { success: false, output: this.output.join('\n'), error: error.message };
    }
  }

  executeLine(line) {
    // deck declaration and shuffle
    if (line.includes('deck') && line.includes('shuffle')) {
      const varName = line.split('deck')[1].split('=')[0].trim();
      this.variables[varName] = this.shuffle([...this.deck]);
      this.log(`✓ Deck '${varName}' criado e embaralhado (52 cartas)`);
    }
    
    // hand declaration
    else if (line.startsWith('hand')) {
      const hands = line.replace('hand', '').replace(';', '').split(',').map(h => h.trim());
      hands.forEach(h => {
        this.variables[h] = [];
        this.log(`✓ Mão '${h}' criada`);
      });
    }
    
    // deal cards
    else if (line.includes('deal') && line.includes('from') && line.includes('to')) {
      const match = line.match(/deal (\d+) from (\w+) to (\w+)/);
      if (match) {
        const [, count, deckName, handName] = match;
        const cards = this.dealCards(this.variables[deckName], parseInt(count));
        this.variables[handName] = cards;
        const cardStr = cards.map(c => `${c.rank}${c.suit}`).join(', ');
        this.log(`✓ ${count} carta(s) distribuída(s) para ${handName}: [${cardStr}]`);
      }
    }
    
    // board/flop
    else if (line.includes('board') && line.includes('flop')) {
      const varName = line.split('board')[1].split('=')[0].trim();
      const deckName = line.match(/flop\((\w+)\)/)[1];
      const cards = this.dealCards(this.variables[deckName], 3);
      this.variables[varName] = cards;
      const cardStr = cards.map(c => `${c.rank}${c.suit}`).join(', ');
      this.log(`✓ Flop: [${cardStr}]`);
    }
    
    // turn
    else if (line.includes('turn')) {
      const match = line.match(/turn\((\w+),\s*(\w+)\)/);
      if (match) {
        const [, deckName, boardName] = match;
        const card = this.dealCards(this.variables[deckName], 1)[0];
        this.variables[boardName].push(card);
        this.log(`✓ Turn: [${card.rank}${card.suit}]`);
      }
    }
    
    // river
    else if (line.includes('river')) {
      const match = line.match(/river\((\w+),\s*(\w+)\)/);
      if (match) {
        const [, deckName, boardName] = match;
        const card = this.dealCards(this.variables[deckName], 1)[0];
        this.variables[boardName].push(card);
        this.log(`✓ River: [${card.rank}${card.suit}]`);
      }
    }
    
    // chip declaration
    else if (line.includes('chip') && line.includes('=')) {
      const [varPart, valuePart] = line.split('=');
      const varName = varPart.replace('chip', '').trim();
      const value = parseInt(valuePart.replace(';', '').trim());
      this.variables[varName] = value;
      this.log(`✓ Variável '${varName}' = ${value} fichas`);
    }
    
    // if statements (simplified)
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
    
    // bet
    else if (line.includes('bet') && line.includes('from')) {
      const match = line.match(/bet (\d+) from (\w+)/);
      if (match) {
        const [, amount, player] = match;
        this.log(`✓ ${player} aposta: ${amount} fichas`);
      }
    }
    
    // call
    else if (line.includes('call from')) {
      const player = line.match(/call from (\w+)/)[1];
      this.log(`✓ ${player} paga a aposta`);
    }
    
    // showdown
    else if (line.includes('showdown')) {
      this.log(`\n🏆 Showdown:`);
    }
    
    // compare
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
          this.log(`\n🎊 ${p1} vence com ${strength1.name}!`);
        } else if (strength2.value > strength1.value) {
          this.log(`\n🎊 ${p2} vence com ${strength2.name}!`);
        } else {
          this.log(`\n🤝 Empate com ${strength1.name}!`);
        }
      }
    }
  }
}

const PokerScriptIDE = () => {
  const [activeTab, setActiveTab] = useState('overview');
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

  const interpreter = new PokerScriptInterpreter();

  const executeCode = () => {
    setIsRunning(true);
    setHasError(false);
    
    setTimeout(() => {
      const result = interpreter.execute(code);
      
      if (result.success) {
        setOutput(`🎴 Executando PokerScript...\n\n${result.output}`);
        setHasError(false);
      } else {
        setOutput(`❌ Erro de execução:\n\n${result.error}\n\nOutput até o erro:\n${result.output}`);
        setHasError(true);
      }
      
      setIsRunning(false);
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-emerald-900 p-6">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-5xl font-bold text-yellow-400 mb-2 drop-shadow-lg">
            ♠️ PokerScript ♥️
          </h1>
          <p className="text-green-100 text-lg">A linguagem de programação inspirada em poker</p>
          <p className="text-green-300 text-sm mt-2">✨ Agora com interpretador funcional!</p>
        </header>

        <div className="bg-green-950/50 backdrop-blur rounded-lg border-2 border-yellow-600/30 shadow-2xl">
          <div className="flex border-b border-yellow-600/30">
            {[
              { id: 'overview', label: 'Visão Geral', icon: BookOpen },
              { id: 'syntax', label: 'Sintaxe', icon: Code },
              { id: 'examples', label: 'Exemplos', icon: Zap },
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
                  <h2 className="text-2xl font-bold text-yellow-400 mb-3">🎯 Conceito</h2>
                  <p className="leading-relaxed">
                    PokerScript é uma linguagem imperativa e fortemente tipada onde toda a estrutura
                    gira em torno dos conceitos de poker: decks, mãos, apostas, e estratégia.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-yellow-400 mb-3">🃏 Tipos Primitivos</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-green-900/50 p-4 rounded border border-yellow-600/20">
                      <code className="text-yellow-300 font-bold">chip</code>
                      <p className="text-sm mt-1">Números inteiros (fichas)</p>
                    </div>
                    <div className="bg-green-900/50 p-4 rounded border border-yellow-600/20">
                      <code className="text-yellow-300 font-bold">odds</code>
                      <p className="text-sm mt-1">Números decimais (probabilidades)</p>
                    </div>
                    <div className="bg-green-900/50 p-4 rounded border border-yellow-600/20">
                      <code className="text-yellow-300 font-bold">card</code>
                      <p className="text-sm mt-1">Uma carta individual</p>
                    </div>
                    <div className="bg-green-900/50 p-4 rounded border border-yellow-600/20">
                      <code className="text-yellow-300 font-bold">bool</code>
                      <p className="text-sm mt-1">Verdadeiro/Falso (allin/fold)</p>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-yellow-400 mb-3">🎴 Tipos Compostos</h2>
                  <div className="space-y-2 bg-green-900/50 p-4 rounded border border-yellow-600/20 font-mono text-sm">
                    <div><code className="text-yellow-300">deck</code> - Coleção de 52 cartas</div>
                    <div><code className="text-yellow-300">hand</code> - Mão de um jogador (2 cartas no Texas Hold'em)</div>
                    <div><code className="text-yellow-300">board</code> - Cartas comunitárias (flop/turn/river)</div>
                    <div><code className="text-yellow-300">stack</code> - Pilha de fichas de um jogador</div>
                    <div><code className="text-yellow-300">pot</code> - Pote central de apostas</div>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-yellow-400 mb-3">♠️ Filosofia</h2>
                  <p className="leading-relaxed">
                    Programar em PokerScript é como jogar poker: você gerencia recursos (fichas),
                    toma decisões baseadas em probabilidades, e lida com incerteza. Loops são "rounds",
                    condicionais são "reads", e funções são "plays".
                  </p>
                </section>
              </div>
            )}

            {activeTab === 'syntax' && (
              <div className="text-green-100 space-y-6">
                <section>
                  <h2 className="text-2xl font-bold text-yellow-400 mb-3">📝 Declarações</h2>
                  <pre className="bg-black/40 p-4 rounded border border-yellow-600/20 overflow-x-auto">
{`chip myStack = 1000;
deck mainDeck = shuffle(standard52);
hand hero, villain;
board flop = empty;`}
                  </pre>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-yellow-400 mb-3">🎲 Controle de Fluxo</h2>
                  <pre className="bg-black/40 p-4 rounded border border-yellow-600/20 overflow-x-auto">
{`// Condicional (read)
if (hero has flush) {
  bet 500 from hero;
} else if (hero has pair) {
  check;
} else {
  fold hero;
}

// Loop (round)
round 10 times {
  deal 2 from deck to player;
  if (player has monster) break;
}

// Loop condicional
while (pot < 1000) {
  bet 50 from player1;
  call from player2;
}`}
                  </pre>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-yellow-400 mb-3">🎯 Funções (Plays)</h2>
                  <pre className="bg-black/40 p-4 rounded border border-yellow-600/20 overflow-x-auto">
{`play calculateOuts(hand h, board b) -> chip {
  chip outs = 0;
  if (h needs one for flush) outs += 9;
  if (h needs one for straight) outs += 8;
  return outs;
}

// Função de alto nível
play bluff(hand h, chip amount) -> bool {
  if (random() > 0.7) {
    raise amount;
    return allin;
  }
  return fold;
}`}
                  </pre>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-yellow-400 mb-3">🔍 Operadores Especiais</h2>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-black/40 p-3 rounded border border-yellow-600/20">
                      <code className="text-yellow-300">has</code> - Verifica combinação
                      <pre className="text-xs mt-1">if (hand has straight)</pre>
                    </div>
                    <div className="bg-black/40 p-3 rounded border border-yellow-600/20">
                      <code className="text-yellow-300">needs</code> - Verifica outs
                      <pre className="text-xs mt-1">if (hand needs one for flush)</pre>
                    </div>
                    <div className="bg-black/40 p-3 rounded border border-yellow-600/20">
                      <code className="text-yellow-300">vs</code> - Compara mãos
                      <pre className="text-xs mt-1">if (hand1 vs hand2 wins)</pre>
                    </div>
                    <div className="bg-black/40 p-3 rounded border border-yellow-600/20">
                      <code className="text-yellow-300">@</code> - Acessa carta
                      <pre className="text-xs mt-1">card top = deck@0</pre>
                    </div>
                  </div>
                </section>
              </div>
            )}

            {activeTab === 'examples' && (
              <div className="space-y-6">
                <section>
                  <h3 className="text-xl font-bold text-yellow-400 mb-3">🎰 Exemplo Básico (Clique para Testar!)</h3>
                  <button
                    onClick={() => {
                      setCode(`deck myDeck = shuffle(standard52);
hand player1, player2;

deal 2 from myDeck to player1;
deal 2 from myDeck to player2;

board community = flop(myDeck);
turn(myDeck, community);
river(myDeck, community);

showdown {
  compare player1, player2 with community;
}`);
                      setActiveTab('playground');
                    }}
                    className="text-sm bg-yellow-600 hover:bg-yellow-500 text-white px-4 py-2 rounded transition-all"
                  >
                    Carregar no Playground
                  </button>
                </section>

                <section>
                  <h3 className="text-xl font-bold text-yellow-400 mb-3">🤖 Sistema de Apostas</h3>
                  <pre className="bg-black/40 p-4 rounded border border-yellow-600/20 overflow-x-auto text-green-100 text-sm">
{`deck myDeck = shuffle(standard52);
hand hero, villain;
chip pot = 0;

deal 2 from myDeck to hero;
deal 2 from myDeck to villain;

if (hero has pair) {
  bet 100 from hero;
  call from villain;
}

board flop = flop(myDeck);

if (hero has flush) {
  bet 200 from hero;
}`}
                  </pre>
                </section>

                <section>
                  <h3 className="text-xl font-bold text-yellow-400 mb-3">🎯 Jogo Completo</h3>
                  <pre className="bg-black/40 p-4 rounded border border-yellow-600/20 overflow-x-auto text-green-100 text-sm">
{`chip stack1 = 1000;
chip stack2 = 1000;
chip pot = 0;

deck gameDeck = shuffle(standard52);
hand player1, player2;

deal 2 from gameDeck to player1;
deal 2 from gameDeck to player2;

bet 50 from player1;
call from player2;

board table = flop(gameDeck);
turn(gameDeck, table);
river(gameDeck, table);

showdown {
  compare player1, player2 with table;
}`}
                  </pre>
                </section>
              </div>
            )}

            {activeTab === 'playground' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 bg-blue-900/30 border border-blue-500/30 rounded p-3">
                  <AlertCircle className="text-blue-400" size={20} />
                  <span className="text-blue-200 text-sm">
                    <strong>Interpretador Funcional:</strong> Execute código PokerScript real! Simula distribuição de cartas, detecta combinações e determina vencedores.
                  </span>
                </div>
                
                <div>
                  <label className="block text-yellow-400 font-bold mb-2">Editor PokerScript</label>
                  <textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full h-80 bg-black/60 text-green-100 p-4 rounded border border-yellow-600/30 font-mono text-sm focus:outline-none focus:border-yellow-400"
                    spellCheck={false}
                  />
                </div>
                
                <button
                  onClick={executeCode}
                  disabled={isRunning}
                  className={`${
                    isRunning ? 'bg-gray-600' : 'bg-yellow-600 hover:bg-yellow-500'
                  } text-white font-bold py-3 px-6 rounded flex items-center gap-2 transition-all`}
                >
                  {isRunning ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Executando...
                    </>
                  ) : (
                    <>
                      <Play size={20} />
                      Executar PokerScript
                    </>
                  )}
                </button>
                
                {output && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <label className="block text-yellow-400 font-bold">Output</label>
                      {!hasError && <CheckCircle className="text-green-400" size={20} />}
                      {hasError && <AlertCircle className="text-red-400" size={20} />}
                    </div>
                    <pre className={`${
                      hasError ? 'bg-red-950/60 border-red-500/30' : 'bg-black/60 border-yellow-600/30'
                    } text-green-100 p-4 rounded border whitespace-pre-wrap font-mono text-sm`}>
                      {output}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <footer className="mt-8 text-center text-green-300 text-sm">
          <p>♣️ PokerScript v2.0 - "All in on programming" ♦️</p>
          <p className="text-green-400 mt-1">✨ Powered by functional interpreter</p>
        </footer>
      </div>
    </div>
  );
};

export default PokerScriptIDE;