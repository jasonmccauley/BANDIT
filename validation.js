// most of these are from my labs
import { ObjectId } from "mongodb";

// checks if parameter exists
export function doesExist(input) {
  if (!input && input !== 0 && input !== false && input !== "") {
    throw new Error(`parameter does not exist`);
  }
}

// checks if parameter is an array
export function isProperArray(input) {
  if (!Array.isArray(input)) {
    throw new Error("input is not an array");
  } else if (input.length === 0) {
    throw new Error("input is an empty array");
  }
}

// check if parameter is string and is not empty
export function isProperString(input) {
  if (typeof input !== "string") {
    throw new Error("parameter is not a string");
  } else if (input.trim().length === 0) {
    throw new Error("parameter is an empty string");
  }
  return input.trim();
}
// checks if parameter is a number
export function isNumber(input) {
  if (typeof input !== "number" || isNaN(input)) {
    throw new Error("parameter is not a number");
  }
}
// checks if array or string has a length equal to x
export function hasValidLength(input, x) {
  if (input.length !== x) {
    throw new Error(`parameter does not have a length of ${x}`);
  }
}

// checks that input is a non-empty object
export function isProperObject(input) {
  if (typeof input !== "object" || Array.isArray(input) || input === null) {
    throw new Error("parameter is not an object");
  } else if (Object.keys(input).length === 0) {
    throw new Error("object is empty");
  }
}

// check if string is valid ObjectId
export function isValidObjectId(id) {
  doesExist(id);
  isProperString(id);
  if (!ObjectId.isValid(id.trim())) throw new Error("invalid object ID");

  return id.trim();
}

// check if date is valid
export function isValidDate(date) {
  if (isNaN(new Date(date))) throw new Error("invalid date");
}
