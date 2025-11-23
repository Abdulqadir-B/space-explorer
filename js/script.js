// ===== NASA API CONFIGURATION =====
// API calls now go through secure serverless functions
// The API key is protected on the server side

// ===== ADVANCED RATE LIMITING SYSTEM =====
class RateLimiter {
  constructor() {
    // Generate browser fingerprint
    this.fingerprint = this.generateFingerprint();
    
    // Per-endpoint rate limits (requests per hour)
    this.limits = {
      apod: { max: 10, interval: 3600000 }, // 10 per hour
      search: { max: 15, interval: 3600000 }, // 15 per hour
      mars: { max: 10, interval: 3600000 }, // 10 per hour
      global: { max: 30, interval: 3600000 }, // 30 total per hour (DEMO_KEY limit)
    };

    // Token bucket for each endpoint
    this.buckets = this.loadBuckets();

    // Track request timestamps for exponential backoff
    this.requestHistory = this.loadRequestHistory();

    // Blocked until timestamp (for temporary blocks)
    this.blockedUntil = parseInt(
      localStorage.getItem("rateLimitBlockedUntil") || "0"
    );
    
    // Cross-check with sessionStorage
    this.validateStorage();
  }

  // Generate browser fingerprint to track users more reliably
  generateFingerprint() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('Browser fingerprint', 2, 2);
    
