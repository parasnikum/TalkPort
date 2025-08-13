// document.cookie = "username=john";


const chatBox = document.querySelector('.chat-box');
const toggleBtn = document.getElementById('chat-toggle');
const closeBtn = document.getElementById('close-chat');
const sendBtn = document.getElementById('send-btn');
const input = document.getElementById('chat-input');
const messages = document.getElementById('chat-messages');
const socket = io("http://localhost:3000");

// Show/hide chat box
toggleBtn.addEventListener('click', () => {
    chatBox.classList.toggle('hidden');
});

closeBtn.addEventListener('click', () => {
    chatBox.classList.add('hidden');
});

// Send message
sendBtn.addEventListener('click', sendMessage);
input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

socket.on('connect', () => {
    console.log('Connected to server with ID:', socket.id);
    let id = getCookie("id");
    // Emit custom event to server
    console.log(id);

    socket.emit('newUserLoaded', id);
});

socket.on("fetchChatHistory", (chats) => {
    reloadHistory(chats)
})

socket.on("receive-message", (data) => {
    const botReply = document.createElement('div');
    botReply.className = 'chat-message bot';
    botReply.textContent = data;
    messages.appendChild(botReply);
    messages.scrollTop = messages.scrollHeight;
})



function reloadHistory(chats) {
    chats.forEach((msg) => {
        const userMsg = document.createElement('div');
        if (msg.senderId == "Agent") {
            userMsg.className = 'chat-message bot';
        } else {
            userMsg.className = 'chat-message me';

        }
        userMsg.textContent = msg.msgContent;
        messages.appendChild(userMsg);
        //messages.scrollTop = messages.scrollHeight;
    })
}



function sendMessage() {
    const msg = input.value.trim();
    if (msg) {
        const userMsg = document.createElement('div');
        userMsg.className = 'chat-message me';
        userMsg.textContent = msg;
        messages.appendChild(userMsg);
        messages.scrollTop = messages.scrollHeight;
        input.value = '';
        let id = getCookie("id");
        let host = window.location.host;
        if (id) {
            id.time = Date.now(); // Update time first
            id.theDomain = host;
            const expirySeconds = 120 * 24 * 60 * 60;
            setCookie("id", id, expirySeconds, "/");
            console.log(id.time);
            socket.emit("visitor_message", { msg: msg, id: id });
        }
        // Simulated bot reply
        //setTimeout(() => {
        //    const botReply = document.createElement('div');
        //    botReply.className = 'chat-message bot';
        //    botReply.textContent = "Thanks for your message! 😊";
        //    messages.appendChild(botReply);
        //    messages.scrollTop = messages.scrollHeight;
        //}, 600);
    }
}

function getCookie(name) {
    const cookieArr = document.cookie.split(';'); // Split cookie string into an array
    console.log(document.cookie);


    for (let i = 0; i < cookieArr.length; i++) {
        let cookiePair = cookieArr[i].split('='); // Split each cookie into name and value
        /* Remove whitespace at the beginning of the cookie name and compare it with the given string */
        if (name === cookiePair[0].trim()) {
            try {
                // Decode the cookie value and return
                return JSON.parse(decodeURIComponent(cookiePair[1]));
            } catch (e) {
                return null; // Return null if JSON parsing fails
            }
        }
    }
    // Return null if not found
    return 'null';
}

function setCookie(name, value, seconds, path = "/") {
    const expires = new Date(Date.now() + seconds * 1000).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(JSON.stringify(value))}; expires=${expires}; path=${path}; Secure; SameSite=None"`;
}