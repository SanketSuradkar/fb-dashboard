import express from "express";
import axios from "axios";
import cors from "cors";

const app = express();
app.use(cors());

// Get Pages
app.get("/pages", async (req, res) => {
  const token = req.query.token;

  try {
    const response = await axios.get(
      `https://graph.facebook.com/v20.0/me/accounts?fields=id,name,access_token&access_token=${token}`
    );
    res.json(response.data);
  } catch (err) {
  console.log("FULL ERROR:", err.response?.data || err.message);
  res.status(500).json(err.response?.data || err.message);
}
});

// Get Insights
app.get("/insights", async (req, res) => {
  const { pageId, token } = req.query;

  try {
    const response = await axios.get(
  `https://graph.facebook.com/v20.0/${pageId}/insights`,
  {
    params: {
      metric: "page_impressions",
      period: "day",
      access_token: token,
    },
  }
);

    res.json(response.data);
  } catch (err) {
  console.log("FULL ERROR:", err.response?.data || err.message);
  res.status(500).json(err.response?.data || err.message);
}
});

app.listen(5000, () => console.log("Backend running on port 5000"));