    const fingerprint = {
      canvas: canvas.toDataURL(),
      screen: `${screen.width}x${screen.height}x${screen.colorDepth}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      platform: navigator.platform,
      userAgent: navigator.userAgent,
      hardwareConcurrency: navigator.hardwareConcurrency || 0,
      deviceMemory: navigator.deviceMemory || 0,
      timestamp: Date.now()
    };
    
    // Create hash from fingerprint
    const hash = btoa(JSON.stringify(fingerprint)).substring(0, 32);
    
    // Store in both localStorage and sessionStorage
    const stored = localStorage.getItem('browserFingerprint');
    if (!stored) {
      localStorage.setItem('browserFingerprint', hash);
      sessionStorage.setItem('browserFingerprint', hash);
    } else if (stored !== hash) {
      // Different fingerprint detected - possible bypass attempt
      this.applyPenalty();
    }
    
    return hash;
  }

  // Validate data across storage mechanisms
  validateStorage() {
    const localData = localStorage.getItem('rateLimitBuckets');
    const sessionData = sessionStorage.getItem('rateLimitBuckets');
    
    if (localData && !sessionData) {
      // Data exists in localStorage but not sessionStorage - sync it
      sessionStorage.setItem('rateLimitBuckets', localData);
    } else if (sessionData && localData !== sessionData) {
      // Mismatch - possible tampering, use the more restrictive values
      const localBuckets = JSON.parse(localData || '{}');
      const sessionBuckets = JSON.parse(sessionData || '{}');
      
      Object.keys(localBuckets).forEach(key => {
        if (sessionBuckets[key]) {
          // Use lower token count (more restrictive)
          localBuckets[key].tokens = Math.min(
            localBuckets[key].tokens || 0,
            sessionBuckets[key].tokens || 0
          );
        }
      });
      
      const synced = JSON.stringify(localBuckets);
      localStorage.setItem('rateLimitBuckets', synced);
      sessionStorage.setItem('rateLimitBuckets', synced);
    }
  }

  // Apply penalty for suspicious behavior
  applyPenalty() {
    // Reduce all token counts by half
    Object.keys(this.buckets).forEach(endpoint => {
      this.buckets[endpoint].tokens = Math.floor(this.buckets[endpoint].tokens / 2);
    });
    
    // Apply 5-minute block
    this.blockedUntil = Date.now() + 300000;
    localStorage.setItem('rateLimitBlockedUntil', this.blockedUntil.toString());
    sessionStorage.setItem('rateLimitBlockedUntil', this.blockedUntil.toString());
    
    this.saveBuckets();
    this.showRateLimitWarning('Suspicious activity detected. Temporary restriction applied.');
  }

  loadBuckets() {
    const saved = localStorage.getItem("rateLimitBuckets");
    if (saved) {
      const buckets = JSON.parse(saved);
      // Reset buckets if needed
      const now = Date.now();
      Object.keys(buckets).forEach((endpoint) => {
        if (
          now - buckets[endpoint].lastRefill >
          this.limits[endpoint].interval
        ) {
          buckets[endpoint] = {
            tokens: this.limits[endpoint].max,
            lastRefill: now,
          };
        }
      });
      return buckets;
    }

    // Initialize buckets
    const buckets = {};
    Object.keys(this.limits).forEach((endpoint) => {
      buckets[endpoint] = {
        tokens: this.limits[endpoint].max,
        lastRefill: Date.now(),
      };
    });
    return buckets;
  }

  loadRequestHistory() {
    const saved = localStorage.getItem("rateLimitHistory");
    return saved ? JSON.parse(saved) : {};
  }

  saveBuckets() {
    const data = JSON.stringify(this.buckets);
    localStorage.setItem("rateLimitBuckets", data);
    sessionStorage.setItem("rateLimitBuckets", data);
  }

  saveRequestHistory() {
    const data = JSON.stringify(this.requestHistory);
    localStorage.setItem("rateLimitHistory", data);
    sessionStorage.setItem("rateLimitHistory", data);
  }

  refillTokens(endpoint) {
    const now = Date.now();
    const bucket = this.buckets[endpoint];
    const limit = this.limits[endpoint];
    const timePassed = now - bucket.lastRefill;

    if (timePassed > limit.interval) {
      bucket.tokens = limit.max;
      bucket.lastRefill = now;
      this.saveBuckets();
    }
  }

  canMakeRequest(endpoint) {
    // Check if temporarily blocked
    const localBlock = parseInt(localStorage.getItem("rateLimitBlockedUntil") || "0");
    const sessionBlock = parseInt(sessionStorage.getItem("rateLimitBlockedUntil") || "0");
    const maxBlock = Math.max(localBlock, sessionBlock);
    
    if (Date.now() < maxBlock) {
      const waitTime = Math.ceil((maxBlock - Date.now()) / 1000);
      return { allowed: false, reason: "blocked", waitTime };
    }

    // Refill tokens if interval has passed
    this.refillTokens(endpoint);
    this.refillTokens("global");

    // Check endpoint-specific limit
    if (this.buckets[endpoint].tokens <= 0) {
      const resetIn = Math.ceil(
        (this.limits[endpoint].interval -
          (Date.now() - this.buckets[endpoint].lastRefill)) /
          60000
      );
      return {
        allowed: false,
        reason: "endpoint_limit",
        endpoint,
        resetIn,
      };
    }

    // Check global limit
    if (this.buckets.global.tokens <= 0) {
      const resetIn = Math.ceil(
        (this.limits.global.interval -
          (Date.now() - this.buckets.global.lastRefill)) /
          60000
      );
      return {
        allowed: false,
        reason: "global_limit",
        resetIn,
      };
    }

    return { allowed: true };
  }

  consumeToken(endpoint) {
    const check = this.canMakeRequest(endpoint);

    if (!check.allowed) {
      this.handleRateLimitExceeded(check);
      return false;
    }

    // Consume tokens
    this.buckets[endpoint].tokens--;
    this.buckets.global.tokens--;

    // Track request
    if (!this.requestHistory[endpoint]) {
      this.requestHistory[endpoint] = [];
    }
    this.requestHistory[endpoint].push(Date.now());

    // Keep only last 50 requests per endpoint
    if (this.requestHistory[endpoint].length > 50) {
      this.requestHistory[endpoint] = this.requestHistory[endpoint].slice(-50);
    }

    // Detect abuse (more than 5 requests in 10 seconds)
    const recentRequests = this.requestHistory[endpoint].filter(
      (timestamp) => Date.now() - timestamp < 10000
    );

    if (recentRequests.length > 5) {
      // Apply temporary block (5 minutes for abuse)
      this.blockedUntil = Date.now() + 300000;
      localStorage.setItem(
        "rateLimitBlockedUntil",
        this.blockedUntil.toString()
      );
      sessionStorage.setItem(
        "rateLimitBlockedUntil",
        this.blockedUntil.toString()
      );
      this.showRateLimitWarning(
        "⚠️ You're making requests too quickly! Blocked for 5 minutes. Please refresh responsibly."
      );
      
      // Disable all buttons temporarily
      this.disableUI(300000);
      return false;
    }

    this.saveBuckets();
    this.saveRequestHistory();
    this.updateDisplay();

    return true;
  }

  handleRateLimitExceeded(info) {
    let message = "";

    if (info.reason === "blocked") {
      message = `Too many requests! Please wait ${info.waitTime} seconds before trying again.`;
    } else if (info.reason === "endpoint_limit") {
      message = `You've reached the limit for ${info.endpoint} requests. Resets in ${info.resetIn} minutes.`;
    } else if (info.reason === "global_limit") {
      message = `You've reached the hourly API limit. Resets in ${info.resetIn} minutes.`;
    }

