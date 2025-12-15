# 🌌 Space Explorer - NASA Data Browser

A beautiful web app for exploring space with NASA APIs. View daily astronomy pictures, search space images, track asteroids passing Earth, and learn about space missions.

Built by **Abdulqadir** - Personal project for exploring NASA's public APIs.

---

## ✨ What This App Does

### 1. 📸 Astronomy Picture of the Day (APOD)
- Shows NASA's daily space picture
- Use date picker to view past pictures
- Click images to see fullscreen

### 2. 🔍 Search Space
- Search NASA's image library
- Keywords: galaxy, nebula, mars, jupiter, etc.
- Shows 4 results at a time with "Show More" button
- Cool space facts carousel while browsing

### 3. ☄️ Near Earth Objects (Asteroids)
- **NEW FEATURE!** Replaced Mars Rovers
- Track asteroids passing close to Earth
- Select any date to see asteroids for that day
- Shows for each asteroid:
  - Size (diameter in meters)
  - Speed (km/h)
  - Distance from Earth
  - Potentially hazardous warning (⚠️)
- Sort by: Closest, Biggest, or Fastest
- Shows 6 asteroids initially, click "Show More" for all
- Beautiful animated hero section before search

### 4. 🚀 Space Missions
- Learn about notable missions (Apollo 11, James Webb, etc.)
- Shows status (Active/Completed)
- 6 missions initially, "Show More" to see all

---

## 🎯 Quick Setup

### Option 1: Just Open It
1. Open `index.html` in browser
2. That's it! Uses NASA's DEMO_KEY (limited to 30 requests/hour)

### Option 2: Get Your Own API Key (Recommended)
1. Go to: https://api.nasa.gov/
2. Enter your name & email → Get API key instantly
3. Open `.env` or `vercel.json` and update:
   ```
   NASA_API_KEY=your_key_here
   ```
4. Now you get **1,000 requests/hour** instead of 30!

---

## 📁 File Structure

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

## 🎨 Cool Features

- **Animated starfield background** (3 layers!)
- **Smooth animations** on everything
- **Responsive design** - works on phone, tablet, desktop
- **Sidebar navigation** - expands on desktop, slides on mobile
- **Image modals** - click any image to view fullscreen
- **Loading states** - shows "Loading..." during API calls
- **Error handling** - friendly error messages

---

## 🚀 How To Use Each Section

### APOD
1. Opens showing today's picture automatically
2. Use date picker to see past pictures
3. Click image for fullscreen view

### Search
1. Type keywords (e.g., "galaxy", "mars", "nebula")
2. Click search or press Enter
3. View results in cards
4. Click "Show More" to see more results
5. Click any image to view fullscreen

### Asteroids (NEO)
1. Pick a date (today to 7 days ago)
2. Click "Find Asteroids"
3. See stats summary (total, safe, hazardous, closest)
4. Browse asteroid cards showing size, speed, distance
5. Sort by distance/size/speed
6. Click "Show More" to see all asteroids
7. Click NASA JPL links for more info

### Space Missions
1. Scroll through mission cards
2. See active vs completed status
3. Click "Show More" to see all missions

---

## 🔧 NASA APIs Used

1. **APOD API** - Astronomy Picture of the Day
2. **NASA Image Library** - Search millions of space images
3. **NEO API** - Near Earth Objects (asteroids)

All APIs are free! Get your key at: https://api.nasa.gov/

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

## 💡 Future Ideas (For Me)

- [ ] Add more asteroids data visualization
- [ ] Add planet information pages
- [ ] Show asteroid orbits on a diagram
- [ ] Add more NASA APIs (Earth Observatory, Exoplanets)
- [ ] Save favorite images
- [ ] Share feature for social media

---

## 📱 Browser Support

Works on:
- ✅ Chrome
- ✅ Firefox  
- ✅ Safari
- ✅ Edge

Needs modern browser with ES6+ JavaScript support.

---

## 🙏 Credits

- **NASA** - For amazing free APIs
- **Bootstrap Icons** - For UI icons
- **Google Fonts** - Inter & Space Grotesk fonts
- **Vercel** - For serverless deployment

All space images © NASA (public domain)

---

## 📝 Notes To Self

### Deployment
- Deployed on Vercel
- Push to git → auto-deploys
- API key stored in Vercel env variables

### Code Changes
- **Replaced Mars Rovers with Asteroids** (Dec 2025)
- Mars API wasn't working, NEO API is better
- Added animated hero section for empty state
- Added pagination (Show More) to asteroids

### Styling
- Main colors: Blue (`#64b5f6`), Dark (`#0a0e27`)
- All CSS in one file: `style.css`
- Animations: Starfield, floating, rotating

---

**Made with ❤️ by Abdulqadir**

🚀 Keep exploring the cosmos! 🌌