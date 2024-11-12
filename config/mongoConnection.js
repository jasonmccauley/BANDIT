import { MongoClient, ServerApiVersion } from "mongodb";
import { mongoConfig } from "./settings.js";

let _connection = undefined;
let _db = undefined;

export const dbConnection = async () => {
  if (!_connection) {
    const client = new MongoClient(mongoConfig.serverUrl, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
    });
    _connection = await client.connect();
    _db = _connection.db(mongoConfig.database);
  }

  return _db;
};

export const closeConnection = async () => {
  await _connection.close();
};
