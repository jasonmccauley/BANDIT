function unhideText() {
  const passwordInput = document.getElementById("passwordInput");
  const button = document.querySelector("button");

  if (passwordInput.type === "password") {
    passwordInput.type = "text";
    button.textContent = "Hide Password";
  } else {
    passwordInput.type = "password";
    button.textContent = "Show Password";
  }
}
