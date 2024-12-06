window.addEventListener("beforeunload", (event) => {
  if (isConnected) event.preventDefault();
});
