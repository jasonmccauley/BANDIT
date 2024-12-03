// reverse fisher-yates shuffle
const shuffle = (deck) => {
    for (let i = deck.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    return deck;
}

// generate a randomly ordered list of letter tiles to start the game
export const initialize_letter_deck = (deck_model) => {
    let deck = [];
    for (const tile in deck_model) {
        deck = deck.concat(Array(deck_model[tile]).fill(tile))
    }

    return shuffle(deck);
}
