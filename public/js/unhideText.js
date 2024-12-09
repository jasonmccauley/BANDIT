function unhideText() {
  const passwordInput = document.getElementById("passwordInput");
  const reenterPasswordInput = document.getElementById("reenterPasswordInput");
  const button = document.querySelector("button");

  if (
    passwordInput.type === "password" &&
    reenterPasswordInput.type === "password"
  ) {
    passwordInput.type = "text";
    reenterPasswordInput.type = "text";
    button.textContent = "Hide Password";
  } else {
    passwordInput.type = "password";
    reenterPasswordInput.type = "password";
    button.textContent = "Show Password";
  }
}
function unhideTextOne() {
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

function toggleEditProfileMenu() {
  const editMenu = document.getElementById("editProfileFormContainer");

  if (editMenu.classList.contains("hidden")) {
    editMenu.classList.remove("hidden");
  } else {
    editMenu.classList.add("hidden");
  }
}

if (
  document.getElementById("profile-container") ||
  document.getElementById("currentPlayer")
) {
  $("#banditContainer").attr("hidden", true);
} else {
  $("#banditContainer").attr("hidden", false);
}
