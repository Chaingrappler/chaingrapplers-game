const OFF_CHAIN_SPECIALS = new Set([50, 54, 55, 56]);

const POSITION_LABELS = {
  takedown: "takedown",
  green: "half guard",
  yellow: "full guard/mount",
  orange: "back control",
  red: "submission"
};

const SPECIAL_CARD_INFO = {
  50: { name: "Mat Enforcer", instruction: "3 cards drawn from pile." },
  51: { name: "Teenage Rage", instruction: "Follow up with any card." },
  52: { name: "The Black Belt", instruction: "Follow up with any card." },
  53: { name: "Fatigue", instruction: "Opponent may play any card." },
  54: { name: "Ultra Heavy", instruction: "stole a random card.", sentence: "playedNameAnd" },
  55: { name: "Ultra Heavy", instruction: "stole a random card.", sentence: "playedNameAnd" },
  56: { name: "Ultra Heavy", instruction: "stole a random card.", sentence: "playedNameAnd" }
};

function inferCardColors(cardId) {
  if (cardId === 1) return { color1: "takedown", color2: "green" };
  if (cardId >= 2 && cardId <= 6) return { color1: "yellow", color2: "green" };
  if (cardId >= 7 && cardId <= 11) return { color1: "orange", color2: "green" };
  if (cardId >= 12 && cardId <= 17) return { color1: "red", color2: "green" };
  if (cardId >= 18 && cardId <= 27) return { color1: "green", color2: "yellow" };
  if (cardId >= 28 && cardId <= 33) return { color1: "yellow", color2: "orange" };
  if (cardId >= 34 && cardId <= 40) return { color1: "orange", color2: "red" };
  if (cardId >= 41 && cardId <= 45) return { color1: "green", color2: "orange" };
  if (cardId >= 46 && cardId <= 49) return { color1: "yellow", color2: "red" };
  return { color1: "special", color2: "special" };
}

function normalizeCardData(cards) {
  return cards.map(card => {
    const inferredColors = inferCardColors(card.id);
    return {
      ...card,
      color1: card.color1 || inferredColors.color1,
      color2: card.color2 || inferredColors.color2
    };
  });
}

class DeckManager {
  constructor(cards) {
    this.deck = cards.map(card => ({ ...card }));
    this.discardPile = [];
  }

  shuffle() {
    for (let i = this.deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
    }
  }

  draw() {
    return this.deck.pop() || null;
  }

  discard(card) {
    this.discardPile.push(card);
  }

  getLastDiscarded() {
    return this.discardPile.length > 0 ? this.discardPile[this.discardPile.length - 1] : null;
  }
}

class Player {
  constructor(id, name, kind) {
    this.id = id;
    this.name = name;
    this.kind = kind; // "human" | "bot"
    this.hand = [];
  }

  addCard(card) {
    this.hand.push(card);
  }

  removeCard(cardId) {
    const idx = this.hand.findIndex(card => card.id === cardId);
    if (idx >= 0) {
      return this.hand.splice(idx, 1)[0];
    }
    return null;
  }

  hasCard(cardId) {
    return this.hand.some(card => card.id === cardId);
  }
}

class Game {
  constructor(cards, options = {}) {
    this.players = this.createPlayers();
    this.deckManager = new DeckManager(cards);
    this.currentPlayerIndex = 0;
    this.turn = 1;
    this.lastPlayedCard = null;
    this.lastPlayerId = null;
    this.chainHistory = [];
    this.offChainDiscard = [];
    this.cardsPlayedThisTurn = 0;
    this.playedCardIdsThisTurn = [];
    this.gameOver = false;
    this.lastActionMessage = "Start match.";
    this.isIntroDealing = options.introDealing === true;
    this.introTimers = [];
    this.lastRenderedChainLength = 0;
    this.previewAction = null;

    this.bindUI();
    this.start();
  }

  createPlayers() {
    return [
      new Player(0, "You", "human"),
      new Player(1, "Bot", "bot")
    ];
  }

