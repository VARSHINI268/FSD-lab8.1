require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors());
 
// Mock Database of Products
const products = {
  "laptop": { name: "High-End Workstation", price: 2500, region: "Conflict Zone" },
  "shirt": { name: "Cotton T-Shirt", price: 30, region: "Stable Zone" }
};
 
app.get('/api/analyze/:item', async (req, res) => {
  const item = req.params.item;
  const product = products[item];
 
  // SIMULATED NEWS FEED based on the war situation
  const newsHeadline = item === "laptop" 
    ? "War escalates in chip manufacturing hub, factories closing down." 
    : "Local textile markets see record harvest and peace.";
 
  try {
    // Calling a real NLP API to analyze the news sentiment
    const options = {
      method: 'POST',
      url: 'https://twinword-sentiment-analysis.p.rapidapi.com/analyze/',
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
        'X-RapidAPI-Host': process.env.RAPIDAPI_HOST
      },
      data: new URLSearchParams({ text: newsHeadline })
    };
 
    const response = await axios.request(options);
    const sentimentScore = response.data.score; // Negative score means bad news
 
    // Decision Logic: If sentiment is very negative and it's a critical item -> URGENT
    const isUrgent = sentimentScore < -0.3 && product.region === "Conflict Zone";
 
    res.json({
      ...product,
      newsHeadline,
      sentimentScore,
      isUrgent,
      recommendation: isUrgent ? "BUY NOW: Prices likely to spike" : "PRICE STABLE: Buy at leisure"
    });
  } catch (error) {
    console.error("API Error (Subscription/Rate Limit):", error.response ? error.response.data : error.message);
    
    // FAILOVER: Use local sentiment logic if API fails
    const localScore = newsHeadline.includes("War") || newsHeadline.includes("closing") ? -0.8 : 0.6;
    const isUrgent = localScore < -0.3 && product.region === "Conflict Zone";
    
    res.json({
      ...product,
      newsHeadline,
      sentimentScore: localScore, // Show the local score
      isUrgent,
      recommendation: isUrgent ? "BUY NOW: Prices likely to spike" : "PRICE STABLE: Buy at leisure"
    });
  }
});
 
app.listen(PORT, () => console.log(`Logic Server on Port ${PORT}`));

