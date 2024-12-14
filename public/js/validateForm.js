function doesExist(input) {
  if (!input && input !== 0 && input !== false && input !== "") {
    throw new Error(`parameter does not exist`);
  }
}

// check if parameter is string and is not empty
function isProperString(input) {
  if (typeof input !== "string") {
    throw new Error("parameter is not a string");
  } else if (input.trim().length === 0) {
    throw new Error("parameter is an empty string");
  }
  return input.trim();
}

function hasValidLength(input, x) {
  if (input.length !== x) {
    throw new Error(`parameter does not have a length of ${x}`);
  }
}

//check for valid password reqs
function checkPassword(strVal) {
  if (!strVal) throw new Error(`You must supply a Password!`);
  if (!/\d/.test(strVal)) throw new Error(`Password must have at least one number!`);
  if (!/[A-Z]/.test(strVal)) throw new Error(`Password must have at least one uppercase letter!`);
  if (!/[^a-zA-Z0-9]/.test(strVal)) throw new Error(`Password must have at least one special character!`);
  if (strVal.length < 8) throw new Error(`Password must be between 5 and 10 characters.`);
  return strVal;
}

function isValidDate(date) {
  if (isNaN(new Date(date))) throw new Error("invalid date");

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

$("#signupForm").on("submit", (event) => {
  try {
    if ($("#birthdayInput").attr("type") !== "date") {
      throw new Error("Stop touching the DOM :/");
    }

    let usernameInput = DOMPurify.sanitize($("#usernameInput").val());
    let passwordInput = DOMPurify.sanitize($("#passwordInput").val());
    let reenterPasswordInput = DOMPurify.sanitize(
      $("#reenterPasswordInput").val()
    );
    let birthdayInput = DOMPurify.sanitize($("#birthdayInput").val());

    doesExist(usernameInput);
    doesExist(passwordInput);
    doesExist(reenterPasswordInput);
    doesExist(birthdayInput);

    $("#usernameInput").val(isProperString(usernameInput));
    $("#passwordInput").val(isProperString(passwordInput));
    $("#reenterPasswordInput").val(isProperString(reenterPasswordInput));
    $("#birthdayInput").val(isProperString(birthdayInput));
    
    passwordInput = checkPassword(passwordInput);
    let age = isValidDate(birthdayInput);
    

    if (age < 13) {
      throw new Error("Children younger than 13 are not allowed due to COPPA");
    }
    if (passwordInput !== reenterPasswordInput) {
      throw new Error("Passwords do not match");
    }
  } catch (e) {
    event.preventDefault();
    alert(`Error: ${e.message}`);
  }
});

$("#loginForm").on("submit", (event) => {
  try {
    let usernameInput = DOMPurify.sanitize($("#usernameInput").val());
    let passwordInput = DOMPurify.sanitize($("#passwordInput").val());

    doesExist(usernameInput);
    doesExist(passwordInput);

    $("#usernameInput").val(isProperString(usernameInput));
    $("#passwordInput").val(isProperString(passwordInput));
  } catch (e) {
    event.preventDefault();
    alert(`Error: ${e.message}`);
  }
});

$("#editProfileForm").on("submit", (event) => {
  try {
    let newBio = DOMPurify.sanitize($("#newBio").val());

    doesExist(newBio);

    $("#newBio").val(isProperString(newBio));
  } catch (e) {
    event.preventDefault();
    alert(`Error: ${e.message}`);
  }
});
