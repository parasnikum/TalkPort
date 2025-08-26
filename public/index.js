const chatBox = document.querySelector('.cb-chat-box');
const toggleBtn = document.getElementById('chat-toggle');
const closeBtn = document.getElementById('close-chat');
const sendBtn = document.getElementById('send-btn');
const input = document.getElementById('chat-input');
const messages = document.getElementById('chat-messages');
const socket = io("http://localhost:3000");

toggleBtn.addEventListener('click', () => {
    chatBox.classList.toggle('cb-hidden');
});

closeBtn.addEventListener('click', () => {
    chatBox.classList.add('cb-hidden');
});

sendBtn.addEventListener('click', sendMessage);
input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

socket.on('connect', () => {
    console.log('Connected to server with ID:', socket.id);
    let id = getCookie("id");
    console.log(id);
    socket.emit('newUserLoaded', id);
});

socket.on("fetchChatHistory", (chats) => {
    reloadHistory(chats);
});

socket.on("receive-message", (data) => {
    const botReply = document.createElement('div');
    botReply.className = 'cb-chat-message cb-bot';
    botReply.textContent = data;
    messages.appendChild(botReply);
    messages.scrollTop = messages.scrollHeight;
});

function reloadHistory(chats) {
    chats.forEach((msg) => {
        const userMsg = document.createElement('div');
        if (msg.senderId == "Agent") {
            userMsg.className = 'cb-chat-message cb-bot';
        } else {
            userMsg.className = 'cb-chat-message cb-me';
        }
        userMsg.textContent = msg.msgContent;
        messages.appendChild(userMsg);
    });
}

function sendMessage() {
    const msg = input.value.trim();
    if (msg) {
        const userMsg = document.createElement('div');
        userMsg.className = 'cb-chat-message cb-me';
        userMsg.textContent = msg;
        messages.appendChild(userMsg);
        messages.scrollTop = messages.scrollHeight;
        input.value = '';
        let id = getCookie("id");
        let host = window.location.host;
        if (id) {
            id.time = Date.now();
            id.theDomain = host;
            const expirySeconds = 120 * 24 * 60 * 60;
            setCookie("id", id, expirySeconds, "/");
            socket.emit("visitor_message", { msg: msg, id: id });
        }
    }
}

function getCookie(name) {
    const cookieArr = document.cookie.split(';');
    for (let i = 0; i < cookieArr.length; i++) {
        let cookiePair = cookieArr[i].split('=');
        if (name === cookiePair[0].trim()) {
            try {
                return JSON.parse(decodeURIComponent(cookiePair[1]));
            } catch (e) {
                return null;
            }
        }
    }
    return 'null';
}

function setCookie(name, value, seconds, path = "/") {
    const expires = new Date(Date.now() + seconds * 1000).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(JSON.stringify(value))}; expires=${expires}; path=${path}; Secure; SameSite=None"`;
}
