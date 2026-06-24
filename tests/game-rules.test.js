const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const context = vm.createContext({
  console,
  globalThis: {},
  setTimeout: () => 0,
  clearTimeout: () => {},
  window: {}
});

vm.runInContext(
  fs.readFileSync(path.join(root, "cardsData.js"), "utf8"),
  context,
  { filename: "cardsData.js" }
);
vm.runInContext(
  fs.readFileSync(path.join(root, "script.js"), "utf8"),
  context,
  { filename: "script.js" }
);

const cardsData = vm.runInContext("cardsData", context);
const {
  DeckManager,
  Game,
  Player,
  inferCardColors,
  isSubmissionEscapeCard,
  normalizeCardData
} = context.globalThis.ChainGrapplersTestAPI;
const cards = normalizeCardData(cardsData);
const card = id => cards.find(item => item.id === id);

function createGameState() {
  const game = Object.create(Game.prototype);
  game.players = [
    new Player(0, "You", "human"),
    new Player(1, "Bot", "bot")
  ];
  game.currentPlayerIndex = 0;
  game.turn = 1;
  game.lastPlayedCard = null;
  game.lastPlayerId = null;
  game.chainHistory = [];
  game.offChainDiscard = [];
  game.cardsPlayedThisTurn = 0;
  game.playedCardIdsThisTurn = [];
  game.gameOver = false;
  game.lastActionMessage = "";
  game.pendingHailMaryPlayerId = null;
  game.deckManager = new DeckManager([]);
  game.ui = {
    drawBtn: { disabled: false },
    celebrationOverlay: null,
    celebrationMessage: null,
    celebrationConfetti: null
  };
  game.refresh = () => {};
  game.maybeRunBotTurn = () => {};
  game.log = message => {
    game.lastActionMessage = message;
  };
  game.showCelebration = () => {};
  return game;
}

test("deck contains the expected 55 unique cards", () => {
  assert.equal(cards.length, 55);
  assert.equal(new Set(cards.map(item => item.id)).size, 55);
  assert.equal(cards.filter(item => item.type === "special").length, 7);
});

test("card colors are inferred from the authoritative card ranges", () => {
  assert.equal(JSON.stringify(inferCardColors(1)), '{"color1":"takedown","color2":"green"}');
  assert.equal(JSON.stringify(inferCardColors(12)), '{"color1":"red","color2":"green"}');
  assert.equal(JSON.stringify(inferCardColors(18)), '{"color1":"green","color2":"yellow"}');
  assert.equal(JSON.stringify(inferCardColors(34)), '{"color1":"orange","color2":"red"}');
});

test("a new chain must open with Takedown", () => {
  const game = createGameState();
  assert.equal(game.isCardPlayable(card(1), game.currentPlayer), true);
  assert.equal(game.isCardPlayable(card(18), game.currentPlayer), false);
});

test("Takedown must be played alone and answered defensively", () => {
  const game = createGameState();
  game.lastPlayedCard = card(1);
  game.lastPlayerId = 0;
  game.playedCardIdsThisTurn = [1];

  assert.equal(game.canPlayCardNow(card(18), game.players[0]), false);
  assert.equal(game.isCardPlayable(card(2), game.players[1]), true);
  assert.equal(game.isCardPlayable(card(18), game.players[1]), false);
});

test("offensive and defensive cards alternate according to chain color", () => {
  const game = createGameState();
  game.lastPlayedCard = card(18);
  game.lastPlayerId = 0;
  game.currentPlayerIndex = 1;

  assert.equal(game.isCardPlayable(card(2), game.players[1]), true);
  assert.equal(game.isCardPlayable(card(28), game.players[1]), false);

  game.currentPlayerIndex = 0;
  assert.equal(game.isCardPlayable(card(28), game.players[0]), true);
});

test("players may play at most two cards per turn", () => {
  const game = createGameState();
  game.lastPlayedCard = card(18);
  game.lastPlayerId = 0;
  game.cardsPlayedThisTurn = 2;

  assert.equal(game.canPlayCardNow(card(28), game.players[0]), false);
});

