# 🎵 Jammming RAGN 🎧

Welcome to **Jammming RAGN**, a dynamic web application that allows users to search for songs, create custom playlists, and save them directly to their Spotify account. This project showcases the power of modern web development technologies and API integrations.

---

## 🚀 Features

- 🔍 **Search for Songs**: Find your favorite tracks and artists using Spotify's API.
- 📂 **Create Playlists**: Build custom playlists with an intuitive drag-and-drop interface.
- 💾 **Save to Spotify**: Seamlessly save your playlists to your Spotify library.
- 🎨 **Responsive Design**: Enjoy a smooth experience on both desktop and mobile devices.

---

## 🛠️ Technologies Used

This project was built using:

- **JavaScript**: The core programming language for building dynamic and interactive features.  
- **React** ⚛️: A powerful JavaScript library for building user interfaces.  
- **HTML5** 🌐: The backbone for structuring the web application.  
- **CSS3** 🎨: Styling the app with modern, responsive designs.  
- **Spotify API** 🎵: Integration for seamless music search and playlist creation.  

---

## 💡 Skills Demonstrated

- ⚡ **React Component Architecture**: Creating reusable, modular components for better maintainability.
- 🛠️ **API Integration**: Efficiently fetching data from Spotify's API using `fetch` and `async/await`.
- 🎨 **CSS Styling**: Crafting responsive and visually appealing designs.
- 🌐 **State Management**: Managing application state with React's `useState` and `useEffect` hooks.
- 🖇️ **Version Control**: Leveraging Git and GitHub for collaboration and code management.

---

## 📋 How to Use

1. Clone this repository:
   ```bash
   git clone https://github.com/rafael-a-g-n/jammming_ragn.git
   ```
2. Navigate to the project directory:
   ```bash
   cd jammming_ragn
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Set up environment variables (see [Environment Setup](#-environment-setup) below).
5. Run the app:
   ```bash
   npm start
   ```
6. Open your browser and visit:
   ```
   http://localhost:3000
   ```

---

## 🔑 Environment Setup

### Spotify Developer Dashboard

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard) and log in.
2. Click **Create App** (or open your existing app).
3. In **Edit Settings → Redirect URIs**, add **both**:
   - `http://localhost:3000/callback` (for local development)
   - `https://jammming-ragn.vercel.app/callback` (for the Vercel deployment)
4. Save the settings and copy your **Client ID**.

### Local Development

Create a `.env` file in the project root (copy from `.env.example`):

```env
REACT_APP_SPOTIFY_CLIENT_ID=your_spotify_client_id_here
REACT_APP_SPOTIFY_REDIRECT_URI=http://localhost:3000/callback
```

### Vercel Deployment

In your Vercel project settings under **Environment Variables**, add:

| Variable | Value |
|---|---|
| `REACT_APP_SPOTIFY_CLIENT_ID` | Your Spotify Client ID |
| `REACT_APP_SPOTIFY_REDIRECT_URI` | `https://jammming-ragn.vercel.app/callback` |

> **Note:** The app uses the **Authorization Code flow with PKCE** — no client secret is required in the browser.

---

## 📧 Contact

- **Author**: Rafael A. G. N.  
- **GitHub**: [rafael-a-g-n](https://github.com/rafael-a-g-n)  
- **LinkedIn**: [Rafael Nogueira](https://www.linkedin.com/in/ragn/)  

---

## 🎉 Acknowledgments

Special thanks to Spotify for providing the API that made this app possible!