    this.showRateLimitWarning(message);
  }

  showRateLimitWarning(message) {
    // Remove existing warning if any
    const existing = document.querySelector(".rate-limit-warning");
    if (existing) existing.remove();

    // Create warning banner
    const warning = document.createElement("div");
    warning.className = "rate-limit-warning";
    warning.innerHTML = `
      <div class="rate-limit-warning-content">
        <i class="bi bi-exclamation-triangle"></i>
        <span>${message}</span>
        <button class="close-warning" onclick="this.parentElement.parentElement.remove()">
          <i class="bi bi-x"></i>
        </button>
      </div>
    `;
    document.body.insertBefore(warning, document.body.firstChild);

    // Auto-remove after 10 seconds
    setTimeout(() => warning.remove(), 10000);
  }

  // Disable all interactive elements temporarily
  disableUI(duration) {
    const buttons = document.querySelectorAll('button:not(.close-warning)');
    const inputs = document.querySelectorAll('input, select');
    
    buttons.forEach(btn => {
      btn.disabled = true;
      btn.style.opacity = '0.5';
      btn.style.cursor = 'not-allowed';
    });
    
    inputs.forEach(input => {
      input.disabled = true;
      input.style.opacity = '0.5';
    });
    
    // Re-enable after duration
    setTimeout(() => {
      buttons.forEach(btn => {
        btn.disabled = false;
        btn.style.opacity = '';
        btn.style.cursor = '';
      });
      
      inputs.forEach(input => {
        input.disabled = false;
        input.style.opacity = '';
      });
    }, duration);
  }

  updateDisplay() {
    const counterElement = document.getElementById("api-counter");
    if (!counterElement) return; // Counter removed from UI
    
    const global = this.buckets.global;
    const remaining = Math.max(0, global.tokens);
    const total = this.limits.global.max;

    counterElement.textContent = `${total - remaining}/${total}`;

    // Change color based on remaining calls
    if (remaining <= 5) {
      counterElement.style.color = "#f44336"; // Red
    } else if (remaining <= 10) {
      counterElement.style.color = "#ffc107"; // Yellow
    } else {
      counterElement.style.color = "#4caf50"; // Green
    }

    // Show warning when approaching limit
    if (remaining === 5 && !document.querySelector(".rate-limit-warning")) {
      this.showRateLimitWarning(
        "Warning: Only 5 API calls remaining this hour!"
      );
    }
  }

  getRemainingTokens(endpoint = "global") {
    this.refillTokens(endpoint);
    return this.buckets[endpoint].tokens;
  }

  getStats() {
    const stats = {};
    Object.keys(this.limits).forEach((endpoint) => {
      this.refillTokens(endpoint);
      stats[endpoint] = {
        remaining: this.buckets[endpoint].tokens,
        max: this.limits[endpoint].max,
        resetIn: Math.ceil(
          (this.limits[endpoint].interval -
            (Date.now() - this.buckets[endpoint].lastRefill)) /
            60000
        ),
      };
    });
    return stats;
  }
}

// Initialize rate limiter
const rateLimiter = new RateLimiter();

// Update display on page load
rateLimiter.updateDisplay();

// Helper function for API calls with rate limiting
async function makeRateLimitedRequest(endpoint, fetchFunction) {
  if (!rateLimiter.consumeToken(endpoint)) {
    throw new Error("Rate limit exceeded");
  }
  return await fetchFunction();
}

