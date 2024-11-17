import { users } from "../config/mongoCollections.js";
import { ObjectId } from "mongodb";
import bcrypt from "bcryptjs";
import * as validation from "../validation.js";

const saltRounds = 10;

// adds a user to the user collection and returns the created user as an object
export const createUser = async (username, password) => {
  let hash = await bcrypt.hash(password, saltRounds);
  let newUser = {
    username: username,
    password: hash,
    bio: "No description",
    dateOfBirth: new Date(),
    gamesPlayed: 0,
    gamesWon: 0,
  };

  const userCollection = await users();
  const insertInfo = await userCollection.insertOne(newUser);

  if (!insertInfo.acknowledged || !insertInfo.insertedId)
    throw new Error("could not add user");

  const newId = insertInfo.insertedId.toString();

  const user = await getUserById(newId);
  return user;
};

// returns a user object based on the given id
export const getUserById = async (id) => {
  validation.doesExist(id);
  id = validation.isProperString(id);
  id = validation.isValidObjectId(id);

  const userCollection = await users();
  const user = await userCollection.findOne({
    _id: ObjectId.createFromHexString(id),
  });

  if (!user) throw new Error("user not found");

  user["_id"] = user["_id"].toString();

  return user;
};

// returns a user object based on the given username
export const getUserByUsername = async (username) => {
  validation.doesExist(username);
  username = validation.isProperString(username);

  const userCollection = await users();
  const user = await userCollection.findOne({
    username: username,
  });

  if (!user) throw new Error("user not found");

  user["_id"] = user["_id"].toString();

  return user;
};

// returns if the entered password matches the hashed password for the current user
export const isPasswordCorrect = async (id, enteredPassword) => {
  validation.doesExist(id);
  id = validation.isProperString(id);
  id = validation.isValidObjectId(id);

  validation.doesExist(enteredPassword);
  enteredPassword = validation.isProperString(enteredPassword);

  const currentUser = await getUserById(id);
  const doesMatch = await bcrypt.compare(
    enteredPassword,
    currentUser["password"]
  );

  return doesMatch;
};
