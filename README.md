# 🌌 Space Explorer 

A modern, responsive web application for exploring the cosmos using NASA's public APIs. Discover daily astronomy pictures, search NASA's vast image library, track near-Earth asteroids, and explore historic space missions—all in one beautiful interface.

**🔗 [View Live Demo](https://spacelens.vercel.app)**

---

## ✨ Features

### 📸 Astronomy Picture of the Day (APOD)
- Browse NASA's daily astronomy pictures with full metadata
- Date picker to explore historical images
- Full-screen image viewer for detailed viewing

### 🔍 NASA Image Library Search
- Search millions of images from NASA's public archive
- Keywords include: galaxy, nebula, planets, missions, and more
- Paginated results with dynamic loading
- Interactive space facts carousel

### ☄️ Near Earth Objects Tracker
- Real-time asteroid tracking using NASA's NEO API
- Comprehensive asteroid data:
  - Diameter and size estimates
  - Velocity and trajectory information
  - Earth approach distance
  - Potentially hazardous asteroid (PHA) indicators
- Flexible sorting: by distance, size, or speed
- Detailed information cards with NASA JPL integration

### 🚀 Space Missions Database
- Curated collection of historic and active space missions
- Mission status tracking (Active/Completed)
- Quick access to mission details and achievements

---

##  File Structure

```
iwt-project/
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

## 🛡️ Rate Limiting (Important!)

The app has **smart rate limiting** to prevent API abuse:

### Limits Per Hour:
- APOD: 10 requests
- Search: 15 requests
- Asteroids: 10 requests
- **Total: 30/hour** (with DEMO_KEY)

### Features:
- Shows remaining requests in UI
- Auto-resets every hour
- Blocks rapid-fire spam (>5 requests in 10 seconds)
- Warning banners when limit reached
- Saves your usage even if you refresh

**With personal API key:** 1,000/hour limit

---

## 🎨 Technical Highlights

- **Multi-layer Animated Starfield** - Parallax star background for immersive experience
- **Smooth Animations** - CSS transitions and transforms throughout
- **Fully Responsive** - Optimized for mobile, tablet, and desktop viewports
- **Adaptive Navigation** - Expandable sidebar with mobile-friendly slide menu
- **Image Gallery** - Full-screen modal viewer with smooth transitions
- **Loading States** - User-friendly feedback during API requests
- **Robust Error Handling** - Graceful degradation with informative messages
- **Client-side Rate Limiting** - Prevents API abuse with smart request tracking

---

## � Usage Guide

### Astronomy Picture of the Day
1. View automatically loads today's featured astronomy image
2. Use the date picker to browse historical archives
3. Click images for full-screen viewing experience

### Image Search
1. Enter search terms (e.g., "galaxy", "mars", "nebula", "hubble")
2. Submit via search button or Enter key
3. Browse results in responsive card layout
4. Load additional results with "Show More" button
5. Click images to view in full-screen modal

### Near Earth Objects
1. Select a date using the date picker (up to 7 days in past)
2. Click "Find Asteroids" to retrieve data
3. View summary statistics (total count, hazardous objects, closest approach)
4. Browse individual asteroid details with size, speed, and distance
5. Sort results by distance, size, or velocity
6. Expand full list with "Show More" functionality
7. Access detailed NASA JPL Small-Body Database information

### Space Missions
1. Browse curated mission cards
2. Filter by mission status (Active/Completed)
3. Expand full mission list with "Show More"

---

## �️ Technologies Used

### Frontend
- **HTML5** - Semantic markup structure
- **CSS3** - Modern styling with animations and responsive design
- **Vanilla JavaScript (ES6+)** - No frameworks, pure JavaScript

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

## 🐛 Troubleshooting

**"No asteroids found"**
- Try a different date
- NASA tracks more asteroids on recent dates

**Images not loading**
- Check internet connection
- Check browser console (F12) for errors
- Might have hit rate limit (wait an hour)

**Search shows nothing**
- Try simpler keywords: "moon", "mars", "galaxy"
- NASA Image Library might be slow sometimes

**Rate limit warning**
- You've used too many requests this hour
- Wait for the timer to reset
- Or get a personal API key for higher limits

---


## 📄 License

MIT License - feel free to use this project for learning and inspiration.

---

All space images © NASA (public domain)

---

**Made with ❤️ by Abdulqadir Bearingwala**

🚀 Keep exploring the cosmos! 🌌