# Space Explorer

A modern, responsive web application for exploring the cosmos using NASA's public APIs. Discover daily astronomy pictures, search NASA's vast image library, track near-Earth asteroids, and explore historic space missions—all in one beautiful interface.

[View Live Demo](https://spacelens.vercel.app)

---

## Features

### Astronomy Picture of the Day (APOD)

Browse NASA's daily astronomy pictures with full metadata. Use the date picker to explore historical images and click on any image for a full-screen view.

### NASA Image Library Search

Search millions of images from NASA's public archive with keywords like galaxy, nebula, and planets. Results are paginated and include an interactive space facts carousel.

### Near Earth Objects Tracker

Track asteroids in real-time using NASA's NEO API. View comprehensive data including diameter, velocity, and Earth approach distance. The tracker identifies potentially hazardous asteroids and offers sorting by distance, size, or speed.

### Space Missions Database

A curated collection of historic and active space missions, tracking their status and achievements.

---

##  File Structure

```
space-explorer/
├── index.html           # Main page
├── css/
│   └── style.css       # All styling + animations
├── js/
│   ├── api-client.js   # API helper functions
│   └── script.js       # Main app logic
├── api/
│   └── nasa.js         # Serverless function (Vercel)
├── package.json
├── vercel.json         # Deployment config
└── README.md
```

---

## Technical Highlights

- **Multi-layer Animated Starfield:** Parallax star background for an immersive experience
- **Smooth Animations:** CSS transitions and transforms throughout the interface
- **Fully Responsive:** Optimized for mobile, tablet, and desktop viewports
- **Adaptive Navigation:** Expandable sidebar with a mobile-friendly slide menu
- **Image Gallery:** Full-screen modal viewer with smooth transitions
- **Loading States:** User-friendly feedback during API requests
- **Robust Error Handling:** Graceful degradation with informative messages
- **Client-side Rate Limiting:** Prevents API abuse with smart request tracking

---

## Usage Guide

The application is divided into four main sections:

**Astronomy Picture of the Day**
Automatically loads the featured image for the current day. You can use the date picker to view images from the past and click on any image for a full-screen view.

**Image Search**
Search the universe by entering keywords (e.g., "galaxy", "Mars"). Browse the results in a responsive grid and click "Show More" to load additional content.

**Near Earth Objects**
Select a date to retrieve data on asteroids passing close to Earth (up to 7 days in the past). You can sort results by distance, size, or speed, and view detailed statistics for each object.

**Space Missions**
Explore curated cards of notable space missions, which can be filtered by their active or completed status.

---

## Technologies Used

### Frontend

- **HTML5:** Semantic markup structure
- **CSS3:** Modern styling with animations and responsive design
- **Vanilla JavaScript (ES6+):** No frameworks, pure JavaScript

### APIs

- **[APOD API](https://api.nasa.gov/)** - Astronomy Picture of the Day
- **[NASA Image and Video Library](https://images.nasa.gov/)** - Media archive search
- **[NeoWs API](https://api.nasa.gov/)** - Near Earth Object Web Service

### Deployment

- **Vercel** - Serverless functions and static hosting

### Additional

- **Bootstrap Icons** - UI iconography
- **Google Fonts** - Inter & Space Grotesk typefaces

---

## Troubleshooting

- **No asteroids found:** Try selecting a different date, as NASA tracks more asteroids on recent dates.
- **Images not loading:** Check your internet connection or browser console for errors. You might have hit the API rate limit (resets hourly).
- **Search shows nothing:** Try simpler keywords like "moon" or "galaxy".
- **Rate limit warning:** The application limits requests to prevent abuse. Please wait for the timer to reset or use a personal API key.

---

## License

MIT License - feel free to use this project for learning and inspiration.

All space images © NASA (public domain)

---

**Made by Abdulqadir Bearingwala**

Keep exploring the cosmos.
