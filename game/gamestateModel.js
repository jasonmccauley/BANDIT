import fs from "node:fs";
import { bananagrams_deck } from "./letterDeck.js";
import { word_is_valid, construct_word } from "./helpers_gameLogic.js";
import { dictionaries } from "../config/mongoCollections.js";

// reverse fisher-yates shuffle
const shuffle = (deck) => {
    for (let i = deck.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    return deck;
};

export class SingleGamestate {
    constructor(player_names, dictionary_name) {
        this.deck = SingleGamestate.initialize_letter_deck(bananagrams_deck);
        this.dictionary = SingleGamestate.load_dictionary(dictionary_name);
        this.table_tiles = [];
        this.players = player_names.map(
            (name) => new SingleGamestate.Player(name)
        );
        this.turn_number = 0;
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
        add_word = (word) => {
            this.words.push(word);
        };
    };

    /**
     * Take a tile from the deck and add it to the table.
     * @returns {string} The letter of the new tile.
     */
    draw = () => {
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
    guess = async (player_index, word) => {
        // If the word is too short, reject it.
        if (word.length < 3) return false;

        // If the word is not in the dictionary, reject it.
        word = word.toLowerCase();
        const valid_word = await word_is_valid(word, this.dictionary);
        if (!valid_word) return false;
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

    /**
     * Return the player whose turn it currently is.
     * @returns {Array<SingleGamestate.Player>}
     */
    active_player = () => {
        return this.players[this.turn_number % this.players.length];
    };

    /**
     * @returns {boolean} Is the game concluded?
     */
    game_is_concluded = () => {
        if (this.deck.length > 0) return false;
        for (let player of this.players) if (!player.given_up) return false;
        return true;
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

    /**
     *
     * @param {string} dictionary_name
     * @returns {object} The dictionary object with the given name.
     */
    static load_dictionary = async (dictionary_name) => {
        const dictCollection = await dictionaries();
        return await dictCollection.findOne({ name: dictionary_name });
    };

    /**
     * Load a new dictionary into the MongoDB with a trie structure
     * @param {string} file_path
     * @param {string} dictionary_name
     */
    static create_new_dictionary = async (file_path, dictionary_name) => {
        const fileData = fs.readFileSync(file_path, "utf-8");
        const words = fileData
            .split("\n")
            .map((word) => word.trim().toLowerCase())
            .filter(Boolean);

        const buildTrie = (words) => {
            const trie = {};
            for (const word of words) {
                let currentNode = trie;
                for (const char of word) {
                    if (!currentNode[char]) {
                        currentNode[char] = {};
                    }
                    currentNode = currentNode[char];
                }
                currentNode.end = true;
            }
            return trie;
        };

        const trie = buildTrie(words);

        const dictCollection = await dictionaries();
        await dictCollection.updateOne(
            { name: dictionary_name },
            { $set: { dictionary: trie } },
            { upsert: true }
        );

        console.log(
            `Successfully loaded dictionary "${dictionary_name}" into the database.`
        );
    };
}
