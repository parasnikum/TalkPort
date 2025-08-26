(function () {
  const botId = `{{WIDGET_ID}}` || "default-bot";
  const scriptBase = "http://127.0.0.1:3000";
  
  // Load CSS once
  if (!document.getElementById("chat-widget-style")) {
    const link = document.createElement("link");
    link.id = "chat-widget-style";
    link.rel = "stylesheet";
    link.href = `${scriptBase}/${botId}/style.css`;
    document.head.appendChild(link);
  }



  // Inject container once
  if (!document.getElementById("chat-widget-container")) {
    const container = document.createElement("div");
    container.id = "chat-widget-container";
    document.body.appendChild(container);
  }
  const container = document.getElementById("chat-widget-container");

  // Fetch and inject widget HTML
  fetch(`${scriptBase}/${botId}/widget.html?botId=${botId}`)
    .then((res) => res.text())
    .then((html) => {
      container.innerHTML = html;
      // Load JS logic after HTML is injected
      if (!document.getElementById("chat-widget-script")) {
        
        console.log(html);
        
        const socketScript = document.createElement('script');
        // socketScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/socket.io/4.8.1/socket.io.js';
        // socketScript.integrity = 'sha512-8BHxHDLsOHx+flIrQ0DrZcea7MkHqRU5GbTHmbdzMRnAaoCIkZ97PqZcXJkKZckMMhqfoeaJE+DNUVuyoQsO3Q==';
        // socketScript.crossOrigin = 'anonymous';
        // socketScript.referrerPolicy = 'no-referrer';
        socketScript.src = "http://127.0.0.1:3000/socket.js"
        socketScript.crossOrigin = 'anonymous';
        socketScript.referrerPolicy = 'no-referrer';
        socketScript.defer = true;
          socketScript.onload = () => {
            // now io is available globally
            const socket = io("http://127.0.0.1:3000");
            // your socket code here
          };

        document.body.appendChild(socketScript);


        const script = document.createElement("script");
        script.id = "chat-widget-script";
        script.src = `${scriptBase}/index.js`;
        script.defer = true;
        script.type = "module";  // optional: use if your index.js is ES module
        script.onload = () => {
          console.log("Chat widget script loaded.");
        };
        document.body.appendChild(script);
      }
    })
    .catch((err) => console.error("Failed to load widget HTML:", err));
})();
