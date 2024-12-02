window.addEventListener("beforeunload", (event) => {
  if (window.isConnected) event.preventDefault();
});
