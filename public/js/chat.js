$("#chatForm").submit((event) => {
  event.preventDefault();
  $("#chatError").text("");
  const message = $("#messageInput").val().trim();
  $("#messageInput").val("");
  const messageError = checkMessage(message);
  if (messageError) {
    $("#chatError").text(messageError);
    return;
  }

  const sanitizedMessage = DOMPurify.sanitize(message);
  const requestConfig = {
    method: "POST",
    url: `${window.location.protocol}//${window.location.host}/api/chat`,
    data: {
      username: username,
      message: sanitizedMessage,
    },
    headers: {
      ajax: "true",
    },
  };
  $.ajax(requestConfig).then(function (response) {
    socket.emit("sendChatMessage", {
      gameId: gameId,
      username: username,
      message: sanitizedMessage,
    });
  });
});

socket.on("newChatMessage", function (chatMessage) {
  const $messagesDiv = $("#messagesDiv");
  const messageElement = $(`<p class="chat-message">
    <span id="chat-username">${chatMessage.username}:</span> ${chatMessage.message}
  </p>`);
  $messagesDiv.append(messageElement);
  $messagesDiv.scrollTop($messagesDiv[0].scrollHeight);
});

const checkMessage = (message) => {
  if (!message) return "Error: You must provide a message";
  if (typeof message !== "string") return "Error: Message must be a string";
  if (message.length === 0) return "Error: Message cannot be just spaces";
  if (message.length > 255)
    return "Error: Message cannot be greater than 255 characters";
  return null;
};
