/* this checks that when the user signs up, the system checks that the password matches the reentered password
This is done client side to prevent the form from resetting if the user names a typo
*/
let signupForm = document.getElementById("signupForm");

if (signupForm) {
  signupForm.addEventListener("submit", (event) => {
    try {
      event.preventDefault();
      let passwordInput = document.getElementById("passwordInput").value;
      let reenterPasswordInput = document.getElementById(
        "reenterPasswordInput"
      ).value;
      console.log(passwordInput);
      console.log(reenterPasswordInput);
      if (passwordInput.trim() !== reenterPasswordInput.trim()) {
        alert("Passwords do not match");
      } else {
        signupForm.submit();
      }
    } catch (e) {
      console.log(e.message);
      alert(`Error: ${e.message}`);
    }
  });
}
