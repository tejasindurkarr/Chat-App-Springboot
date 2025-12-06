let stompClient = null;
let users = new Set();

const chatArea = document.getElementById("chatArea");
const userList = document.getElementById("userList");
const typingDiv = document.getElementById("typing");

const usernameInput = document.getElementById("username");
const connectBtn = document.getElementById("connect");
const disconnectBtn = document.getElementById("disconnect");
const sendBtn = document.getElementById("send");
const messageInput = document.getElementById("message");
const themeBtn = document.getElementById("themeToggle");

let typingTimeout;

// sound notification
const sound = new Audio("https://cdn.pixabay.com/download/audio/2022/03/10/audio_0c80c5ea6e.mp3?filename=message-notification-2-185287.mp3");

function setConnected(isConnected) {
    connectBtn.disabled = isConnected;
    disconnectBtn.disabled = !isConnected;
    sendBtn.disabled = !isConnected;
}

function connect() {
    const username = usernameInput.value.trim();
    if (!username) return alert("Enter username");

    const socket = new SockJS("/ws");
    stompClient = Stomp.over(socket);

    stompClient.connect({}, () => {
        setConnected(true);

        stompClient.send("/app/chat.addUser", {}, JSON.stringify({ sender: username, type: "JOIN" }));

        stompClient.subscribe("/topic/public", (message) => {
            showMessage(JSON.parse(message.body));
        });
    });
}

function disconnect() {
    if (stompClient) stompClient.disconnect();
    setConnected(false);
    chatArea.innerHTML = "";
    userList.innerHTML = "";
    users.clear();
}

function sendMessage() {
    const username = usernameInput.value;
    const message = messageInput.value;

    if (!message) return;

    stompClient.send("/app/chat.sendMessage", {}, JSON.stringify({
        sender: username,
        content: message,
        type: "CHAT"
    }));

    messageInput.value = "";
}

function showMessage(msg) {
    if (msg.type === "JOIN") {
        users.add(msg.sender);
        updateUserList();
        chatArea.innerHTML += `<div class="system">${msg.sender} joined</div>`;
        return;
    }

    if (msg.type === "LEAVE") {
        users.delete(msg.sender);
        updateUserList();
        chatArea.innerHTML += `<div class="system">${msg.sender} left</div>`;
        return;
    }

    if (msg.type === "TYPING") {
        typingDiv.innerHTML = `${msg.sender} is typing...`;
        clearTimeout(typingTimeout);
        typingTimeout = setTimeout(() => typingDiv.innerHTML = "", 1400);
        return;
    }

    sound.play(); // notification sound
    chatArea.innerHTML += `
        <div class="msg">
            <b>${msg.sender}</b> ${msg.content}
            <span class="time">${msg.time}</span>
        </div>
    `;

    chatArea.scrollTop = chatArea.scrollHeight;
}

function updateUserList() {
    userList.innerHTML = "";
    users.forEach(u => {
        userList.innerHTML += `<div>${u}</div>`;
    });
}

messageInput.addEventListener("keypress", () => {
    const username = usernameInput.value;
    stompClient.send("/app/chat.typing", {}, JSON.stringify({ sender: username, type: "TYPING" }));
});

connectBtn.addEventListener("click", connect);
disconnectBtn.addEventListener("click", disconnect);
sendBtn.addEventListener("click", sendMessage);

messageInput.addEventListener("keypress", (e) => { if (e.key === "Enter") sendMessage(); });

// theme toggle
themeBtn.addEventListener("click", () => {
    document.body.classList.toggle("light");
    document.body.classList.toggle("dark");
});