test("a red offensive card creates submission pressure", () => {
  const game = createGameState();
  game.lastPlayedCard = card(34);
  game.lastPlayerId = 0;

  assert.equal(game.isSubmissionActiveForPlayer(game.players[1]), true);
  assert.equal(game.isSubmissionActiveForPlayer(game.players[0]), false);
  assert.equal(isSubmissionEscapeCard(card(12)), true);
  assert.equal(game.isCardPlayable(card(12), game.players[1]), true);
});

test("Fatigue cannot answer an active submission", () => {
  const game = createGameState();
  game.currentPlayerIndex = 1;
  game.lastPlayedCard = card(34);
  game.lastPlayerId = 0;
  game.players[1].addCard(card(53));

  assert.equal(game.canPlayCardNow(card(53), game.players[1]), false);
  assert.equal(game.canPassAndDraw(game.players[1]), false);
});

test("successful Hail Mary immediately plays an escape", () => {
  const game = createGameState();
  game.currentPlayerIndex = 1;
  game.lastPlayedCard = card(34);
  game.lastPlayerId = 0;
  game.pendingHailMaryPlayerId = 1;
  game.players[1].addCard(card(18));
  game.deckManager.deck = [card(12)];

  game.resolveHailMaryDraw(game.players[1]);

  assert.equal(game.gameOver, false);
  assert.equal(game.lastPlayedCard.id, 12);
  assert.equal(game.lastPlayerId, 1);
  assert.equal(game.pendingHailMaryPlayerId, null);
});

test("failed Hail Mary loses by submission", () => {
  const game = createGameState();
  game.currentPlayerIndex = 1;
  game.lastPlayedCard = card(34);
  game.lastPlayerId = 0;
  game.pendingHailMaryPlayerId = 1;
  game.deckManager.deck = [card(18)];

  game.resolveHailMaryDraw(game.players[1]);

  assert.equal(game.gameOver, true);
  assert.match(game.lastActionMessage, /submission/i);
});

test("Mat Enforcer draws up to three cards", () => {
  const game = createGameState();
  game.deckManager.deck = [card(2), card(3), card(4)];

  game.applySpecialCard(game.players[0], card(50));

  assert.equal(game.players[0].hand.length, 3);
  assert.equal(game.deckManager.deck.length, 0);
});

test("Black Belt retrieves the most recently discarded non-Takedown card", () => {
  const game = createGameState();
  game.deckManager.discard(card(18));

  game.applySpecialCard(game.players[0], card(52));

  assert.equal(game.players[0].hand[0].id, 18);
});

test("Ultra Heavy steals one opponent card", () => {
  const game = createGameState();
  game.players[1].addCard(card(18));

  game.applySpecialCard(game.players[0], card(54));

  assert.equal(game.players[0].hand.length, 1);
  assert.equal(game.players[1].hand.length, 0);
});

test("empty hand wins immediately", () => {
  const game = createGameState();
  game.players[0].addCard(card(1));

  assert.equal(game.playCardFromHand(game.players[0], 1), true);
  assert.equal(game.gameOver, true);
  assert.match(game.lastActionMessage, /empty hand/i);
});

test("deck exhaustion awards card advantage to the smaller hand", () => {
  const game = createGameState();
  game.players[0].hand = [card(18)];
  game.players[1].hand = [card(2), card(3)];

  game.finishByCardAdvantage();

  assert.equal(game.gameOver, true);
  assert.match(game.lastActionMessage, /You win by card advantage/i);
});

test("deck exhaustion is a draw when hand sizes are equal", () => {
  const game = createGameState();
  game.players[0].hand = [card(18)];
  game.players[1].hand = [card(2)];

  game.finishByCardAdvantage();

  assert.equal(game.gameOver, true);
  assert.match(game.lastActionMessage, /Draw game/i);
});
