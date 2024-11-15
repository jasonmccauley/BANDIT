const word_is_valid = (word, dictionary) => {
  return dictionary.includes(word);
};

const construct_word = (query_word, open_tiles, existing_words) => {
  let eligible_words = [];
  for (const word of existing_words) {
    let word_is_valid = true;
    let letters_in_this_word = word.split("");
    for (const letter of letters_in_this_word) {
      if (query_word.includes(letter)) {
        letters_in_this_word.remove(letter);
      } else {
        word_is_valid = false;
        break;
      }
    }
    if (word_is_valid) eligible_words.push(word);
  }

  // Check if the word can be made only by stealing existing words.
  let query_word_letters = query_word.split("");

  // Recursive function to find words combination
  const recur_find_words = (remainingLetters, words, selectedWords = []) => {
    // Base case: if no letters remain, a solution is found, return selected words
    if (remainingLetters.length === 0) return selectedWords;

    // Try each word in words to see if it helps match remaining letters
    for (let i = 0; i < words.length; i++) {
      let word = words[i];
      let tempRemainingLetters = remainingLetters.slice();

      // Remove letters in the current word from tempRemainingLetters
      for (let letter of word) {
        let index = tempRemainingLetters.indexOf(letter);
        if (index !== -1) {
          tempRemainingLetters.splice(index, 1);
        }
      }

      // Check if the remaining letters were covered by including this word
      if (tempRemainingLetters.length < remainingLetters.length) {
        // Recursively try the remaining words with reduced letter requirements
        let newWords = words.slice(0, i).concat(words.slice(i + 1));
        let result = recur_find_words(
          tempRemainingLetters,
          newWords,
          selectedWords.concat(word)
        );

        if (result) {
          return result;
        }
      }
    }

    // If no combination could match, return null
    return null;
  };

  let result = recur_find_words(query_word_letters, existing_words);

  // Check if the word can be made with center tiles and by stealing an existing word.

  // Check if the word can be made only with center tiles.
};
