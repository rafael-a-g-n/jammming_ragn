import { useEffect, useState } from "react";
import { Spotify } from "../../util/Spotify";

function Callback() {
  const [error, setError] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const state = params.get("state");
    const errorParam = params.get("error");

    if (errorParam) {
      setError(`Spotify authorization denied: ${errorParam}`);
      return;
    }

    if (!code || !state) {
      setError("Missing code or state in callback URL");
      return;
    }

    Spotify.handleCallback(code, state)
      .then(() => {
        window.location.replace("/");
      })
      .catch((err) => {
        setError(err.message);
      });
  }, []);

  if (error) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <h2>Authentication Error</h2>
        <p>{error}</p>
        <button onClick={() => (window.location.href = "/")}>Go back</button>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <p>Completing sign in…</p>
    </div>
  );
}

export default Callback;