// ===== DOM ELEMENTS =====
const navLinks = document.querySelectorAll(".nav-link");
const contentSections = document.querySelectorAll(".content-section");
const modal = document.getElementById("image-modal");
const modalImage = document.getElementById("modal-image");
const modalCaption = document.getElementById("modal-caption");
const closeModal = document.querySelector(".close-modal");
const hamburgerToggle = document.getElementById("hamburger-toggle");
const sidebar = document.querySelector(".sidebar");
const sidebarBackdrop = document.getElementById("sidebar-backdrop");

// ===== SIDEBAR TOGGLE =====
function toggleSidebar() {
  sidebar.classList.toggle("expanded");
  sidebarBackdrop.classList.toggle("active");
  hamburgerToggle.classList.toggle("active");

  // Prevent body scroll on mobile when sidebar is open
  if (window.innerWidth <= 768) {
    document.body.style.overflow = sidebar.classList.contains("expanded")
      ? "hidden"
      : "";
  }
}

function closeSidebar() {
  sidebar.classList.remove("expanded");
  sidebarBackdrop.classList.remove("active");
  hamburgerToggle.classList.remove("active");
  document.body.style.overflow = "";
}

hamburgerToggle.addEventListener("click", (e) => {
  e.stopPropagation();
  toggleSidebar();
});

// Close sidebar when clicking backdrop
sidebarBackdrop.addEventListener("click", closeSidebar);

// Close sidebar when clicking outside on mobile
document.addEventListener("click", (e) => {
  if (
    window.innerWidth <= 768 &&
    sidebar.classList.contains("expanded") &&
    !sidebar.contains(e.target) &&
    e.target !== hamburgerToggle &&
    !hamburgerToggle.contains(e.target)
  ) {
    closeSidebar();
  }
});

// ===== NAVIGATION FUNCTIONALITY =====
navLinks.forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const targetSection = link.getAttribute("data-section");

    // Update active nav link
    navLinks.forEach((l) => l.classList.remove("active"));
    link.classList.add("active");

    // Close sidebar on mobile after clicking nav link
    if (window.innerWidth <= 768) {
      closeSidebar();
    }

    // Scroll to the target section
    const section = document.getElementById(targetSection);
    const sectionTop = section.offsetTop;
    window.scrollTo({ top: sectionTop, behavior: "smooth" });
  });
});

// ===== APOD (Astronomy Picture of the Day) =====
const apodContent = document.getElementById("apod-content");
const apodLoading = document.getElementById("apod-loading");

// Set today's date
const today = new Date().toISOString().split("T")[0];

