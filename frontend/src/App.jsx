
import { useEffect, useState } from "react";

function App() {
  const [since, setSince] = useState("");
  const [until, setUntil] = useState("");
  const [fbLoaded, setFbLoaded] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState("");
  const [pages, setPages] = useState([]);
  const [selectedPage, setSelectedPage] = useState("");
  const [insights, setInsights] = useState([]);
  const [pageToken, setPageToken] = useState("");

  // Load Facebook SDK
  useEffect(() => {
    window.fbAsyncInit = function () {
      window.FB.init({
        appId: "4348904768712814",
        cookie: true,
        xfbml: true,
        version: "v18.0",
      });

      console.log("FB SDK Ready");
      setFbLoaded(true);
    };

    const script = document.createElement("script");
    script.src = "https://connect.facebook.net/en_US/sdk.js";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
  }, []);

  // Login
  const login = () => {
    if (!fbLoaded || !window.FB) {
      alert("Facebook SDK not loaded yet");
      return;
    }

    window.FB.login(
      function (response) {
        if (response.authResponse) {
          const accessToken = response.authResponse.accessToken;
          setToken(accessToken);

          window.FB.api("/me", { fields: "name,picture" }, function (res) {
            setUser(res);
          });
        }
      },
      { scope: "pages_show_list,pages_read_engagement" }
    );
  };

  // Get Pages
  const getPages = async () => {
    const res = await fetch(
      `http://localhost:5000/pages?token=${token}`
    );
    const data = await res.json();
    setPages(data.data || []);
  };

  // Get Insights (UPDATED WITH DATE FILTER)
  const getInsights = async () => {
    if (!selectedPage || !pageToken) {
      alert("Please select a page first");
      return;
    }

    const res = await fetch(
      `http://localhost:5000/insights?pageId=${selectedPage}&token=${pageToken}&since=${since}&until=${until}`
    );

    const data = await res.json();
    console.log("Insights:", data);

    setInsights(data.data || []);
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h1>Facebook Dashboard</h1>

      {/* Login */}
      <button onClick={login} disabled={!fbLoaded}>
        {fbLoaded ? "Login with Facebook" : "Loading Facebook..."}
      </button>

      {/* User */}
      {user && (
        <>
          <h2>{user.name}</h2>
          <img src={user.picture.data.url} alt="profile" />
        </>
      )}

      <br />

      {/* Load Pages */}
      <button onClick={getPages}>Load Pages</button>

      {/* Dropdown */}
      <select
        onChange={(e) => {
          const selected = pages.find(p => p.id === e.target.value);
          if (selected) {
            setSelectedPage(selected.id);
            setPageToken(selected.access_token);
          }
        }}
      >
        <option value="">Select Page</option>
        {pages.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>

      {/* DATE FILTER (NEW) */}
      <div style={{ marginTop: "10px" }}>
        <input
          type="date"
          onChange={(e) => setSince(e.target.value)}
        />
        <input
          type="date"
          onChange={(e) => setUntil(e.target.value)}
        />
      </div>

      {/* Get Insights */}
      <button onClick={getInsights}>Get Insights</button>

      {/* Cards */}
      <div
        style={{
          display: "flex",
          gap: "20px",
          justifyContent: "center",
          marginTop: "20px",
          flexWrap: "wrap",
        }}
      >
        {Array.isArray(insights) &&
          insights.map((item) => (
            <div
              key={item.name}
              style={{
                border: "1px solid gray",
                padding: "10px",
                width: "180px",
                borderRadius: "10px",
              }}
            >
              <h3>{item.name}</h3>
              <p>{item.value}</p> {/* ✅ FIXED */}
            </div>
          ))}
      </div>
    </div>
  );
}

export default App;
