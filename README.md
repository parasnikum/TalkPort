# TalkPort

A powerful, customizable live chat widget for websites, built with Node.js, Express, Socket.io, and MongoDB. Easily integrate real-time chat, bot management, and analytics into your web projects.

## Features

* **Real-Time Chat**: Instant messaging between users and agents using Socket.io.
* **Bot Management**: Create, configure, and manage multiple chatbots with unique IDs.
* **Customizable Widget**: Dynamic widget HTML, CSS, and JS served per bot, allowing personalized greetings, colors, and titles.
* **User Authentication via Cookies**: Unique user tracking and session management.
* **Sound Notifications**: Custom sound effects for new messages.

## Installation

1. **Clone the repository**

   ```sh
   git clone https://github.com/parasnikum/TalkPort.git
   cd TalkPort
   ```

2. **Install dependencies**

   ```sh
   npm install
   ```

3. **Configure MongoDB**

   * Update your MongoDB connection string in `db.js`.

4. **Run the server**

   ```sh
   node index.js
   ```

   The server will start at `http://127.0.0.1:3000`.

## Usage

* **Frontend Integration**: Embed the widget by loading `/[botID]/widget.html` on your site.
* **Custom Styling**: Widget CSS is dynamically generated per bot via `/[botID]/style.css`.
* **Admin Panel**: Access `/admin` for bot management and analytics.

## Contributing

We welcome contributions! Please:

* Fork the repo and create your branch.
* Write clear, documented code.
* Add tests for new features.
* Submit a pull request with a detailed description.

## License

MIT

## Contact & Support

For issues, open a GitHub issue or contact the maintainer via GitHub.

---