async function fetchAPOD(date = today) {
  apodLoading.classList.remove("hidden");
  apodContent.innerHTML = "";

  try {
    const response = await makeRateLimitedRequest("apod", async () => {
      const data = await window.NASAServerless.fetchAPOD(date);
      return { ok: true, json: async () => data };
    });

    if (!response.ok) {
      throw new Error("Failed to fetch APOD");
    }

    const data = await response.json();
    displayAPOD(data);
  } catch (error) {
    // Error handled gracefully for user
    apodContent.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px; color: #607d8b; height: 100%; width: 100%; text-align: center;">
                <h3 style="margin-bottom: 15px;">Oops! Unable to load today's space picture</h3>
                <p style="margin-bottom: 8px;">We're having trouble connecting to NASA's servers.</p>
                <p>Please try refreshing the page in a moment.</p>
            </div>
        `;
  } finally {
    apodLoading.classList.add("hidden");
  }
}

function displayAPOD(data) {
  const mediaHTML =
    data.media_type === "video"
      ? `<iframe src="${data.url}" width="100%" height="100%" frameborder="0" allowfullscreen style="border-radius: 12px;"></iframe>`
      : `<img src="${data.url}" alt="${data.title}" class="apod-image" onclick="openModal('${data.url}', '${data.title}')">`;

  apodContent.innerHTML = `
        <div class="apod-image-wrapper">
            ${mediaHTML}
        </div>
        <div class="apod-content-wrapper">
            <h3 class="apod-title">${data.title}</h3>
            <p class="apod-date">${data.date}</p>
            <p class="apod-description">${data.explanation}</p>
            ${
              data.copyright
                ? `<p class="apod-copyright">© ${data.copyright}</p>`
                : ""
            }
        </div>
    `;
}

// Load today's APOD on page load
fetchAPOD();

// ===== SCROLL SPY FOR SIDEBAR =====
window.addEventListener("scroll", () => {
  let current = "";
  contentSections.forEach((section) => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.clientHeight;
    if (window.scrollY >= sectionTop - 100) {
      current = section.getAttribute("id");
    }
  });

  navLinks.forEach((link) => {
    link.classList.remove("active");
    if (link.getAttribute("data-section") === current) {
      link.classList.add("active");
    }
  });
});

// ===== SEARCH CELESTIAL OBJECTS =====
const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");
const searchResults = document.getElementById("search-results");
const searchLoading = document.getElementById("search-loading");

let allSearchResults = [];
let displayedResultsCount = 0;
const RESULTS_PER_PAGE = 4;

// ===== POPULAR SEARCH SUGGESTIONS =====
document.querySelectorAll(".suggestion-tag").forEach((tag) => {
  tag.addEventListener("click", () => {
    const searchTerm = tag.dataset.search;
    searchInput.value = searchTerm;
    searchNASA(searchTerm);

    // Scroll to results
    setTimeout(() => {
      searchResults.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 300);
  });
});

async function searchNASA(query) {
  if (!query.trim()) {
    searchResults.innerHTML =
      '<p style="text-align: center; color: #90a4ae;">Please enter a search term</p>';
    return;
  }

  searchLoading.classList.remove("hidden");
  searchResults.innerHTML = "";

  // Hide popular suggestions when showing results
  const suggestionsSection = document.getElementById("popular-suggestions");

  try {
    const response = await makeRateLimitedRequest("search", async () => {
      const data = await window.NASAServerless.searchNASAImages(query);
      return { ok: true, json: async () => data };
    });

    if (!response.ok) {
      throw new Error("Search failed");
    }

    const data = await response.json();

    if (data.collection.items.length === 0) {
      searchResults.innerHTML =
        '<p style="text-align: center; color: #90a4ae;">No results found. Try different keywords.</p>';
      suggestionsSection.style.display = "block";
      return;
    }

    // Hide suggestions when showing results
    suggestionsSection.style.display = "none";

    allSearchResults = data.collection.items;
    displayedResultsCount = 0;
    displaySearchResults();
  } catch (error) {
    // Error handled gracefully for user
    searchResults.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px; color: #607d8b; min-height: 300px; text-align: center; grid-column: 1 / -1; width: 100%;">
                <h3>Oops! Something went wrong</h3>
                <p>We're having trouble searching NASA's image library. Please try again in a moment.</p>
            </div>
        `;
    suggestionsSection.style.display = "block";
  } finally {
    searchLoading.classList.add("hidden");
  }
}

function displaySearchResults() {
  const startIndex = displayedResultsCount;
  const endIndex = startIndex + RESULTS_PER_PAGE;
  const itemsToShow = allSearchResults.slice(startIndex, endIndex);

  const resultsHTML = itemsToShow
    .map((item) => {
      const data = item.data[0];
      const imageUrl = item.links ? item.links[0].href : "";
      const description = data.description || "No description available";
      const truncatedDesc =
        description.length > 150
          ? description.substring(0, 150) + "..."
          : description;

      return `
            <div class="search-card" onclick="openModal('${imageUrl}', '${escapeHtml(
        data.title
      )}', '${escapeHtml(description)}')">
                <img src="${imageUrl}" alt="${escapeHtml(
        data.title
      )}" loading="lazy">
                <div class="search-card-content">
                    <h3 class="search-card-title">${escapeHtml(data.title)}</h3>
                    <p class="search-card-date">${
                      data.date_created
                        ? new Date(data.date_created).toLocaleDateString()
                        : ""
                    }</p>
                    <p class="search-card-description">${escapeHtml(
                      truncatedDesc
                    )}</p>
                </div>
            </div>
        `;
    })
    .join("");

  if (displayedResultsCount === 0) {
    searchResults.innerHTML = resultsHTML;
  } else {
    const showMoreBtn = document.getElementById("show-more-btn");
    if (showMoreBtn) {
      showMoreBtn.remove();
    }
    searchResults.insertAdjacentHTML("beforeend", resultsHTML);
  }

  displayedResultsCount += itemsToShow.length;

  if (displayedResultsCount < allSearchResults.length) {
    const showMoreButton = `
      <button id="show-more-btn" class="btn btn-outline-primary" style="grid-column: 1 / -1; margin: 20px auto; padding: 12px 32px;">
        Show More (${allSearchResults.length - displayedResultsCount} remaining)
      </button>
    `;
    searchResults.insertAdjacentHTML("beforeend", showMoreButton);

    document
      .getElementById("show-more-btn")
      .addEventListener("click", displaySearchResults);
  }
}

