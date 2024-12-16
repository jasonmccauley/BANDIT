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

//check for valid password reqs
export function checkPassword(strVal) {
  if (!strVal) throw new Error(`You must supply a Password!`);
  if (!/\d/.test(strVal)) throw new Error(`Password must have at least one number!`);
  if (!/[A-Z]/.test(strVal)) throw new Error(`Password must have at least one uppercase letter!`);
  if (!/[^a-zA-Z0-9]/.test(strVal)) throw new Error(`Password must have at least one special character!`);
  if (strVal.length < 8) throw new Error(`Password must be between 5 and 10 characters.`);
  return strVal;
}

// check if date is valid
export function isValidDate(date) {
  if (isNaN(new Date(date))){
    //console.log("date entered" + date);
    throw new Error("invalid date");
  } 

  hasValidLength(date, 10);

  //let inputDate = new Date(date);
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    //console.log("invalid date format: " + date);
    throw new Error("Invalid date format. Expected MM/DD/YYYY.");
  }
  const [year, month, day] = date.split('-').map(Number);
  const inputDate = new Date(Date.UTC(year, month - 1, day));

  /*
  yyyy-mm-dd

  year = substring(0,4)
  month = substring(5,7)
  day = substring(8,10)
  */

  if (
    inputDate.getUTCFullYear() !== year ||
    inputDate.getUTCMonth() + 1 !== month ||
    inputDate.getUTCDate() !== day
  ) {
    //console.log("date entered" + inputDate);
    throw new Error("invalid date");
  }

  let currentDate = new Date();

  let age = currentDate.getFullYear() - year;
  let monthDifference = currentDate.getMonth() - month -1;

  if (
    monthDifference < 0 ||
    (monthDifference === 0 && currentDate.getDate() < day)
  ) {
    age--;
  }
  return age;
}

export function checkMessage(message) {
  if (!message) throw "Error: You must provide a message";
  if (typeof message !== "string") throw "Error: Message must be a string";
  if (message.length === 0) throw "Error: Message cannot be just spaces";
  if (message.length > 255)
    throw "Error: Message cannot be greater than 255 characters";
  return message;
}
