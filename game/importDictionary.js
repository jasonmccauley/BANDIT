/**
     * Load a new dictionary into the MongoDB with a trie structure
     * @param {string} file_path
     * @param {string} dictionary_name
     */
export const create_new_dictionary = async (file_path, dictionary_name) => {
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
}