  bindUI() {
    this.ui = {
      gameCard: document.getElementById("game-card"),
      gameContent: document.getElementById("game-content"),
      startBtn: document.getElementById("start-game-btn"),
      drawBtn: document.getElementById("draw-card-btn"),
      celebrationOverlay: document.getElementById("celebration-overlay"),
      celebrationMessage: document.getElementById("celebration-message"),
      celebrationConfetti: document.getElementById("celebration-confetti"),
      celebrationCloseBtn: document.getElementById("celebration-close-btn"),
      cardPreviewOverlay: document.getElementById("card-preview-overlay"),
      cardPreviewImage: document.getElementById("card-preview-image"),
      cardPreviewPlayBtn: document.getElementById("card-preview-play-btn"),
      statusText: document.getElementById("status-text"),
      actionText: document.getElementById("action-text"),
      infoText: document.getElementById("info-text"),
      p1Name: document.getElementById("player-1-name"),
      p2Name: document.getElementById("player-2-name"),
      botCardCount: document.getElementById("bot-card-count"),
      botStateLabel: document.getElementById("bot-state-label"),
      p1Hand: document.getElementById("player-1-hand"),
      chainCards: document.getElementById("chain-cards"),
      offChainCards: document.getElementById("offchain-cards"),
      drawPileCard: document.querySelector(".draw-pile-card")
    };

    this.ui.drawBtn.onclick = () => this.endTurnAndDrawCards();
    this.ui.celebrationCloseBtn.onclick = () => this.hideCelebration();
    if (this.ui.cardPreviewOverlay && this.ui.cardPreviewImage) {
      this.ui.cardPreviewOverlay.onclick = event => {
        if (event.target === this.ui.cardPreviewOverlay || event.target === this.ui.cardPreviewImage) {
          this.hideCardPreview();
        }
      };
    }
    if (this.ui.cardPreviewPlayBtn) {
      this.ui.cardPreviewPlayBtn.onclick = event => {
        event.stopPropagation();
        if (!this.previewAction) return;
        const action = this.previewAction;
        this.hideCardPreview();
        action();
      };
    }
  }

  start() {
    this.hideCelebration();
    this.hideCardPreview();
    this.clearIntroTimers();
    this.deckManager.shuffle();
    this.dealCards();
    if (this.ui.p1Name) {
      this.ui.p1Name.textContent = this.players[0].name;
    }
    if (this.ui.p2Name) {
      this.ui.p2Name.textContent = this.players[1].name;
    }
    this.log("Game started.");

    if (this.isIntroDealing && this.ui.gameCard) {
      this.ui.gameCard.classList.remove("is-open", "is-revealed", "is-dealt", "is-ready");
      this.ui.gameCard.classList.add("is-intro-dealing");
    }

    this.refresh();

    if (this.isIntroDealing) {
      this.ui.botCardCount.textContent = "0";
      this.ui.drawBtn.disabled = true;
      this.ui.startBtn.disabled = true;
      this.runIntroSequence();
      return;
    }

    this.maybeRunBotTurn();
  }

  clearIntroTimers() {
    for (const timer of this.introTimers || []) {
      clearTimeout(timer);
    }
    this.introTimers = [];
  }

  queueIntroStep(fn, delay) {
    const timer = setTimeout(fn, delay);
    this.introTimers.push(timer);
  }

  runIntroSequence() {
    if (!this.ui.gameCard) return;

    requestAnimationFrame(() => {
      this.ui.gameCard.classList.add("is-open");
    });

    this.queueIntroStep(() => {
      this.ui.gameCard.classList.add("is-revealed");
    }, 750);

    this.queueIntroStep(() => {
      this.ui.gameCard.classList.add("is-dealt");
      this.animateBotCount(0, this.players[1].hand.length, 650);
    }, 1620);

    this.queueIntroStep(() => {
      this.isIntroDealing = false;
      this.ui.gameCard.classList.remove("is-intro-dealing", "is-dealt");
      this.ui.gameCard.classList.add("is-ready");
      this.ui.startBtn.disabled = false;
      this.renderStatus();
      this.updateDrawButtonState();
      this.maybeRunBotTurn();
    }, 2450);
  }

