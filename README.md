# ♠️ PokerScript ♥️

<div align="center">

![PokerScript Logo](https://img.shields.io/badge/PokerScript-v1.0-yellow?style=for-the-badge&logo=spades)
![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)
![Status](https://img.shields.io/badge/status-active-success?style=for-the-badge)

**A linguagem de programação inspirada em poker**

*Onde cada linha de código é uma jogada estratégica*

[Demo](#-demo) • [Documentação](#-documentação) • [Exemplos](#-exemplos) • [Instalação](#-instalação)

</div>

---

## 🎯 Sobre o Projeto

**PokerScript** é uma linguagem de programação conceitual imperativa e fortemente tipada, onde toda a estrutura gira em torno dos conceitos fundamentais do poker. Programar em PokerScript é como jogar poker: você gerencia recursos (fichas), toma decisões baseadas em probabilidades e lida com incerteza.

### ✨ Características Principais

- 🃏 **Tipos nativos de poker**: `deck`, `hand`, `board`, `stack`, `pot`
- 🎲 **Sintaxe temática**: `bet`, `call`, `fold`, `raise`, `showdown`, `bluff`
- 🔍 **Operadores especiais**: `has`, `needs`, `vs` para lógica de poker
- 📊 **Suporte a probabilidades**: tipo `odds` para cálculos de equity
- 🎰 **Built-in para simulações**: Monte Carlo, cálculo de outs, equity
- 🤖 **Ideal para bots**: Perfeito para criar estratégias de poker

---

## 🚀 Demo

Experimente o **PokerScript IDE** interativo online:

👉 **[pokerscript-ide.vercel.app](#)** *(link da sua demo)*

![PokerScript IDE Screenshot](screenshot.png)

---

## 📦 Instalação

### Pré-requisitos

- Node.js 16+ ou superior
- npm ou yarn

### Clonando o Repositório

```bash
git clone https://github.com/seu-usuario/pokerscript.git
cd pokerscript
```

### Instalando Dependências

```bash
npm install
# ou
yarn install
```

### Executando Localmente

```bash
npm run dev
# ou
yarn dev
```

Acesse `http://localhost:3000` no seu navegador.

---

## 📖 Documentação

### Tipos Primitivos

| Tipo | Descrição | Exemplo |
|------|-----------|---------|
| `chip` | Números inteiros (fichas) | `chip stack = 1000;` |
| `odds` | Números decimais (probabilidades) | `odds equity = 0.65;` |
| `card` | Uma carta individual | `card ace = A♠;` |
| `bool` | Booleano (allin/fold) | `bool isBluffing = fold;` |

### Tipos Compostos

```pokerscript
deck myDeck = shuffle(standard52);      // Baralho de 52 cartas
hand player1, player2;                   // Mãos de jogadores
board community = empty;                 // Cartas comunitárias
stack bankroll = 10000;                  // Pilha de fichas
pot mainPot = 0;                        // Pote principal
```

### Estruturas de Controle

#### Condicionais (Reads)

```pokerscript
if (hero has flush) {
  bet 500 from hero;
} else if (hero has pair) {
  check;
} else {
  fold hero;
}
```

#### Loops (Rounds)

```pokerscript
// Loop com contador
round 10 times {
  deal 2 from deck to player;
  if (player has monster) break;
}

// Loop condicional
while (pot < 1000) {
  bet 50 from player1;
  call from player2;
}
```

### Funções (Plays)

```pokerscript
play calculateOuts(hand h, board b) -> chip {
  chip outs = 0;
  if (h needs one for flush) outs += 9;
  if (h needs one for straight) outs += 8;
  return outs;
}
```

### Operadores Especiais

| Operador | Descrição | Exemplo |
|----------|-----------|---------|
| `has` | Verifica combinação | `if (hand has straight)` |
| `needs` | Verifica outs | `if (hand needs one for flush)` |
| `vs` | Compara mãos | `if (hand1 vs hand2 wins)` |
| `@` | Acessa carta por índice | `card top = deck@0` |

---

## 💡 Exemplos

### 🎰 Simulador Monte Carlo

```pokerscript
play monteCarloSim(hand hero, board community, chip trials) -> odds {
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
}
```

### 🤖 Bot de Poker Agressivo

```pokerscript
play aggressiveBot(hand h, board b, stack s, pot p) {
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
}
```

### 💰 Gerenciador de Bankroll

```pokerscript
play bankrollManager(stack bankroll, chip buyIn) -> bool {
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
}
```

---

## 🛠️ Stack Tecnológica

- **React** - Interface do usuário
- **Tailwind CSS** - Estilização
- **Lucide React** - Ícones
- **Vite** - Build tool

---

## 🗺️ Roadmap

- [x] IDE interativo básico
- [x] Sintaxe core da linguagem
- [x] Operadores especiais de poker
- [ ] Implementar interpretador funcional
- [ ] Adicionar debugger visual
- [ ] Criar biblioteca padrão completa
- [ ] Suporte a multiplayer/torneios
- [ ] Extensão VSCode com syntax highlighting
- [ ] CLI para executar arquivos .poker

---

## 🤝 Contribuindo

Contribuições são sempre bem-vindas! Veja como você pode ajudar:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

### 📋 Guidelines

- Mantenha a temática de poker em todas as features
- Escreva código limpo e bem documentado
- Adicione exemplos para novas funcionalidades
- Teste antes de submeter PRs

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 👤 Autor

**Seu Nome**

- GitHub: [@seu-usuario](https://github.com/tiupanca)
- LinkedIn: [Seu Nome](https://linkedin.com/in/alsod)
- Website: [seusite.com](https://gtabrasil.com)
---

## 🙏 Agradecimentos

- Inspirado pela comunidade de poker e programação
- Feito com ♠️ para entusiastas de poker e desenvolvedores

---

## 📊 Estatísticas do Projeto

![GitHub stars](https://img.shields.io/github/stars/seu-usuario/pokerscript?style=social)
![GitHub forks](https://img.shields.io/github/forks/seu-usuario/pokerscript?style=social)
![GitHub watchers](https://img.shields.io/github/watchers/seu-usuario/pokerscript?style=social)

---

<div align="center">

**♣️ PokerScript - "All in on programming" ♦️**

Se você gostou deste projeto, considere dar uma ⭐!

</div>