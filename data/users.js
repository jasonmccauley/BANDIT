import { users } from "../config/mongoCollections.js";
import { ObjectId } from "mongodb";
import bcrypt from "bcryptjs";

//import * as validation from '../validation.js'
const saltRounds = 10;

// adds a user to the user collection and returns the created user as an object
export const createUser = async (username, password) => {
  let hash = await bcrypt.hash(password, saltRounds);
  let newUser = { username: username, password: hash };

  const userCollection = await users();
  const insertInfo = await userCollection.insertOne(newUser);

  if (!insertInfo.acknowledged || !insertInfo.insertedId)
    throw new Error("could not add user");

  //const team = await getTeamById(newId);
  //return team;
};

export const getUserById = async (id) => {};
