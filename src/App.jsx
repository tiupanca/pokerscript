import React, { useState } from 'react';
import { Play, BookOpen, Code, Zap } from 'lucide-react';


// Sistema de tabs para navegação - implementado por [André Luiz Sarmento Oliveira]
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

  const executeCode = () => {
    setOutput('🎴 Executando PokerScript...\n\n✓ Deck criado e embaralhado\n✓ 2 cartas para player1: [A♠, K♠]\n✓ 2 cartas para player2: [Q♥, Q♦]\n✓ Flop: [K♥, 5♣, 2♦]\n✓ player1 tem par de reis!\n✓ player1 aposta: 100 fichas\n✓ player2 paga: 100 fichas\n✓ Turn: [9♠]\n✓ River: [Q♠]\n\n🏆 Showdown:\nplayer1: Par de Reis\nplayer2: Trinca de Damas\n\n🎊 player2 vence com Trinca!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-emerald-900 p-6">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-5xl font-bold text-yellow-400 mb-2 drop-shadow-lg">
            ♠️ PokerScript ♥️
          </h1>
          <p className="text-green-100 text-lg">A linguagem de programação inspirada em poker</p>
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
                  <h3 className="text-xl font-bold text-yellow-400 mb-3">🎰 Simulador de Monte Carlo</h3>
                  <pre className="bg-black/40 p-4 rounded border border-yellow-600/20 overflow-x-auto text-green-100 text-sm">
{`play monteCarloSim(hand hero, board community, chip trials) -> odds {
  chip wins = 0;
  
  round trials times {
    deck simDeck = shuffle(standard52);
    remove hero from simDeck;
    remove community from simDeck;
    
    hand villain = deal 2 from simDeck;
    board fullBoard = community + river(simDeck);
    
    if (hero vs villain with fullBoard wins) {
      wins += 1;
    }
  }
  
  return wins / trials;
}`}
                  </pre>
                </section>

                <section>
                  <h3 className="text-xl font-bold text-yellow-400 mb-3">🤖 Bot de Poker Agressivo</h3>
                  <pre className="bg-black/40 p-4 rounded border border-yellow-600/20 overflow-x-auto text-green-100 text-sm">
{`play aggressiveBot(hand h, board b, stack s, pot p) {
  odds equity = calculateEquity(h, b);
  odds potOdds = p.current / s.total;
  
  if (equity > 0.65 and b is preflop) {
    raise (p.current * 3) from s;
  } else if (h has toppair or better) {
    if (equity > potOdds + 0.1) {
      raise (p.current * 0.75) from s;
    } else {
      call from s;
    }
  } else if (h has draws and equity > 0.35) {
    if (potOdds > equity) call from s;
    else fold;
  } else {
    fold;
  }
}`}
                  </pre>
                </section>

                <section>
                  <h3 className="text-xl font-bold text-yellow-400 mb-3">💰 Gerenciador de Bankroll</h3>
                  <pre className="bg-black/40 p-4 rounded border border-yellow-600/20 overflow-x-auto text-green-100 text-sm">
{`play bankrollManager(stack bankroll, chip buyIn) -> bool {
  odds kellyFraction = 0.05;
  chip maxRisk = bankroll * kellyFraction;
  
  if (buyIn > maxRisk) {
    print("Stake muito alto para o bankroll!");
    return fold;
  }
  
  chip sessions = bankroll / buyIn;
  if (sessions < 20) {
    print("Aviso: Apenas " + sessions + " buy-ins disponíveis");
  }
  
  return allin;
}`}
                  </pre>
                </section>
              </div>
            )}

            {activeTab === 'playground' && (
              <div className="space-y-4">
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
                  className="bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-3 px-6 rounded flex items-center gap-2 transition-all"
                >
                  <Play size={20} />
                  Executar PokerScript
                </button>
                {output && (
                  <div>
                    <label className="block text-yellow-400 font-bold mb-2">Output</label>
                    <pre className="bg-black/60 text-green-100 p-4 rounded border border-yellow-600/30 whitespace-pre-wrap font-mono text-sm">
                      {output}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <footer className="mt-8 text-center text-green-300 text-sm">
          <p>♣️ PokerScript v1.0 - "All in on programming" ♦️</p>
        </footer>
      </div>
    </div>
  );
};

export default PokerScriptIDE;