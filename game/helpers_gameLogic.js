const word_is_valid = (word, dictionary) => {
  return dictionary.includes(word.toUpperCase());
};

/**
 * Processes a query word submitted by a player.
 *
 * @param {string} query_word
 * @param {Array<string>} center_tiles
 * @param {Array<string>} existing_words
 * @returns {Array<string>} - A list of words that can be used to construct the query word.
 */
const construct_word = (query_word, center_tiles, existing_words) => {
  // eligible_words consists of formed words and center tiles that contain only letters in the query_word
  let eligible_words = [];

  // Add formed words to eligible_words
  for (const word of existing_words) {
    let word_is_valid = true;
    let letters_in_this_word = query_word.split("");
    for (const letter of word) {
      let index = letters_in_this_word.includes(letter);
      if (index !== -1) {
        letters_in_this_word.splice(index, 1);
      } else {
        word_is_valid = false;
        break;
      }
    }
    if (word_is_valid) eligible_words.push(word);
  }

  // Add center tiles to eligible_words
  for (const letter of center_tiles) {
    if (query_word.includes(letter)) eligible_words.push(letter);
  }

  // Recursive function to find words combination
  const recur_find_words = (remainingLetters, words, selectedWords) => {
    // Base case: if no letters remain, a solution is found, return selected words
    if (remainingLetters.length === 0) return selectedWords;

    // Try each word in words to see if it helps match remaining letters
    for (let i = 0; i < words.length; i++) {
      let wordWorks = true;
      let word = words[i];
      let tempRemainingLetters = remainingLetters.slice();

      // Remove letters in the current word from tempRemainingLetters
      for (let letter of word) {
        let index = tempRemainingLetters.indexOf(letter);
        if (index !== -1) {
          tempRemainingLetters.splice(index, 1);
        } else wordWorks = false;
      }

      // If this word doesn't work with the remaining letters, move to the next word.
      if (!wordWorks) continue;

      // Check if the remaining letters were covered by including this word
      if (tempRemainingLetters.length < remainingLetters.length) {
        // Recursively try the remaining words with reduced letter requirements
        let newWords = words.slice(0, i).concat(words.slice(i + 1));
        let result = recur_find_words(
          tempRemainingLetters,
          newWords,
          selectedWords.concat(word)
        );

        // If a combination is found, return the words that make it up.
        if (result) return result;
      }
    }

    // If this combination is a dead end, return null
    return null;
  };

  // NOTE: This algorithm should correctly prioritize stealing words because center tiles are placed at the end of the eligible_words array

  let query_word_letters = query_word.split("");
  return recur_find_words(query_word_letters, eligible_words, []);
};
