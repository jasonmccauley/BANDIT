import { letterDecks } from "./letterDeck.js";
import { word_is_valid, construct_word } from "./helpers_gameLogic.js";
import { all } from "axios";

// reverse fisher-yates shuffle
const shuffle = (deck) => {
  for (let i = deck.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  return deck;
};

export class Gamestate {
  constructor(player_names, dictionary_name, letterDeck) {
    this.deck = Gamestate.initialize_letter_deck(letterDeck);
    this.dictionary = dictionary_name;
    this.table_tiles = [];
    this.players = shuffle(
      player_names.map((name) => new Gamestate.Player(name))
    );
    this.active_player = this.players[0];
    this.winner = null;
    this.turn_number = 0;
    this.gameLog = [""];
  }

  static Player = class {
    constructor(name) {
      this.name = name;
      this.words = [];
    }

    /**
     * Add a word to the player's word list.
     * @param {string} word
     */
    add_word = (word) => {
      this.words.push(word);
    };

    /**
     * @returns {int} The player's score.
     */
    score = () => {
      let score = 0;
      for (const word of this.words) {
        score += word.length;
      }
      return score;
    };
  };

  get_all_players = () => {
    let allPlayers = [];
    for (let player in this.players) {
      allPlayers.push(this.players[player].name);
    }
    return allPlayers;
  };
  get_player_by_name = (name) => {
    for (let player in this.players) {
      if (this.players[player].name === name) return this.players[player];
    }
  };

  get_player_index = (player) => {
    return this.players.indexOf(player);
  };

  /**
   * Take a tile from the deck and add it to the table.
   * @returns {string} The letter of the new tile.
   */
  draw = () => {
    if (this.game_is_concluded() !== null) {
      this.winner = this.game_is_concluded();
      return;
    }

    let new_tile = this.deck.pop();
    this.table_tiles.push(new_tile);
    this.turn_number++;
    return new_tile;
  };

  pass = () => {
    let idx = this.players.indexOf(this.active_player);
    idx++;

    if (idx === this.players.length) idx = 0;

    this.active_player = this.players[idx];
  };

  pass_to_player = (player) => {
    this.active_player = player;
  };

  /**
   * Apply the word finding function to verify a guessed word.
   * If it is correct, remove the pertinent table tiles or words and add the new word.
   * @param {int} player_index
   * @param {string} word
   * @returns {boolean} Is the guess valid?
   */
  guess = async (player_index, word) => {
    // If the word is too short, reject it.
    if (word.length < 3) {
      this.gameLog.push(
        `${
          this.players[player_index].name
        } tried to grab a word that is too short: ${word.toUpperCase()}`
      );
      return false;
    }

    // If the word is not in the dictionary, reject it.
    word = word.toLowerCase();
    const valid_word = await word_is_valid(word, this.dictionary);
    if (!valid_word) {
      this.gameLog.push(
        `${
          this.players[player_index].name
        } tried to grab an invalid word: ${word.toUpperCase()}`
      );
      return false;
    }
    const player_words = this.players.flatMap((player) => player.words);

    let result = construct_word(word, this.table_tiles, player_words);

    // If the word can't be validly constructed, reject it.
    if (result === null) {
      this.gameLog.push(
        `${
          this.players[player_index].name
        } tried to grab a word that is valid but can't be constructed: ${word.toUpperCase()}`
      );
      return false;
    }

    for (const word of result) {
      if (word.length === 1)
        this.table_tiles.splice(this.table_tiles.indexOf(word), 1);
      else {
        for (let player of this.players) {
          if (player.words.includes(word))
            player.words.splice(player.words.indexOf(word), 1);
        }
      }
    }
    this.players[player_index].words.push(word);
    this.pass_to_player(this.players[player_index]);
    this.gameLog.push(
      `${this.players[player_index].name} stole ${word.toUpperCase()}!`
    );
    return true;
  };

  /**
   * @returns {Object} Is the game concluded? If so, return the winning player.
   */
  game_is_concluded = () => {
    if (this.deck.length > 0) return null;
    let winner = null;
    let max_score = -1;
    for (let player of this.players) {
      if (player.score() > max_score) {
        max_score = player.score();
        winner = player;
      }
    }
    return winner;
  };

  /**
   * Generate a randomly ordered list of letter tiles to start the game.
   * @param {object} deck_model
   * @returns {Array<string>}
   */
  static initialize_letter_deck = (deck_model) => {
    let deck = [];
    for (const tile in deck_model) {
      deck = deck.concat(Array(deck_model[tile]).fill(tile));
    }

    return shuffle(deck);
  };
}
