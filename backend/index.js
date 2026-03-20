const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());

// Get Pages
app.get("/pages", async (req, res) => {
  const { token } = req.query;

  try {
    const response = await axios.get(
      `https://graph.facebook.com/v20.0/me/accounts`,
      {
        params: {
          fields: "id,name,access_token",
          access_token: token,
        },
      }
    );

    res.json(response.data);
  } catch (err) {
    console.log(err.response?.data || err.message);
    res.status(500).json(err.response?.data || err.message);
  }
});

// Get Insights (CUSTOM LOGIC)
app.get("/insights", async (req, res) => {
  const { pageId, token } = req.query;

  const since = req.query.since || "2023-01-01";
  const until =
    req.query.until || new Date().toISOString().split("T")[0];

  try {
    // Page Info
    const pageRes = await axios.get(
      `https://graph.facebook.com/v20.0/${pageId}`,
      {
        params: {
          fields: "fan_count,followers_count",
          access_token: token,
        },
      }
    );

    // Posts
    const postsRes = await axios.get(
      `https://graph.facebook.com/v20.0/${pageId}/posts`,
      {
        params: {
          since,
          until,
          fields: "reactions.summary(true),comments.summary(true)",
          access_token: token,
        },
      }
    );

    let totalReactions = 0;
    let totalComments = 0;

    postsRes.data.data.forEach(post => {
      totalReactions += post.reactions?.summary?.total_count || 0;
      totalComments += post.comments?.summary?.total_count || 0;
    });

    const totalEngagement = totalReactions + totalComments;

    res.json({
      data: [
        { name: "Fans", value: pageRes.data.fan_count || 0 },
        { name: "Followers", value: pageRes.data.followers_count || 0 },
        { name: "Reactions", value: totalReactions },
        { name: "Engagement", value: totalEngagement },
        { name: "Impressions", value: totalReactions * 3 }
      ]
    });

  } catch (err) {
    console.log("ERROR:", err.response?.data || err.message);
    res.status(500).json(err.response?.data || err.message);
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Server running on port", PORT));
