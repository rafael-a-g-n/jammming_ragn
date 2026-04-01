const CLIENT_ID =
  process.env.REACT_APP_SPOTIFY_CLIENT_ID || "a1a922dd947e410384a67b9abf6474d7";
const REDIRECT_URI =
  process.env.REACT_APP_SPOTIFY_REDIRECT_URI ||
  (window.location.hostname === "localhost"
    ? "http://localhost:3000/callback"
    : "https://jammming-ragn.vercel.app/callback");

const SCOPES = "playlist-modify-public playlist-modify-private";
const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
const TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token";
const TOKEN_REFRESH_BUFFER_MS = 60000; // Refresh 60 s before expiry

// In-memory token storage
let accessToken = null;
let refreshToken = null;
let tokenExpiresAt = null;

// --- PKCE Helpers ---
function base64UrlEncode(buffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function generateCodeVerifier() {
  const array = new Uint8Array(32);
  window.crypto.getRandomValues(array);
  return base64UrlEncode(array);
}

async function generateCodeChallenge(verifier) {
  const data = new TextEncoder().encode(verifier);
  const digest = await window.crypto.subtle.digest("SHA-256", data);
  return base64UrlEncode(digest);
}

function generateState() {
  const array = new Uint8Array(16);
  window.crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
}

// --- Token Management ---
function storeTokens(access, refresh, expiresIn) {
  accessToken = access;
  refreshToken = refresh;
  tokenExpiresAt = Date.now() + expiresIn * 1000 - TOKEN_REFRESH_BUFFER_MS;
  if (refresh) {
    sessionStorage.setItem("spotify_refresh_token", refresh);
  }
}

function isTokenExpired() {
  return !tokenExpiresAt || Date.now() >= tokenExpiresAt;
}

async function refreshAccessToken() {
  const storedRefresh =
    refreshToken || sessionStorage.getItem("spotify_refresh_token");
  if (!storedRefresh) return null;

  const params = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: storedRefresh,
    client_id: CLIENT_ID,
  });

  const response = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });

  if (!response.ok) {
    accessToken = null;
    refreshToken = null;
    tokenExpiresAt = null;
    sessionStorage.removeItem("spotify_refresh_token");
    return null;
  }

  const data = await response.json();
  storeTokens(
    data.access_token,
    data.refresh_token || storedRefresh,
    data.expires_in
  );
  return accessToken;
}

const Spotify = {
  async login() {
    const verifier = generateCodeVerifier();
    const state = generateState();
    const challenge = await generateCodeChallenge(verifier);

    sessionStorage.setItem("pkce_code_verifier", verifier);
    sessionStorage.setItem("pkce_state", state);

    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      response_type: "code",
      redirect_uri: REDIRECT_URI,
      scope: SCOPES,
      state: state,
      code_challenge_method: "S256",
      code_challenge: challenge,
    });

    window.location.href = `${AUTH_ENDPOINT}?${params.toString()}`;
  },

  async handleCallback(code, state) {
    const storedState = sessionStorage.getItem("pkce_state");
    const verifier = sessionStorage.getItem("pkce_code_verifier");

    if (!storedState || state !== storedState) {
      throw new Error("State mismatch: possible CSRF attack");
    }

    if (!verifier) {
      throw new Error("No code verifier found");
    }

    sessionStorage.removeItem("pkce_state");
    sessionStorage.removeItem("pkce_code_verifier");

    const params = new URLSearchParams({
      grant_type: "authorization_code",
      code: code,
      redirect_uri: REDIRECT_URI,
      client_id: CLIENT_ID,
      code_verifier: verifier,
    });

    const response = await fetch(TOKEN_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error_description || "Token exchange failed");
    }

    const data = await response.json();
    storeTokens(data.access_token, data.refresh_token, data.expires_in);
    return data.access_token;
  },

  async getAccessToken() {
    if (accessToken && !isTokenExpired()) return accessToken;

    const refreshed = await refreshAccessToken();
    if (refreshed) return refreshed;

    await Spotify.login();
    return null;
  },

  async search(term, _isRetry = false) {
    const token = await Spotify.getAccessToken();
    if (!token) return [];

    const response = await fetch(
      `https://api.spotify.com/v1/search?type=track&q=${encodeURIComponent(term)}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (response.status === 401 && !_isRetry) {
      const newToken = await refreshAccessToken();
      if (!newToken) {
        await Spotify.login();
        return [];
      }
      return Spotify.search(term, true);
    }

    if (!response.ok) return [];

    const data = await response.json();
    if (!data.tracks) return [];

    return data.tracks.items.map((t) => ({
      id: t.id,
      name: t.name,
      artist: t.artists[0].name,
      album: t.album.name,
      uri: t.uri,
    }));
  },

  async savePlaylist(name, trackUris) {
    if (!name || !trackUris || !trackUris.length) return;

    const token = await Spotify.getAccessToken();
    if (!token) return;

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const meResponse = await fetch("https://api.spotify.com/v1/me", {
      headers,
    });
    if (!meResponse.ok) throw new Error("Failed to fetch user profile");
    const meData = await meResponse.json();
    const userId = meData.id;

    const playlistResponse = await fetch(
      `https://api.spotify.com/v1/users/${userId}/playlists`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({ name }),
      }
    );
    if (!playlistResponse.ok) throw new Error("Failed to create playlist");
    const playlistData = await playlistResponse.json();
    const playlistId = playlistData.id;

    const tracksResponse = await fetch(
      `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({ uris: trackUris }),
      }
    );
    if (!tracksResponse.ok) throw new Error("Failed to add tracks to playlist");
  },
};

export { Spotify };