  animateBotCount(from, to, duration) {
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(from + (to - from) * eased);
      this.ui.botCardCount.textContent = `${value}`;

      if (progress < 1 && this.isIntroDealing) {
        requestAnimationFrame(tick);
      } else {
        this.ui.botCardCount.textContent = `${to}`;
      }
    };
    requestAnimationFrame(tick);
  }

  dealCards() {
    const takedown = this.deckManager.deck.find(card => card.id === 1);
    if (takedown) {
      this.players[0].addCard(takedown);
      this.deckManager.deck = this.deckManager.deck.filter(card => card.id !== 1);
    }
    for (const player of this.players) {
      while (player.hand.length < 6) {
        const card = this.deckManager.draw();
        if (!card) break;
        player.addCard(card);
      }
    }
  }

  get currentPlayer() {
    return this.players[this.currentPlayerIndex];
  }

  get opponent() {
    return this.players[(this.currentPlayerIndex + 1) % 2];
  }

  log(msg) {
    this.lastActionMessage = msg;
    if (this.ui.actionText) {
      this.ui.actionText.textContent = msg;
    }
    this.renderInfoText();
  }

  refresh() {
    this.renderStatus();
    this.renderHands();
    this.renderChainArea();
    this.updateDrawButtonState();
  }

  renderStatus() {
    this.ui.botCardCount.textContent = `${this.players[1].hand.length}`;
    if (this.ui.botStateLabel) {
      this.ui.botStateLabel.textContent = this.getBotStateText();
    }
    this.renderInfoText();
    if (this.ui.statusText) {
      this.ui.statusText.textContent = this.getPrimaryStatusText();
    }
    if (this.ui.actionText) {
      this.ui.actionText.textContent = this.lastActionMessage;
    }
  }

  renderInfoText() {
    if (!this.ui.infoText) return;
    this.ui.infoText.innerHTML = this.getInfoText();
  }

  renderHands() {
    this.renderHand(this.players[0], this.ui.p1Hand, 0);
  }

  renderHand(player, container, playerIndex) {
    container.innerHTML = "";
    const isCurrent = this.currentPlayerIndex === playerIndex;
    const playableIds = new Set(this.getPlayableCards(player).map(card => card.id));
    for (const card of player.hand) {
      const img = document.createElement("img");
      img.src = `cards/${card.filename}`;
      img.alt = `Card ${card.id}`;
      img.title = this.getCardTitle(card);
      img.className = "card is-previewable";
      img.style.setProperty("--card-index", `${container.children.length}`);
      const isPlayable = playableIds.has(card.id);
      if (isPlayable) img.classList.add("is-playable");

      const isHumanTurn = isCurrent && player.kind === "human" && !this.gameOver;
      img.onclick = () => {
        const canPlayFromPreview = isHumanTurn && isPlayable;
        this.showCardPreview(card, {
          onPlay: canPlayFromPreview ? () => this.playCardFromHand(player, card.id) : null
        });
      };

      if (!isPlayable) {
        img.classList.add("is-idle");
        if (isHumanTurn) {
          img.classList.add("is-unplayable");
        }
      }
      container.appendChild(img);
    }
  }

  renderChainArea() {
    this.ui.chainCards.innerHTML = "";
    const visibleChain = this.chainHistory.slice(-3);
    for (const [index, card] of visibleChain.entries()) {
      const img = document.createElement("img");
      img.src = `cards/${card.filename}`;
      img.alt = `Chain card ${card.id}`;
      img.title = this.getCardTitle(card);
      img.className = "card chain-card show is-previewable";
      if (this.chainHistory.length > this.lastRenderedChainLength && index === visibleChain.length - 1) {
        img.classList.add("is-entering");
      }
      img.style.setProperty("--chain-index", `${index}`);
      img.onclick = () => this.showCardPreview(card);
      this.ui.chainCards.appendChild(img);
    }
    this.lastRenderedChainLength = this.chainHistory.length;

    this.ui.offChainCards.innerHTML = "";
    for (const card of this.offChainDiscard) {
      const img = document.createElement("img");
      img.src = `cards/${card.filename}`;
      img.alt = `Off-chain discard ${card.id}`;
      img.title = this.getCardTitle(card);
      img.className = "card is-previewable";
      img.onclick = () => this.showCardPreview(card);
      this.ui.offChainCards.appendChild(img);
    }
  }

  showCardPreview(card, options = {}) {
    if (!this.ui.cardPreviewOverlay || !this.ui.cardPreviewImage) return;
    this.previewAction = typeof options.onPlay === "function" ? options.onPlay : null;
    this.ui.cardPreviewImage.src = `cards/${card.filename}`;
    this.ui.cardPreviewImage.alt = this.getCardTitle(card);
    this.ui.cardPreviewOverlay.classList.add("is-open");
    this.ui.cardPreviewOverlay.style.display = "grid";
    this.ui.cardPreviewOverlay.setAttribute("aria-hidden", "false");

    if (this.ui.cardPreviewPlayBtn) {
      const canPlay = Boolean(this.previewAction);
      this.ui.cardPreviewPlayBtn.hidden = !canPlay;
      this.ui.cardPreviewPlayBtn.disabled = !canPlay;
    }
  }

  hideCardPreview() {
    if (!this.ui.cardPreviewOverlay || !this.ui.cardPreviewImage) return;
    this.previewAction = null;
    this.ui.cardPreviewOverlay.classList.remove("is-open");
    this.ui.cardPreviewOverlay.style.display = "none";
    this.ui.cardPreviewOverlay.setAttribute("aria-hidden", "true");
    this.ui.cardPreviewImage.removeAttribute("src");

    if (this.ui.cardPreviewPlayBtn) {
      this.ui.cardPreviewPlayBtn.hidden = true;
      this.ui.cardPreviewPlayBtn.disabled = true;
    }
  }

  updateDrawButtonState() {
    this.ui.drawBtn.textContent = this.getDrawButtonLabel();
    this.ui.drawBtn.classList.toggle("is-highlighted", this.shouldHighlightDrawButton());

    if (this.gameOver) {
      this.ui.drawBtn.disabled = true;
      return;
    }

    if (this.isIntroDealing) {
      this.ui.drawBtn.disabled = true;
      return;
    }

    this.ui.drawBtn.disabled =
      this.currentPlayer.kind !== "human" || !this.canUseTurnButton(this.currentPlayer);
  }

  shouldHighlightDrawButton() {
    if (this.gameOver || this.isIntroDealing || this.currentPlayer.kind !== "human") {
      return false;
    }
    return this.getPlayableCards(this.currentPlayer).length === 0 && this.canUseTurnButton(this.currentPlayer);
  }

  isCardPlayable(card, player) {
    if (!this.lastPlayedCard) {
      return card.id === 1;
    }

    // If Takedown (1) was played this turn by the current player,
    // no additional cards may be played before ending turn.
    if (
      this.playedCardIdsThisTurn.includes(1) &&
      player.id === this.currentPlayer.id
    ) {
      return false;
    }

    if (card.id === 53) {
      return this.lastPlayedCard.color2 !== "red";
    }

    if (card.specialAbility) {
      return true;
    }

    if (this.lastPlayedCard.id === 53) {
      return this.lastPlayerId !== player.id;
    }

    if (this.lastPlayedCard.id === 1 && this.lastPlayerId === player.id) {
      return false;
    }

    if (this.lastPlayedCard.id === 51 || this.lastPlayedCard.id === 52) {
      return true;
    }

    if (!this.lastPlayedCard.nextPlayableCards.includes(card.id)) {
      return false;
    }

    if (this.lastPlayedCard.type === "offensive") {
      if (this.lastPlayerId === player.id) return card.type === "offensive";
      return card.type === "defensive";
    }

    if (this.lastPlayedCard.type === "defensive") {
      return card.type === "offensive";
    }
    return false;
  }

  canPlayCardNow(card, player) {
    if (this.gameOver) return false;

    if (player.id !== this.currentPlayer.id) {
      return this.isCardPlayable(card, player);
    }

    if (this.cardsPlayedThisTurn >= 2) {
      return false;
    }

    if (this.playedCardIdsThisTurn.includes(1)) {
      return false;
    }

    if (card.id === 1 && this.cardsPlayedThisTurn > 0) {
      return false;
    }

    if (this.playedCardIdsThisTurn.includes(53)) {
      return false;
    }

    if (card.id === 53 && this.cardsPlayedThisTurn > 0) {
      return false;
    }

    if (card.id === 53 && this.isSubmissionActiveForPlayer(player)) {
      return false;
    }

    return this.isCardPlayable(card, player);
  }

  getPlayableCards(player) {
    return player.hand.filter(card => this.canPlayCardNow(card, player));
  }

  isSubmissionActiveForPlayer(player) {
    return (
      this.lastPlayedCard &&
      this.lastPlayedCard.color2 === "red" &&
      this.lastPlayerId !== player.id
    );
  }

  canPassAndDraw(player) {
    return !this.isSubmissionActiveForPlayer(player) && !player.hasCard(53);
  }

  canUseTurnButton(player) {
    return (
      this.canPassAndDraw(player) ||
      (this.canEndTurnWithoutDraw(player) && !this.isSubmissionActiveForPlayer(player))
    );
  }

  canEndTurnWithoutDraw(player) {
    return player.id === this.currentPlayer.id && this.cardsPlayedThisTurn > 0;
  }

  getDrawButtonLabel() {
    if (this.gameOver) {
      return "Round Over";
    }
    if (this.currentPlayer.kind === "bot") {
      return "Bot Thinking";
    }
    if (
      this.currentPlayer &&
      this.currentPlayer.hasCard(53) &&
      this.cardsPlayedThisTurn > 0 &&
      !this.isSubmissionActiveForPlayer(this.currentPlayer)
    ) {
      return "End Turn";
    }
    return "Draw / End Turn";
  }

  getPrimaryStatusText() {
    if (this.gameOver) {
      return "Round finished. Start a new match when ready.";
    }
    if (!this.lastPlayedCard) {
      return "Open the round with Takedown.";
    }
    if (this.currentPlayer.kind === "bot") {
      return "Bot is choosing the next link in the chain.";
    }
    if (this.isSubmissionActiveForPlayer(this.currentPlayer)) {
      return "Submission is active. You must answer with an in-chain escape.";
    }
    if (this.shouldHighlightDrawButton()) {
      return "No legal cards to play. Use the highlighted button to draw and pass the turn.";
    }
    if (this.currentPlayer.hasCard(53) && this.cardsPlayedThisTurn === 0) {
      return "Fatigue is in your hand. Play a legal card before you can end the turn.";
    }
    if (this.currentPlayer.hasCard(53) && this.cardsPlayedThisTurn > 0) {
      return "You may end the turn now, but Fatigue prevents drawing a new card.";
    }
    if (this.cardsPlayedThisTurn >= 2) {
      return "You have used both plays this turn. End the turn to continue.";
    }
    return "Play up to two legal cards, then draw to pass the turn.";
  }

  getExpectedMoveLabel(player = this.currentPlayer) {
    if (!player || !this.lastPlayedCard) {
      return "move";
    }

    if (this.isSubmissionActiveForPlayer(player)) {
      return "in-chain escape";
    }

    if (this.lastPlayedCard.id === 51 || this.lastPlayedCard.id === 52) {
      return "follow-up move";
    }

    if (this.lastPlayedCard.id === 53) {
      return "move";
    }

    if (this.lastPlayedCard.type === "offensive") {
      return this.lastPlayerId === player.id ? "offensive move" : "defensive move";
    }

    if (this.lastPlayedCard.type === "defensive") {
      return "offensive move";
    }

    return "move";
  }

  getNoLegalMoveText(player = this.currentPlayer) {
    if (this.isSubmissionActiveForPlayer(player)) {
      return "Submission active. Escape if possible!";
    }

    if (player && player.hasCard(53) && !this.canPassAndDraw(player) && !this.canEndTurnWithoutDraw(player)) {
      return "Fatigue blocks drawing and you have no legal move.";
    }

    const moveLabel = this.getExpectedMoveLabel(player);
    const nextAction = this.canPassAndDraw(player) ? "Draw a card." : "End turn.";

    if (moveLabel === "move") {
      return `You have no legal move. ${nextAction}`;
    }

    return `You have no matching ${moveLabel}. ${nextAction}`;
  }

  getCurrentTurnHelpText(player = this.currentPlayer) {
    if (!player) {
      return "Start match.";
    }

    if (this.gameOver) {
      return this.lastActionMessage;
    }

    if (player.kind === "bot") {
      return "Bot thinking.";
    }

    if (!this.lastPlayedCard) {
      return "Open with Takedown.";
    }

    if (this.cardsPlayedThisTurn >= 2) {
      return "End turn.";
    }

    const playableCards = this.getPlayableCards(player);

    if (this.isSubmissionActiveForPlayer(player)) {
      return playableCards.length > 0 ? "Play an escape card." : this.getNoLegalMoveText(player);
    }

    if (playableCards.length === 0) {
      return this.getNoLegalMoveText(player);
    }

    if (player.hasCard(53) && this.cardsPlayedThisTurn === 0) {
      return "Fatigue blocks drawing. You may play a legal card.";
    }

    if (player.hasCard(53) && this.cardsPlayedThisTurn > 0) {
      return "Fatigue blocks drawing. Play a legal follow-up or end turn.";
    }

    const moveLabel = this.getExpectedMoveLabel(player);
    const nextAction = this.canEndTurnWithoutDraw(player)
      ? "or end turn."
      : "or draw a card.";

    if (moveLabel === "move") {
      return `Play a legal move ${nextAction}`;
    }

    if (moveLabel === "in-chain escape") {
      return "Play an in-chain escape.";
    }

    return `Play a matching ${moveLabel} ${nextAction}`;
  }

  getInfoText() {
    return this.getCurrentTurnHelpText();
  }

  getCardLabel(card) {
    if (!card) return "card";
    if (SPECIAL_CARD_INFO[card.id]) return SPECIAL_CARD_INFO[card.id].name;
    return `${card.id}`;
  }

  getPositionLabel(color) {
    return POSITION_LABELS[color] || color;
  }

  getCardTitle(card) {
    const special = SPECIAL_CARD_INFO[card.id];
    if (special) return special.name;
    if (card.id === 1) return "Takedown";
    if (card.id >= 12 && card.id <= 17) return "Escape submission";
    return `${this.getPositionLabel(card.color1)} to ${this.getPositionLabel(card.color2)}`;
  }

  emphasizeCardText(text, color = "special") {
    return `<span class="info-card-text info-card-text--${color}">${text}</span>`;
  }

  describePlayedCard(player, card) {
    const actor = player.name === "You" ? "You" : player.name;
    const special = SPECIAL_CARD_INFO[card.id];

    if (special) {
      const cardName = this.emphasizeCardText(special.name, "special");
      if (special.sentence === "playedNameAnd") {
        return `${actor} played ${cardName} and ${special.instruction}`;
      }
      return `${actor} played ${cardName}. ${special.instruction}`;
    }

    const from = this.getPositionLabel(card.color1);
    const to = this.getPositionLabel(card.color2);
    const transition = this.emphasizeCardText(`${from} to ${to}`, card.color2);

    if (card.id === 1) {
      return `${actor} played ${this.emphasizeCardText("Takedown", "green")}. Opponent must play defensive.`;
    }

    if (card.id >= 12 && card.id <= 17) {
      return `${actor} ${this.emphasizeCardText("escaped a submission", "green")}!`;
    }

    if (card.color2 === "red") {
      return `${actor} played ${transition}.`;
    }

    return `${actor} played ${transition}.`;
  }

  getBotStateText() {
    if (this.gameOver) {
      return "Round complete.";
    }
    if (this.currentPlayer.kind === "bot") {
      return "Bot is active.";
    }
    if (this.isSubmissionActiveForPlayer(this.players[1])) {
      return "Bot is under submission pressure.";
    }
    return "";
  }

  getWinMessage(player, method) {
    const verb = player.name === "You" ? "win" : "wins";
    return `${player.name} ${verb} by ${method}.`;
  }

  currentPlayerHasLegalResponse() {
    return this.getPlayableCards(this.currentPlayer).length > 0;
  }

  resolveCurrentPlayerIfStuck() {
    if (this.gameOver) return true;

    if (this.currentPlayerHasLegalResponse()) {
      return false;
    }

    if (this.isSubmissionActiveForPlayer(this.currentPlayer)) {
      this.finishGame(this.getWinMessage(this.opponent, "submission"));
      return true;
    }

    return false;
  }

  playCardFromHand(player, cardId) {
    if (this.gameOver) return false;
    if (player.id !== this.currentPlayer.id) return false;

    const card = player.hand.find(c => c.id === cardId);
    if (!card) return false;

    if (this.cardsPlayedThisTurn >= 2) {
      this.log("You can play at most 2 cards per turn.");
      return false;
    }

    if (this.playedCardIdsThisTurn.includes(1)) {
      this.log("Takedown must be played alone.");
      return false;
    }

    if (card.id === 1 && this.cardsPlayedThisTurn > 0) {
      this.log("Takedown must be played alone.");
      return false;
    }

    if (this.playedCardIdsThisTurn.includes(53)) {
      this.log("Fatigue must be played alone.");
      return false;
    }

    // Hard rule: Fatigue (53) cannot be played while defending an active submission (red).
    if (card.id === 53 && this.isSubmissionActiveForPlayer(player)) {
      this.log("Fatigue cannot answer a submission.");
      return false;
    }

    if (!this.isCardPlayable(card, player)) {
      this.log("That card is not legal now.");
      return false;
    }

    if (card.id === 53 && this.cardsPlayedThisTurn > 0) {
      this.log("Fatigue must be played alone.");
      return false;
    }

    if (card.specialAbility && OFF_CHAIN_SPECIALS.has(card.id)) {
      player.removeCard(card.id);
      this.cardsPlayedThisTurn += 1;
      this.playedCardIdsThisTurn.push(card.id);
      this.offChainDiscard.push(card);
      this.log(this.describePlayedCard(player, card));
      this.applySpecialCard(player, card);

      if (this.isSubmissionActiveForPlayer(player)) {
        const opp = this.players.find(p => p.id !== player.id);
        if (opp && (this.getPlayableCards(player).length === 0 || this.cardsPlayedThisTurn >= 2)) {
          this.finishGame(this.getWinMessage(opp, "submission"));
          return true;
        }

        this.refresh();
        return true;
      }

      if (player.hand.length === 0) {
        this.finishGame(this.getWinMessage(player, "empty hand"));
        return true;
      }

      this.refresh();
      return true;
    }

    this.lastPlayedCard = card;
    this.lastPlayerId = player.id;
    if (card.id !== 52) {
      this.deckManager.discard(card);
    }
    player.removeCard(card.id);
    this.chainHistory.push(card);
    this.cardsPlayedThisTurn += 1;
    this.playedCardIdsThisTurn.push(card.id);
    this.log(this.describePlayedCard(player, card));

    if (card.id === 52) {
      this.applySpecialCard(player, card);
    }

    if (player.hand.length === 0) {
      this.finishGame(this.getWinMessage(player, "empty hand"));
      return true;
    }

    if (card.color2 === "red") {
      const opp = this.players.find(p => p.id !== player.id);
      if (opp && this.getPlayableCards(opp).length === 0) {
        this.finishGame(this.getWinMessage(player, "submission"));
        return true;
      }
    }

    this.refresh();
    return true;
  }

  applySpecialCard(player, card) {
    if (card.specialAbility === "Draw 3 cards and discard") {
      for (let i = 0; i < 3; i++) {
        const drawn = this.deckManager.draw();
        if (drawn) player.addCard(drawn);
      }
      return;
    }

    if (card.specialAbility === "Pick up last card") {
      const last = this.deckManager.getLastDiscarded();
      if (last && last.id !== 1) {
        player.addCard(last);
      }
      return;
    }

    if (card.specialAbility === "Steal a random card from your opponent") {
      const opp = this.players.find(p => p.id !== player.id);
      if (!opp || opp.hand.length === 0) {
        this.log(`${player.name} played Ultra Heavy. Opponent has no cards.`);
        return;
      }
      const idx = Math.floor(Math.random() * opp.hand.length);
      const stolen = opp.hand.splice(idx, 1)[0];
      player.addCard(stolen);
    }
  }

  pickBotMove(player) {
    const playable = this.getPlayableCards(player);
    if (playable.length === 0) {
      return { cards: [], draw: true };
    }

    const scoreCard = (card) => {
      let score = 0;
      if (card.color2 === "red") score += 30;
      else if (card.color2 === "orange") score += 18;
      else if (card.color2 === "yellow") score += 10;
      if (card.id === 53) score += 8;
      if (card.id === 50 || card.id === 51) score += 6;
      if (card.id === 52) score += 5;
      return score;
    };

    const first = [...playable].sort((a, b) => scoreCard(b) - scoreCard(a))[0];
    const chain = [first.id];

    if (first.id !== 53 && first.id !== 1) {
      const canSecond = player.hand
        .filter(c => c.id !== first.id)
        .filter(c => first.nextPlayableCards.includes(c.id))
        .filter(c => c.id !== 53);
      if (canSecond.length > 0) {
        const second = [...canSecond].sort((a, b) => scoreCard(b) - scoreCard(a))[0];
        chain.push(second.id);
      }
    }

    return { cards: chain, draw: true };
  }

  pickBotCard(player, forceInChainResponse = false) {
    const playable = this.getPlayableCards(player);
    if (playable.length === 0) return null;

    const inChainPlayable = playable.filter(card => !OFF_CHAIN_SPECIALS.has(card.id));
    const candidates =
      forceInChainResponse && inChainPlayable.length > 0 ? inChainPlayable : playable;

    const scoreCard = (card) => {
      let score = 0;
      if (card.color2 === "red") score += 30;
      else if (card.color2 === "orange") score += 18;
      else if (card.color2 === "yellow") score += 10;
      if (card.id === 53) score += 8;
      if (card.id === 50 || card.id === 51) score += 6;
      if (card.id === 52) score += 5;
      return score;
    };

    return [...candidates].sort((a, b) => scoreCard(b) - scoreCard(a))[0] || null;
  }

  runBotTurn() {
    if (this.gameOver || this.currentPlayer.kind !== "bot") return;

    if (this.lastPlayedCard && this.lastPlayedCard.color2 === "red" && this.lastPlayerId !== this.currentPlayer.id) {
      if (this.getPlayableCards(this.currentPlayer).length === 0) {
        this.finishGame(this.getWinMessage(this.opponent, "submission"));
        return;
      }

      const playSubmissionResponse = () => {
        if (this.gameOver || this.currentPlayer.kind !== "bot") return;
        if (this.cardsPlayedThisTurn >= 2 || !this.isSubmissionActiveForPlayer(this.currentPlayer)) {
          if (this.isSubmissionActiveForPlayer(this.currentPlayer)) {
            this.finishGame(this.getWinMessage(this.opponent, "submission"));
            return;
          }
          this.endTurnAndDrawCards();
          return;
        }

        const nextCard = this.pickBotCard(this.currentPlayer, this.cardsPlayedThisTurn > 0);
        if (!nextCard) {
          this.finishGame(this.getWinMessage(this.opponent, "submission"));
          return;
        }

        const ok = this.playCardFromHand(this.currentPlayer, nextCard.id);
        if (!ok || this.gameOver) return;

        setTimeout(playSubmissionResponse, 760);
      };

      playSubmissionResponse();
      return;
    }

    const move = this.pickBotMove(this.currentPlayer);
    this.playBotCardsWithAnimation(move.cards, 0);
  }

  playBotCardsWithAnimation(cardIds, index) {
    if (this.gameOver || this.currentPlayer.kind !== "bot") return;
    if (index >= cardIds.length) {
      this.endTurnAndDrawCards();
      return;
    }

    let nextCardId = cardIds[index];
    let nextCard = this.currentPlayer.hand.find(card => card.id === nextCardId);

    if (!nextCard || !this.canPlayCardNow(nextCard, this.currentPlayer)) {
      const fallback = this.pickBotCard(this.currentPlayer);
      if (!fallback) {
        this.endTurnAndDrawCards();
        return;
      }
      nextCardId = fallback.id;
    }

    const ok = this.playCardFromHand(this.currentPlayer, nextCardId);
    if (!ok || this.gameOver) return;

    setTimeout(() => this.playBotCardsWithAnimation(cardIds, index + 1), 760);
  }

  noMovesPossibleForAnyone() {
    return this.players.every(p => this.getPlayableCards(p).length === 0);
  }

  endTurnAndDrawCards() {
    if (this.gameOver) return;
    const player = this.currentPlayer;
    const submissionActive = this.isSubmissionActiveForPlayer(player);

    if (submissionActive) {
      if (this.getPlayableCards(player).length === 0 || this.cardsPlayedThisTurn >= 2) {
        this.finishGame(this.getWinMessage(this.opponent, "submission"));
      } else {
        this.log(`${player.name} is under submission and must play an escape card.`);
        this.refresh();
      }
      return;
    }

    if (player.hasCard(53)) {
      if (!this.canEndTurnWithoutDraw(player)) {
        this.log(`${player.name} holds 53 and cannot pass/draw.`);
        this.refresh();
        return;
      }
      this.log(`${player.name} ends the turn without drawing because of Fatigue.`);
    } else {
      const card = this.deckManager.draw();
      if (card) player.addCard(card);
    }

    this.cardsPlayedThisTurn = 0;
    this.playedCardIdsThisTurn = [];
    this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
    if (this.currentPlayerIndex === 0) this.turn += 1;

    if (this.resolveCurrentPlayerIfStuck()) {
      return;
    }

    if (this.deckManager.deck.length === 0 && this.noMovesPossibleForAnyone()) {
      this.finishGame("No cards left and no legal moves. Draw game.");
      return;
    }

    this.refresh();
    this.maybeRunBotTurn();
  }

  maybeRunBotTurn() {
    if (this.gameOver) return;
    if (this.currentPlayer.kind === "bot") {
      setTimeout(() => this.runBotTurn(), 450);
    }
  }

  finishGame(message) {
    if (this.gameOver) return;
    this.gameOver = true;
    this.log(message);
    this.refresh();
    this.ui.drawBtn.disabled = true;
    this.showCelebration(message);
  }

  showCelebration(message) {
    if (!this.ui.celebrationOverlay || !this.ui.celebrationMessage || !this.ui.celebrationConfetti) {
      return;
    }
    this.ui.celebrationMessage.textContent = message;
    this.ui.celebrationConfetti.innerHTML = "";

    const colors = ["#d24a22", "#148c7f", "#ffcc00", "#3c5cff", "#f5f5f5"];
    for (let i = 0; i < 85; i++) {
      const piece = document.createElement("span");
      piece.className = "confetti-piece";
      piece.style.left = `${Math.random() * 100}%`;
      piece.style.background = colors[Math.floor(Math.random() * colors.length)];
      piece.style.animationDuration = `${2.2 + Math.random() * 1.8}s`;
      piece.style.animationDelay = `${Math.random() * 0.35}s`;
      piece.style.transform = `rotate(${Math.random() * 360}deg)`;
      this.ui.celebrationConfetti.appendChild(piece);
    }

    this.ui.celebrationOverlay.classList.add("is-open");
    this.ui.celebrationOverlay.style.display = "grid";
  }

  hideCelebration() {
    if (!this.ui.celebrationOverlay || !this.ui.celebrationConfetti) {
      return;
    }
    this.ui.celebrationOverlay.classList.remove("is-open");
    this.ui.celebrationOverlay.style.display = "none";
    this.ui.celebrationConfetti.innerHTML = "";
  }
}

let activeGame = null;

function startGame() {
  if (activeGame) {
    activeGame.clearIntroTimers();
  }
  activeGame = new Game(normalizeCardData(cardsData), { introDealing: true });
}

document.getElementById("start-game-btn").addEventListener("click", startGame);
