import { dbConnection } from "./mongoConnection.js";

const getCollectionFn = (collection) => {
  let _col = undefined;

  return async () => {
    if (!_col) {
      const db = await dbConnection();
      _col = await db.collection(collection);
    }

    return _col;
  };
};

/* add as many collections as needed using the following naming convention:

export const things = getCollectionFn('things');
*/
export const tests = getCollectionFn("tests");