searchBtn.addEventListener("click", () => {
  searchNASA(searchInput.value);
});

searchInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    searchNASA(searchInput.value);
  }
});

// ===== MARS ROVER PHOTOS =====
const roverSelect = document.getElementById("rover-select");
const marsBtn = document.getElementById("mars-btn");
const marsResults = document.getElementById("mars-results");
const marsLoading = document.getElementById("mars-loading");

// Dates with confirmed photos for each rover
const roverDates = {
  curiosity: [
    "2023-06-15",
    "2022-08-05",
    "2021-07-01",
    "2020-05-30",
    "2019-03-15",
  ],
  perseverance: ["2023-03-10", "2022-04-20", "2021-09-01", "2021-05-15"],
  opportunity: ["2018-06-01", "2017-03-16", "2016-01-10", "2015-05-12"],
  spirit: ["2010-03-21", "2009-05-01", "2008-07-15", "2007-02-10"],
};

// Auto-fetch single image when rover is selected
roverSelect.addEventListener("change", () => {
  const rover = roverSelect.value;
  if (!rover) {
    marsResults.innerHTML = "";
  }
});

async function fetchMarsPhotos() {
  const rover = roverSelect.value;

  if (!rover) {
    alert("Please select a rover first!");
    return;
  }

  marsLoading.classList.remove("hidden");
  marsResults.innerHTML = "";

  try {
    const dates = roverDates[rover];
    const randomDate = dates[Math.floor(Math.random() * dates.length)];

    const response = await makeRateLimitedRequest("mars", async () => {
      const data = await window.NASAServerless.fetchMarsPhotos(rover, null, randomDate);
      return { ok: true, json: async () => data };
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch Mars photos (${response.status})`);
    }

    const data = await response.json();

    if (data.photos.length === 0) {
      marsResults.innerHTML = `
        <p style="text-align: center; color: #90a4ae; grid-column: 1 / -1;">
          No photos found. Try again!
        </p>
      `;
      return;
    }

    // Display single random photo
    const photo = data.photos[0];
    marsResults.innerHTML = `
      <div class="mars-single-photo">
        <img src="${
          photo.img_src
        }" alt="${rover} rover photo" onclick="openModal('${
      photo.img_src
    }', 'Mars - ${photo.camera.full_name}', 'Rover: ${
      photo.rover.name
    } | Sol: ${photo.sol} | Earth Date: ${photo.earth_date}')">
        <div class="mars-photo-details">
          <h3>${rover.charAt(0).toUpperCase() + rover.slice(1)} Rover</h3>
          <p><strong>Camera:</strong> ${photo.camera.full_name}</p>
          <p><strong>Date:</strong> ${photo.earth_date} (Sol ${photo.sol})</p>
        </div>
      </div>
    `;
  } catch (error) {
    // Error handled gracefully for user
    marsResults.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px; color: #607d8b; grid-column: 1 / -1; min-height: 300px;">
        <h3>Couldn't retrieve Mars photos</h3>
        <p>There was a problem loading images from this rover.</p>
        <p>Please try again in a moment.</p>
      </div>
    `;
  } finally {
    marsLoading.classList.add("hidden");
  }
}

function displayMarsPhotos(photos) {
  marsResults.innerHTML = photos
    .slice(0, 24)
    .map(
      (photo) => `
        <div class="mars-photo" onclick="openModal('${photo.img_src}', 'Mars - ${photo.camera.full_name}', 'Rover: ${photo.rover.name} | Sol: ${photo.sol} | Earth Date: ${photo.earth_date}')">
            <img src="${photo.img_src}" alt="${photo.camera.full_name}" loading="lazy">
            <div class="mars-photo-info">
                <p class="mars-photo-camera">${photo.camera.full_name}</p>
                <p class="mars-photo-date">Sol ${photo.sol} | ${photo.earth_date}</p>
            </div>
        </div>
    `
    )
    .join("");
}

marsBtn.addEventListener("click", fetchMarsPhotos);

// ===== SPACE MISSIONS =====
const missionsContent = document.getElementById("missions-content");

const notableMissions = [
  {
    name: "James Webb Space Telescope",
    status: "active",
    description:
      "The most powerful space telescope ever built, observing the universe in infrared light to see the first galaxies formed after the Big Bang.",
    launch: "December 25, 2021",
    agency: "NASA, ESA, CSA",
  },
  {
    name: "Perseverance Mars Rover",
    status: "active",
    description:
      "Searching for signs of ancient microbial life and collecting rock samples for future return to Earth. Includes Ingenuity helicopter.",
    launch: "July 30, 2020",
    agency: "NASA",
  },
  {
    name: "Artemis Program",
    status: "active",
    description:
      "NASA's mission to return humans to the Moon by 2025 and establish sustainable lunar exploration as a stepping stone to Mars.",
    launch: "Ongoing",
    agency: "NASA",
  },
  {
    name: "Hubble Space Telescope",
    status: "active",
    description:
      "Operating for over 30 years, Hubble has revolutionized astronomy with stunning images and groundbreaking discoveries about our universe.",
    launch: "April 24, 1990",
    agency: "NASA, ESA",
  },
  {
    name: "International Space Station",
    status: "active",
    description:
      "A habitable artificial satellite in low Earth orbit serving as a microgravity laboratory for scientific research.",
    launch: "November 20, 1998",
    agency: "NASA, Roscosmos, ESA, JAXA, CSA",
  },
  {
    name: "Voyager 1 & 2",
    status: "active",
    description:
      "The farthest human-made objects from Earth, now exploring interstellar space after visiting Jupiter, Saturn, Uranus, and Neptune.",
    launch: "1977",
    agency: "NASA",
  },
  {
    name: "Apollo 11",
    status: "completed",
    description:
      "The first crewed mission to land on the Moon. Neil Armstrong and Buzz Aldrin became the first humans to walk on the lunar surface.",
    launch: "July 16, 1969",
    agency: "NASA",
  },
  {
    name: "Cassini-Huygens",
    status: "completed",
    description:
      "Explored Saturn and its moons for 13 years, discovering liquid methane seas on Titan and geysers on Enceladus.",
    launch: "October 15, 1997",
    agency: "NASA, ESA, ASI",
  },
];

function displayMissions() {
  missionsContent.innerHTML = notableMissions
    .slice(0, 6)
    .map(
      (mission) => `
        <div class="mission-card">
            <h3 class="mission-title">${mission.name}</h3>
            <span class="mission-status ${
              mission.status
            }">${mission.status.toUpperCase()}</span>
            <p class="mission-description">${mission.description}</p>
            <div class="mission-details">
                <p><strong>Launch:</strong> ${mission.launch}</p>
                <p><strong>Agency:</strong> ${mission.agency}</p>
            </div>
        </div>
    `
    )
    .join("");
}

displayMissions();

// ===== MODAL FUNCTIONALITY =====
function openModal(imageSrc, title, description = "") {
  modal.classList.remove("hidden");
  modalImage.src = imageSrc;
  modalCaption.innerHTML = `
        <h3 style="color: #64b5f6; margin-bottom: 10px;">${title}</h3>
        ${description ? `<p>${description}</p>` : ""}
    `;
  document.body.style.overflow = "hidden";
}

function closeImageModal() {
  modal.classList.add("hidden");
  document.body.style.overflow = "auto";
}

closeModal.addEventListener("click", closeImageModal);

modal.addEventListener("click", (e) => {
  if (e.target === modal) {
    closeImageModal();
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !modal.classList.contains("hidden")) {
    closeImageModal();
  }
});

// ===== UTILITY FUNCTIONS =====
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// ===== CONSOLE WELCOME MESSAGE =====
