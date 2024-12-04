import fs from "node:fs";
import { bananagrams_deck } from "./letterDeck.js";
import { word_is_valid, construct_word } from "./helpers_gameLogic.js";

// reverse fisher-yates shuffle
const shuffle = (deck) => {
    for (let i = deck.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    return deck;
};

export class SingleGamestate {
    constructor(player_names) {
        this.deck = SingleGamestate.initialize_letter_deck(bananagrams_deck);
        this.dictionary =
            SingleGamestate.initialize_dictionary("./scrabble.txt");
        this.table_tiles = [];
        this.players = player_names.map(
            (name) => new SingleGamestate.Player(name)
        );
        this.turn_number = 0;

        // take a tile from the deck and add it to the table
        /**
         * Take a tile from the deck and add it to the table.
         * @returns {string} The letter of the new tile.
         */
        this.draw = () => {
            let new_tile = this.deck.pop();
            this.table_tiles.push(new_tile);
            this.turn_number++;
            return new_tile;
        };

        /**
         * Apply the word finding function to verify a guessed word.
         * If it is correct, remove the pertinent table tiles or words and add the new word.
         * @param {int} player_index
         * @param {string} word
         * @returns {boolean} Is the guess valid?
         */
        this.guess = (player_index, word) => {
            // If the word is not in the dictionary, reject it.
            if (!word_is_valid(word, this.dictionary)) return false;

            const player_words = this.players.flatMap((player) => player.words);

            let result = construct_word(word, this.table_tiles, player_words);

            // If the word can't be validly constructed, reject it.
            if (result === null) return false;

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
            return true;
        };
    }

    static Player = class {
        constructor(name) {
            this.name = name;
            this.words = [];
            this.given_up = false;
        }

        /**
         * Add a word to the player's word list.
         * @param {string} word
         */
        add_word(word) {
            this.words.push(word);
        }
    };

    /**
     * Return the player whose turn it currently is.
     * @returns {Array<SingleGamestate.Player>}
     */
    active_player() {
        return this.players[this.turn_number % this.players.length];
    }

    /**
     *
     * @returns {boolean} Is the game concluded?
     */
    game_is_concluded() {
        if (this.deck.length === 0) return true;
        return false;
    }

    // generate a randomly ordered list of letter tiles to start the game
    static initialize_letter_deck(deck_model) {
        let deck = [];
        for (const tile in deck_model) {
            deck = deck.concat(Array(deck_model[tile]).fill(tile));
        }

        return shuffle(deck);
    }

    // traverse a file of word entries to make word dictionary
    // note: filters out any words less than 3 letters
    static initialize_dictionary(file) {
        const data = fs.readFileSync(file, "utf-8");

        let dict = data.split("\n");
        return dict.filter((x) => x.length > 2);
    }
}
