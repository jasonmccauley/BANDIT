import fs from 'node:fs';
import { bananagrams_deck } from "./letterDeck.js";
import { construct_word } from "./helpers_gameLogic.js";

// reverse fisher-yates shuffle
const shuffle = (deck) => {
    for (let i = deck.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    return deck;
}

export class SingleGamestate {
    constructor() {
        this.deck = SingleGamestate.initialize_letter_deck(bananagrams_deck);
        this.dictionary = SingleGamestate.initialize_dictionary('./scrabble.txt');
        this.table_tiles = [];
        this.player_words = [];

        // take a tile from the deck and add it to the table
        this.draw = () => {
            let new_tile = this.deck.pop();
            this.table_tiles.push(new_tile);

            console.log(new_tile);
        };

        // apply the word finding function to verify a guessed word
        // if it is correct, remove pertinent table tiles or words and add new word
        this.guess = (word) => {
            let result = construct_word(word, this.table_tiles, this.player_words);

            if (result === null) return;

            for (const tile of result) {
                this.table_tiles.splice(this.table_tiles.indexOf(tile), 1);
            }
            this.player_words.push(word);
        }
    }

    // generate a randomly ordered list of letter tiles to start the game
    static initialize_letter_deck(deck_model) {
        let deck = [];
        for (const tile in deck_model) {
            deck = deck.concat(Array(deck_model[tile]).fill(tile))
        }
    
        return shuffle(deck);
    }

    // traverse a file of word entries to make word dictionary
    // note: filters out any words less than 3 letters
    static initialize_dictionary(file) {
        const data = fs.readFileSync(file, 'utf-8');

        let dict = data.split('\n');
        return dict.filter(x => x.length >= 3);
    }
}