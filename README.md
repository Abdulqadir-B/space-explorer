# 🌌 Astronomy & Space Facts Browser

A beautiful, interactive web application for exploring space through NASA's amazing APIs. Browse daily astronomy pictures, search celestial objects, view Mars Rover photos, and learn about historic space missions.

## ✨ Features

- **📸 Astronomy Picture of the Day (APOD)**: View stunning daily space images with detailed descriptions
- **🔍 Search the Universe**: Search NASA's vast image library for galaxies, nebulae, planets, and more
- **🔴 Mars Rover Photos**: Browse photos from Curiosity, Opportunity, Spirit, and Perseverance rovers
- **🚀 Space Missions**: Learn about notable space missions from Apollo 11 to James Webb Space Telescope
- **⚡ Advanced Rate Limiting**: Smart API usage management with per-endpoint limits and abuse detection
- **🎨 Dark Space Theme**: Beautiful starfield animation and cosmic design
- **📱 Fully Responsive**: Works perfectly on desktop, tablet, and mobile devices

## 🛡️ Rate Limiting System

This project includes a comprehensive rate limiting system to prevent API abuse and ensure fair usage:

### Features:

- ✅ **Token Bucket Algorithm**: Smooth rate limiting with automatic token refills
- ✅ **Per-Endpoint Limits**: Different limits for different API endpoints
- ✅ **Abuse Detection**: Detects and blocks rapid-fire requests (>5 in 10 seconds)
- ✅ **Visual Feedback**: Color-coded counter and warning banners
- ✅ **Persistent Storage**: Tracks usage across page reloads
- ✅ **Auto-Reset**: Limits reset after 1 hour automatically

### Rate Limits:

- **APOD**: 10 requests/hour
- **Search**: 15 requests/hour
- **Mars Photos**: 10 requests/hour
- **Global**: 30 total requests/hour (DEMO_KEY limit)

📖 **See [RATE_LIMITING.md](./RATE_LIMITING.md) for detailed documentation**

## 🚀 Getting Started

### Quick Start

1. Simply open `index.html` in your web browser
2. No installation or build process required!
3. Start exploring the cosmos

### Upgrade Your API Key (Recommended)

The project currently uses NASA's `DEMO_KEY` which has a limit of **30 requests per hour**.

**To get unlimited access (1000 requests/hour):**

1. Visit: https://api.nasa.gov/
2. Scroll to "Generate API Key"
3. Fill in your name and email
4. Click "Signup" - you'll instantly receive your API key
5. Open `js/script.js`
6. Replace line 2:
   ```javascript
   const NASA_API_KEY = "DEMO_KEY";
   ```
   with:
   ```javascript
   const NASA_API_KEY = "YOUR_API_KEY_HERE";
   ```

## 📁 Project Structure

```
iwt-project/
├── index.html          # Main HTML file
├── css/
│   └── style.css      # All styling and animations
├── js/
│   └── script.js      # NASA API integration and functionality
└── README.md          # This file
```

## 🛠️ Technologies Used

- **HTML5**: Semantic markup
- **CSS3**: Modern styling, animations, grid/flexbox layouts
- **Vanilla JavaScript**: ES6+ features, Fetch API
- **NASA APIs**:
  - APOD (Astronomy Picture of the Day)
  - NASA Image and Video Library
  - Mars Rover Photos API

## 🌟 Usage Guide

### APOD Section

- View today's astronomy picture automatically
- Use the date picker to explore past pictures
- Click images to view in fullscreen modal

### Search Section

- Enter keywords like "galaxy", "nebula", "jupiter", "mars"
- Browse up to 30 results per search
- Click any image for fullscreen view with description

### Mars Rovers Section

- Select rover: Curiosity, Opportunity, Spirit, or Perseverance
- Choose a date (photos may not be available for all dates)
- Browse up to 24 photos per request
- View camera and sol (Mars day) information

### Space Missions Section

- Learn about 8 notable missions
- See active vs completed missions
- Read about achievements and objectives

## 🎨 Features Highlights

- **Animated Starfield**: Three-layer parallax star animation
- **Smooth Transitions**: Fade-in effects and hover animations
- **Image Modal**: Click any image for fullscreen viewing
- **Responsive Navigation**: Sidebar on desktop, horizontal on mobile
- **Loading States**: Visual feedback during API calls
- **Error Handling**: Graceful error messages

## 📱 Browser Compatibility

Works on all modern browsers:

- ✅ Chrome
- ✅ Firefox
- ✅ Safari
- ✅ Edge

## 🔧 Customization

### Change Color Scheme

Edit `css/style.css` and modify these CSS variables in the color sections:

- Primary color: `#64b5f6` (light blue)
- Background: `#0a0e27` (dark blue)
- Accent: `#ffc107` (amber)

### Add More Missions

Edit `js/script.js` and add objects to the `notableMissions` array (around line 220).

## 📝 API Rate Limits

- **DEMO_KEY**: 30 requests per hour, 50 requests per day
- **Personal Key**: 1,000 requests per hour

## 🐛 Troubleshooting

**Images not loading?**

- Check your internet connection
- Verify API key is valid
- Check browser console for errors

**No Mars photos for selected date?**

- Rovers don't take photos every day
- Try different dates or rovers
- Use dates from recent months for best results

**Search returns no results?**

- Try different keywords
- Use general terms like "nebula", "galaxy", "planet"

## 🙏 Credits

- **NASA**: For providing free, amazing APIs
- **Data Sources**: NASA APOD, NASA Image Library, Mars Rover Photos
- **Images**: All images © NASA (public domain)

## 📄 License

This project is open source and available for educational purposes.

All space images and data are courtesy of NASA and are in the public domain.

## 🌍 Contributing

Feel free to fork this project and add your own features:

- Add more NASA APIs (NEO, Earth Observatory, etc.)
- Implement 3D solar system visualization
- Add planet information with hardcoded data
- Integrate additional space APIs

---

**Made with ❤️ for space enthusiasts**

🚀 Happy exploring the cosmos! 🌌
