// API Configuration for Serverless Functions
// This file handles all API calls through Vercel serverless functions

// Determine the API base URL (use relative path for production, localhost for development)
const API_BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:3000/api"
    : "/api";

/**
 * Fetch data from NASA API through serverless function
 * @param {string} endpoint - The NASA API endpoint (apod, marsPhotos, imageSearch)
 * @param {object} params - Query parameters
 * @returns {Promise<object>} - API response
 */
async function fetchFromNASA(endpoint, params = {}) {
  try {
    // Build query string
    const queryParams = new URLSearchParams({ endpoint, ...params });
    const url = `${API_BASE_URL}/nasa?${queryParams.toString()}`;

    const response = await fetch(url);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch data");
    }

    return await response.json();
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
}

/**
 * Fetch Astronomy Picture of the Day
 * @param {string} date - Optional date in YYYY-MM-DD format
 * @returns {Promise<object>}
 */
async function fetchAPOD(date = null) {
  const params = date ? { date } : {};
  return fetchFromNASA("apod", params);
}

/**
 * Fetch Mars Rover Photos
 * @param {string} rover - Rover name (curiosity, opportunity, spirit)
 * @param {string} sol - Martian sol (day) - optional if earth_date provided
 * @param {string} earthDate - Earth date in YYYY-MM-DD format - optional if sol provided
 * @returns {Promise<object>}
 */
async function fetchMarsPhotos(rover, sol = null, earthDate = null) {
  const params = {
    rover: rover,
    path: `photos`,
  };

  if (sol) {
    params.sol = sol;
  } else if (earthDate) {
    params.earth_date = earthDate;
  } else {
    throw new Error('Either sol or earthDate must be provided');
  }

  return fetchFromNASA("marsPhotos", params);
}

/**
 * Search NASA image library
 * @param {string} query - Search query
 * @param {string} mediaType - Optional media type (image, video, audio)
 * @returns {Promise<object>}
 */
async function searchNASAImages(query, mediaType = "image") {
  return fetchFromNASA("imageSearch", {
    q: query,
    media_type: mediaType,
  });
}

// Export functions for use in main script
window.NASAServerless = {
  fetchAPOD,
  fetchMarsPhotos,
  searchNASAImages,
  fetchFromNASA,
};
