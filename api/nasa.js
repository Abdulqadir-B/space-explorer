// Serverless function to proxy NASA API requests securely
// This protects your API key from being exposed in the frontend

const NASA_API_KEY = process.env.NASA_API_KEY || "DEMO_KEY";

module.exports = async (req, res) => {
  // Enable CORS for your frontend
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Only allow GET requests
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { endpoint, ...params } = req.query;

    // Define allowed NASA API endpoints
    const endpoints = {
      apod: "https://api.nasa.gov/planetary/apod",
      neo: "https://api.nasa.gov/neo/rest/v1/feed",
      imageSearch: "https://images-api.nasa.gov/search",
    };

    // Validate endpoint
    if (!endpoint || !endpoints[endpoint]) {
      return res.status(400).json({
        error: "Invalid endpoint. Allowed: apod, neo, imageSearch",
      });
    }

    // Build NASA API URL
    let nasaUrl = endpoints[endpoint];

    // Add API key for NASA API endpoints (not needed for images API)
    const queryParams = new URLSearchParams(params);
    if (endpoint !== "imageSearch") {
      queryParams.append("api_key", NASA_API_KEY);
    }

    const fullUrl = `${nasaUrl}?${queryParams.toString()}`;

    // Fetch from NASA API
    const response = await fetch(fullUrl);
    const data = await response.json();

    // Return the data
    return res.status(response.status).json(data);
  } catch (error) {
    console.error("NASA API Error:", error);
    return res.status(500).json({
      error: "Failed to fetch data from NASA API",
      message: error.message,
    });
  }
};
