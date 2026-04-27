/* ===== LOVE GALORE — CORE APP LOGIC ===== */

// ─── LocalStorage Helpers ────────────────────────────────────────────────────
const store = {
  get: (k) => { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
  set: (k, v) => localStorage.setItem(k, JSON.stringify(v)),
  del: (k) => localStorage.removeItem(k),
};

// ─── Auth ─────────────────────────────────────────────────────────────────────
function getUser() { return store.get('lg_user'); }

function requireAuth() {
  if (!getUser()) { window.location.href = 'login.html'; return false; }
  return true;
}

function logout() {
  store.del('lg_user');
  document.body.classList.add('exit');
  setTimeout(() => window.location.href = 'index.html', 400);
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function toast(msg, type = 'info', duration = 3200) {
  const icons = { success: '✓', error: '✕', info: '♥' };
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<span>${icons[type]}</span> ${msg}`;
  container.appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; el.style.transform = 'translateX(40px)'; el.style.transition = '0.3s'; setTimeout(() => el.remove(), 300); }, duration);
}

// ─── Page Transition ──────────────────────────────────────────────────────────
function navigate(href) {
  document.body.classList.add('exit');
  setTimeout(() => window.location.href = href, 420);
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
function renderSidebar(activePage) {
  const user = getUser();
  if (!user) return;

  const navItems = [
    { id: 'dashboard',  icon: 'fa-home',            label: 'Dashboard',      href: 'dashboard.html' },
    {
      id: 'capsules', icon: 'fa-box-open', label: 'Time Capsules',
      children: [
        { label: 'My Capsules',    href: 'time-capsules.html',        id: 'my-capsules'    },
        { label: 'Create New',     href: 'time-capsules.html#create', id: 'create-capsule' },
        { label: 'Public Capsules',href: 'time-capsules.html#public', id: 'public-capsules'},
      ]
    },
    {
      id: 'letters', icon: 'fa-envelope', label: 'Love Letters',
      children: [
        { label: 'Inbox',         href: 'love-letters.html',        id: 'letters-inbox' },
        { label: 'Write a Letter',href: 'love-letters.html#write',   id: 'letters-write' },
        { label: 'Sent',          href: 'love-letters.html#sent',    id: 'letters-sent'  },
      ]
    },
    {
      id: 'story', icon: 'fa-book-open', label: 'Our Story',
      children: [
        { label: 'How We Met',  href: 'our-story.html',           id: 'how-met'   },
        { label: 'About Us',    href: 'our-story.html#about',     id: 'about-us'  },
        { label: 'Our Timeline',href: 'our-story.html#timeline',  id: 'timeline'  },
      ]
    },
    { id: 'gallery',  icon: 'fa-camera-retro', label: 'Our Gallery',   href: 'gallery.html'     },
    { id: 'bucket',   icon: 'fa-check-circle', label: 'Bucket List',   href: 'bucket-list.html' },
    { id: 'calendar', icon: 'fa-calendar-alt', label: 'Love Calendar', href: 'calendar.html'    },
    {
      id: 'dates', icon: 'fa-heart', label: 'Date Ideas',
      children: [
        { label: 'Generator',    href: 'date-ideas.html',        id: 'ai-generator' },
        { label: 'Saved Ideas',  href: 'date-ideas.html#saved',  id: 'saved-ideas'  },
      ]
    },
    { id: 'search',   icon: 'fa-search',       label: 'Search',        href: 'search.html'      },
    { id: 'settings', icon: 'fa-cog',           label: 'Settings',      href: 'settings.html'    },
  ];

  const settings = getSettings();
  const couplePhoto = settings.couplePhoto || '';
  const days = getDaysTogether();

  const sidebarHTML = `
    <aside class="sidebar" id="sidebar">
      <div class="sidebar-header">
        ${couplePhoto
          ? `<div class="sidebar-couple-photo"><img src="${couplePhoto}" alt="us"></div>`
          : `<div class="logo-icon"><i class="fas fa-heart"></i></div>`}
        <h2>Love Galore</h2>
        ${days !== null ? `<div class="sidebar-days">${days} days together ♥</div>` : ''}
      </div>
      <div class="sidebar-user">
        <div class="user-names">${user.name} &amp; ${user.spouseName}</div>
        <div class="user-email">${user.email}</div>
      </div>
      <nav class="sidebar-nav">
        <ul>
          ${navItems.map(item => {
            const isActive = activePage === item.id;
            const hasChildren = item.children && item.children.length > 0;
            const isOpen = isActive && hasChildren;
            if (!hasChildren) {
              return `<li class="nav-item ${isActive ? 'active' : ''}">
                <a class="nav-link" href="${item.href}">
                  <i class="fas ${item.icon}"></i> ${item.label}
                </a>
              </li>`;
            }
            return `<li class="nav-item has-dropdown ${isOpen ? 'open' : ''}" id="nav-${item.id}">
              <div class="nav-link" onclick="toggleNav('nav-${item.id}')">
                <i class="fas ${item.icon}"></i> ${item.label}
                <i class="fas fa-chevron-right chevron"></i>
              </div>
              <ul class="nav-submenu">
                ${item.children.map(child => `
                  <li><a class="nav-sublink ${activePage === child.id ? 'active' : ''}" href="${child.href}">${child.label}</a></li>
                `).join('')}
              </ul>
            </li>`;
          }).join('')}
        </ul>
      </nav>
      <div class="sidebar-footer">
        <a class="nav-link" href="#" onclick="logout()" style="border-left:none">
          <i class="fas fa-sign-out-alt"></i> Sign Out
        </a>
      </div>
    </aside>
    <button class="sidebar-toggle" id="sidebarToggle" onclick="toggleSidebar()">
      <i class="fas fa-bars"></i>
    </button>
  `;

  const container = document.getElementById('sidebarContainer');
  if (container) container.innerHTML = sidebarHTML;

  // Close sidebar when clicking outside on mobile
  document.addEventListener('click', (e) => {
    const sb = document.getElementById('sidebar');
    const toggle = document.getElementById('sidebarToggle');
    if (window.innerWidth <= 768 && sb && sb.classList.contains('open')) {
      if (!sb.contains(e.target) && e.target !== toggle) sb.classList.remove('open');
    }
  });
}

function toggleNav(id) {
  const item = document.getElementById(id);
  if (!item) return;
  item.classList.toggle('open');
}

function toggleSidebar() {
  const sb = document.getElementById('sidebar');
  if (sb) sb.classList.toggle('open');
}

// ─── Time Capsules ────────────────────────────────────────────────────────────
function getCapsules() { return store.get('lg_capsules') || []; }
function saveCapsules(c) { store.set('lg_capsules', c); }

function createCapsule(data) {
  const capsules = getCapsules();
  const user = getUser();
  const capsule = {
    id: Date.now().toString(),
    ...data,
    createdAt: new Date().toISOString(),
    createdBy: user ? user.name : 'Unknown',
  };
  capsules.unshift(capsule);
  saveCapsules(capsules);
  return capsule;
}

function deleteCapsule(id) {
  const capsules = getCapsules().filter(c => c.id !== id);
  saveCapsules(capsules);
}

function isUnlocked(capsule) {
  return new Date(capsule.unlockDate) <= new Date();
}

function formatUnlockDate(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = d - now;
  if (diff <= 0) return 'Unlocked!';
  const days = Math.floor(diff / 86400000);
  if (days < 1) return 'Unlocks today';
  if (days === 1) return 'Unlocks tomorrow';
  if (days < 30) return `Unlocks in ${days} days`;
  const months = Math.floor(days / 30);
  return `Unlocks in ${months} month${months > 1 ? 's' : ''}`;
}

// ─── Our Story ────────────────────────────────────────────────────────────────
function getStory() {
  return store.get('lg_story') || {
    howWeMet: '',
    aboutPartner1: '',
    aboutPartner2: '',
    timeline: [],
  };
}
function saveStory(s) { store.set('lg_story', s); }

// ─── Saved Date Ideas ─────────────────────────────────────────────────────────
function getSavedIdeas() { return store.get('lg_saved_ideas') || []; }
function saveIdea(idea) {
  const ideas = getSavedIdeas();
  if (ideas.find(i => i.title === idea.title)) { toast('Already saved!', 'info'); return; }
  ideas.unshift({ ...idea, savedAt: new Date().toISOString() });
  store.set('lg_saved_ideas', ideas);
  toast('Date idea saved! ♥', 'success');
}
function removeSavedIdea(title) {
  store.set('lg_saved_ideas', getSavedIdeas().filter(i => i.title !== title));
}

// ─── AI Date Ideas Generator ──────────────────────────────────────────────────
const dateTemplates = {
  dining: [
    {
      emoji: '🍷',
      title: 'Rooftop Candlelit Dinner',
      description: 'Find {city}\'s most elevated restaurant and book a table overlooking the skyline. Let the twinkling city lights below create the perfect romantic atmosphere as you savour a gourmet meal together.',
      source: 'TripAdvisor · Yelp',
      cost: '$$$$',
      duration: '2–3 hours',
      bestTime: 'Sunset / Evening',
      vibe: 'Elegant & Dreamy',
      tips: ['Reserve 2 weeks in advance and request a window seat', 'Dress up — it makes the evening feel extra special', 'Order a dessert to share', 'Bring a handwritten note for the table'],
    },
    {
      emoji: '🕯️',
      title: 'Private Chef Experience',
      description: 'Book a private in-home chef in {city} through a dining platform. Have a professional cook a personalised 3-course meal in your kitchen while you two relax with wine.',
      source: 'EatWith · TripAdvisor Experiences',
      cost: '$$$',
      duration: '3–4 hours',
      bestTime: 'Evening',
      vibe: 'Intimate & Luxurious',
      tips: ['Share any dietary preferences in advance', 'Dim the lights and add candles', 'Pair with a local {city} wine', 'Ask the chef to teach you a dish'],
    },
    {
      emoji: '🍣',
      title: 'Omakase Date Night',
      description: 'Book seats at an omakase sushi bar in {city} and surrender to the chef\'s creativity. The surprise element makes this a deeply memorable shared experience.',
      source: 'TripAdvisor · OpenTable',
      cost: '$$$$',
      duration: '1.5–2 hours',
      bestTime: 'Evening',
      vibe: 'Sophisticated & Adventurous',
      tips: ['Arrive on time — courses start together', 'Avoid heavy perfume out of respect for the cuisine', 'Ask the chef about each piece', 'Take a photo of the final course'],
    },
    {
      emoji: '🧺',
      title: 'Gourmet Picnic in the Park',
      description: 'Pack a basket with artisan cheeses, fresh fruit, charcuterie, and a bottle of wine. Find {city}\'s most scenic park or garden and spend an afternoon outdoors together.',
      source: 'Google Maps · TripAdvisor',
      cost: '$$',
      duration: '2–4 hours',
      bestTime: 'Afternoon',
      vibe: 'Playful & Relaxed',
      tips: ['Bring a cozy blanket', 'Pack a small speaker for soft music', 'Arrive early to claim the best spot', 'Bring a handmade dessert'],
    },
  ],
  outdoor: [
    {
      emoji: '🌅',
      title: 'Sunrise Hike & Breakfast',
      description: 'Rise early and hike to a scenic viewpoint near {city}. Watch the sunrise together, then enjoy breakfast with an unforgettable view — few moments feel more romantic.',
      source: 'AllTrails · TripAdvisor',
      cost: '$',
      duration: '3–5 hours',
      bestTime: 'Early Morning',
      vibe: 'Adventurous & Intimate',
      tips: ['Check the sunrise time the night before', 'Pack warm layers', 'Bring a thermos of coffee or cocoa', 'Capture the moment but put the phones away too'],
    },
    {
      emoji: '🚣',
      title: 'Rowboat on the Lake',
      description: 'Rent a rowboat at a lake or river near {city} and spend an hour gliding across the water. Slow, peaceful, and wonderfully old-fashioned — exactly what romance is made of.',
      source: 'TripAdvisor · GetYourGuide',
      cost: '$',
      duration: '1–2 hours',
      bestTime: 'Golden Hour',
      vibe: 'Nostalgic & Sweet',
      tips: ['Bring flowers to surprise your partner', 'Pack snacks and sparkling water', 'Row to a quiet corner and talk', 'Go at golden hour for magical light'],
    },
    {
      emoji: '⭐',
      title: 'Stargazing Night',
      description: 'Drive to a dark-sky spot outside {city}, lay out blankets, and spend an evening identifying constellations together. Quiet, wonder-filled, and beautifully intimate.',
      source: 'DarkSkyFinder · TimeAndDate',
      cost: '$',
      duration: '2–3 hours',
      bestTime: 'Night (New Moon preferred)',
      vibe: 'Magical & Contemplative',
      tips: ['Download a stargazing app', 'Bring warm blankets and hot drinks', 'Let your eyes adjust for 20 mins', 'Pick a meaningful constellation to name as yours'],
    },
    {
      emoji: '🌸',
      title: 'Botanical Garden Stroll',
      description: 'Spend a slow afternoon walking through {city}\'s botanical gardens. The colours, scents, and beauty make for effortlessly romantic conversation.',
      source: 'TripAdvisor · Google Maps',
      cost: '$',
      duration: '1.5–2.5 hours',
      bestTime: 'Morning / Afternoon',
      vibe: 'Peaceful & Beautiful',
      tips: ['Pick a season with blooms', 'Bring a camera', 'Get a map and explore hidden sections', 'End with tea or coffee nearby'],
    },
  ],
  arts: [
    {
      emoji: '🎭',
      title: 'Live Theatre Night',
      description: 'Book tickets to a live theatre performance, musical, or opera in {city}. Dress up, arrive early for a pre-show cocktail, and let the performance move you together.',
      source: 'TripAdvisor · StubHub',
      cost: '$$$',
      duration: '3–4 hours',
      bestTime: 'Evening',
      vibe: 'Cultured & Memorable',
      tips: ['Research the show beforehand', 'Arrive early for cocktails', 'Discuss the show over dinner after', 'Keep the ticket stubs as mementos'],
    },
    {
      emoji: '🎨',
      title: 'Couples Painting Class',
      description: 'Enrol in a paint-and-sip class in {city}. You\'ll leave with two canvases, a little wine in your system, and a story you\'ll tell for years.',
      source: 'Airbnb Experiences · TripAdvisor',
      cost: '$$',
      duration: '2–3 hours',
      bestTime: 'Evening / Weekend',
      vibe: 'Creative & Fun',
      tips: ['No artistic skill needed', 'Paint portraits of each other', 'Keep both paintings as decor', 'Laugh — it\'s supposed to be imperfect'],
    },
    {
      emoji: '🏛️',
      title: 'Museum After Dark',
      description: 'Visit a museum in {city} during an evening event or late opening. The ambience shifts completely after dark — quieter, moodier, and far more intimate.',
      source: 'TripAdvisor · Museum websites',
      cost: '$$',
      duration: '2–3 hours',
      bestTime: 'Evening',
      vibe: 'Intellectual & Romantic',
      tips: ['Check for evening events or member nights', 'Slow down and discuss what you see', 'Pick one exhibit to focus on deeply', 'End with wine at the museum café'],
    },
    {
      emoji: '🎵',
      title: 'Jazz Club Night',
      description: 'Find a live jazz venue in {city} with intimate table seating. Order cocktails, let the music wash over you, and rediscover the lost art of simply being together.',
      source: 'TripAdvisor · Bandsintown',
      cost: '$$$',
      duration: '2–3 hours',
      bestTime: 'Evening',
      vibe: 'Soulful & Timeless',
      tips: ['Book ahead — small jazz clubs fill fast', 'Order the specialty cocktail', 'Request a song if the venue allows it', 'Dance if the floor opens up'],
    },
  ],
  adventure: [
    {
      emoji: '🏄',
      title: 'Surf or Paddleboard Lesson',
      description: 'Book a beginner surf or paddleboard lesson near {city}. The shared challenge, laughing at wipeouts, and cheering each other on creates a powerful couple bond.',
      source: 'GetYourGuide · TripAdvisor',
      cost: '$$',
      duration: '2–3 hours',
      bestTime: 'Morning',
      vibe: 'Energetic & Bonding',
      tips: ['Wear sunscreen', 'Don\'t be competitive — be encouraging', 'Celebrate every small win', 'Follow up with seafood lunch'],
    },
    {
      emoji: '🧗',
      title: 'Indoor Rock Climbing',
      description: 'Head to an indoor climbing gym in {city}. Belaying each other builds trust and communication — then reward yourselves with a great meal.',
      source: 'Google Maps · TripAdvisor',
      cost: '$$',
      duration: '2–3 hours',
      bestTime: 'Afternoon',
      vibe: 'Trust-Building & Fun',
      tips: ['Book a beginners\' session if it\'s new', 'Cheer loudly for each other', 'Pick a challenge route to attempt together', 'Trust your partner completely'],
    },
    {
      emoji: '🚴',
      title: 'Cycling Discovery Tour',
      description: 'Rent bikes and explore {city} or its outskirts together. Stop at coffee shops, viewpoints, and any place that looks interesting — no agenda required.',
      source: 'TripAdvisor · Airbnb Experiences',
      cost: '$$',
      duration: '3–5 hours',
      bestTime: 'Morning / Afternoon',
      vibe: 'Free & Spontaneous',
      tips: ['Download an offline map', 'Pack water and snacks', 'Stop often — the journey is the point', 'Take a photo at every interesting stop'],
    },
  ],
  cozy: [
    {
      emoji: '🍿',
      title: 'Film Marathon Night',
      description: 'Build a fort with blankets and pillows, pick a film series you both love, and spend the whole evening in your cozy sanctuary. Order your favourite takeout from {city}.',
      source: 'Netflix · Local Delivery',
      cost: '$',
      duration: '4–6 hours',
      bestTime: 'Evening',
      vibe: 'Warm & Nostalgic',
      tips: ['Take turns picking films', 'No phones during the movie', 'Make popcorn from scratch', 'Fall asleep together if you do'],
    },
    {
      emoji: '📚',
      title: 'Bookshop Date',
      description: 'Spend an afternoon in an independent bookshop in {city}. Each choose a book you think the other will love, then swap. Head to a café and read together.',
      source: 'TripAdvisor · Google Maps',
      cost: '$',
      duration: '2–3 hours',
      bestTime: 'Weekend Afternoon',
      vibe: 'Quiet & Thoughtful',
      tips: ['Give each other 20 minutes to shop independently', 'Write a little note in the book you chose', 'Pick a reading café with good coffee', 'Start the book on the way home'],
    },
    {
      emoji: '🧁',
      title: 'Baking Together',
      description: 'Pick an ambitious recipe and cook or bake it together at home. The process — the mess, the laughter, the collaboration — is as good as the result.',
      source: 'Food Network · BBC Good Food',
      cost: '$',
      duration: '2–3 hours',
      bestTime: 'Weekend',
      vibe: 'Playful & Domestic',
      tips: ['Pick something challenging but achievable', 'Share tasks equally', 'Put on a playlist you both love', 'Eat the results with candles lit'],
    },
  ],
  unique: [
    {
      emoji: '🎈',
      title: 'Hot Air Balloon at Sunrise',
      description: 'Book a sunrise hot air balloon flight near {city}. Floating above the world at dawn, with the person you love, is a once-in-a-lifetime feeling.',
      source: 'TripAdvisor · GetYourGuide',
      cost: '$$$$',
      duration: '3–4 hours (inc. travel)',
      bestTime: 'Dawn',
      vibe: 'Once-in-a-Lifetime',
      tips: ['Book months ahead', 'Dress in warm layers', 'Bring a camera but be present too', 'Celebrate with champagne after — it\'s tradition'],
    },
    {
      emoji: '🌊',
      title: 'Sunset Sailing',
      description: 'Charter a small sailboat or join a sunset cruise from {city}\'s waterfront. Watch the sun melt into the water together with wine in hand.',
      source: 'GetYourGuide · TripAdvisor',
      cost: '$$$',
      duration: '2–3 hours',
      bestTime: 'Sunset',
      vibe: 'Breathtaking & Romantic',
      tips: ['Take seasickness tablets if needed', 'Bring a light jacket', 'Arrive at the dock early', 'Propose if you\'ve been waiting for the right moment 💍'],
    },
    {
      emoji: '🌿',
      title: 'Couples Spa Day',
      description: 'Book a couples spa treatment in {city} — think side-by-side massages, thermal pools, and a full day of relaxed togetherness. Pure luxury and connection.',
      source: 'TripAdvisor · Spa Finder',
      cost: '$$$$',
      duration: '4–6 hours',
      bestTime: 'Weekend',
      vibe: 'Restorative & Indulgent',
      tips: ['Arrive 30 mins early to use facilities', 'Unplug completely', 'Book a joint treatment', 'Extend with a light dinner after'],
    },
    {
      emoji: '🎲',
      title: 'Escape Room Challenge',
      description: 'Book an immersive escape room experience in {city}. Nothing reveals couple dynamics — and deepens trust — quite like solving puzzles under pressure together.',
      source: 'TripAdvisor · Escape Room sites',
      cost: '$$',
      duration: '1.5–2 hours',
      bestTime: 'Evening / Weekend',
      vibe: 'Thrilling & Collaborative',
      tips: ['Pick a horror-free theme if either dislikes scares', 'Communicate constantly — it\'s the key', 'Celebrate with drinks after win or lose', 'Try to beat the average time'],
    },
  ],
};

function generateDateIdeas(city, selectedFilters) {
  const results = [];
  const filters = selectedFilters.length > 0
    ? selectedFilters
    : Object.keys(dateTemplates);

  filters.forEach(filter => {
    const pool = dateTemplates[filter];
    if (!pool) return;
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const picks = shuffled.slice(0, 2);
    picks.forEach(idea => {
      results.push({
        ...idea,
        description: idea.description.replace(/\{city\}/g, city || 'your city'),
        tips: idea.tips.map(t => t.replace(/\{city\}/g, city || 'your city')),
        category: filter,
      });
    });
  });

  return results.sort(() => Math.random() - 0.5);
}

function renderIdeaCard(idea, index) {
  const delay = index * 0.1;
  return `
    <div class="date-idea-card" style="animation-delay:${delay}s">
      <div class="idea-header">
        <span class="idea-emoji">${idea.emoji}</span>
        <div>
          <div class="idea-title">${idea.title}</div>
          <div class="idea-source"><i class="fas fa-search" style="font-size:0.7rem"></i> ${idea.source}</div>
        </div>
      </div>
      <p class="idea-desc">${idea.description}</p>
      <div class="idea-meta">
        <span class="meta-tag"><i class="fas fa-tag"></i> ${capitalise(idea.category)}</span>
        <span class="meta-tag"><i class="fas fa-clock"></i> ${idea.duration}</span>
        <span class="meta-tag"><i class="fas fa-dollar-sign"></i> ${idea.cost}</span>
        <span class="meta-tag"><i class="fas fa-sun"></i> ${idea.bestTime}</span>
        <span class="meta-tag"><i class="fas fa-heart"></i> ${idea.vibe}</span>
      </div>
      <div class="idea-tips">
        <h5><i class="fas fa-lightbulb"></i> Romantic Tips</h5>
        <ul>${idea.tips.map(t => `<li>${t}</li>`).join('')}</ul>
      </div>
      <div class="card-footer" style="margin-top:1rem">
        <button class="btn-sm gold" onclick='saveIdea(${JSON.stringify(idea).replace(/'/g,"&#39;")})'>
          <i class="fas fa-bookmark"></i> Save Idea
        </button>
      </div>
    </div>
  `;
}

function capitalise(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : ''; }

// ─── Helpers ──────────────────────────────────────────────────────────────────
function timeAgo(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

// ─── Gallery ──────────────────────────────────────────────────────────────────
function getGallery() { return store.get('lg_gallery') || []; }
function saveGallery(g) { store.set('lg_gallery', g); }

function addPhoto(src, caption) {
  const user = getUser();
  const gallery = getGallery();
  gallery.unshift({ id: Date.now().toString(), src, caption, uploadedAt: new Date().toISOString(), uploadedBy: user ? user.name : 'Unknown' });
  saveGallery(gallery);
}

function deletePhoto(id) {
  saveGallery(getGallery().filter(p => p.id !== id));
}

function updateCaption(id, caption) {
  saveGallery(getGallery().map(p => p.id === id ? { ...p, caption } : p));
}

async function compressImage(file, maxDim = 1200, quality = 0.78) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) { height = Math.round(height * maxDim / width); width = maxDim; }
          else { width = Math.round(width * maxDim / height); height = maxDim; }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width; canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

// ─── Settings ─────────────────────────────────────────────────────────────────
function getSettings() {
  return store.get('lg_settings') || { startDate: '', apiKey: '', couplePhoto: '' };
}
function saveSettings(s) { store.set('lg_settings', s); }

function getDaysTogether() {
  const s = getSettings();
  if (!s.startDate) return null;
  return Math.max(0, Math.floor((new Date() - new Date(s.startDate)) / 86400000));
}

function getNextAnniversary() {
  const s = getSettings();
  if (!s.startDate) return null;
  const start = new Date(s.startDate);
  const now = new Date();
  const thisYear = new Date(now.getFullYear(), start.getMonth(), start.getDate());
  const ann = thisYear < now ? new Date(now.getFullYear() + 1, start.getMonth(), start.getDate()) : thisYear;
  return { date: ann, days: Math.ceil((ann - now) / 86400000) };
}

// ─── Export / Import ──────────────────────────────────────────────────────────
function exportData() {
  const data = {};
  Object.keys(localStorage).filter(k => k.startsWith('lg_')).forEach(k => { data[k] = localStorage.getItem(k); });
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'love-galore-backup-' + new Date().toISOString().slice(0,10) + '.json';
  a.click(); URL.revokeObjectURL(url);
  toast('Backup downloaded ♥', 'success');
}

function importData(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      if (typeof data !== 'object') throw new Error();
      Object.entries(data).forEach(([k, v]) => { if (k.startsWith('lg_')) localStorage.setItem(k, v); });
      toast('Data restored! Reloading...', 'success');
      setTimeout(() => location.reload(), 1500);
    } catch { toast('Invalid backup file', 'error'); }
  };
  reader.readAsText(file);
}

// ─── Love Letters ─────────────────────────────────────────────────────────────
function getLetters() { return store.get('lg_letters') || []; }
function saveLetters(l) { store.set('lg_letters', l); }

function createLetter(data) {
  const user = getUser();
  const letter = { id: Date.now().toString(), ...data, createdAt: new Date().toISOString(), from: user.name };
  const letters = getLetters(); letters.unshift(letter); saveLetters(letters);
  return letter;
}

function isLetterUnlocked(letter) { return new Date(letter.unlockDate) <= new Date(); }

function deleteLetter(id) { saveLetters(getLetters().filter(l => l.id !== id)); }

// ─── Bucket List ──────────────────────────────────────────────────────────────
function getBucketList() { return store.get('lg_bucket') || []; }
function saveBucketList(b) { store.set('lg_bucket', b); }

function addBucketItem(data) {
  const items = getBucketList();
  items.unshift({ id: Date.now().toString(), ...data, createdAt: new Date().toISOString(), completed: false });
  saveBucketList(items);
}

function toggleBucketItem(id) {
  saveBucketList(getBucketList().map(i => i.id === id ? { ...i, completed: !i.completed, completedAt: !i.completed ? new Date().toISOString() : null } : i));
}

function deleteBucketItem(id) { saveBucketList(getBucketList().filter(i => i.id !== id)); }

// ─── Quick Notes ──────────────────────────────────────────────────────────────
function getNotes() { return store.get('lg_notes') || []; }
function saveNotes(n) { store.set('lg_notes', n); }

function addNote(text) {
  const user = getUser();
  const notes = getNotes();
  notes.unshift({ id: Date.now().toString(), text, createdAt: new Date().toISOString(), by: user ? user.name : '' });
  if (notes.length > 30) notes.pop();
  saveNotes(notes);
}

function deleteNote(id) { saveNotes(getNotes().filter(n => n.id !== id)); }

// ─── Claude API Date Ideas ────────────────────────────────────────────────────
async function generateDateIdeasAI(city, filters, apiKey) {
  const filterNames = filters.length > 0 ? filters.join(', ') : 'dining, outdoor, arts, adventure, cozy, unique';
  const prompt = `You are a romantic date planner. Generate 6 creative, specific date ideas for a couple in ${city}. Activity types to include: ${filterNames}.

For each idea return a JSON object with these exact fields:
- emoji: one relevant emoji
- title: catchy romantic title (max 6 words)
- description: 2-3 vivid romantic sentences, mention ${city} specifically
- source: real platforms like "TripAdvisor · Yelp" or "Airbnb Experiences · GetYourGuide"
- cost: one of "$", "$$", "$$$", "$$$$"
- duration: e.g. "2-3 hours"
- bestTime: e.g. "Evening" or "Sunset"
- vibe: short mood phrase e.g. "Elegant & Intimate"
- tips: array of exactly 4 short romantic practical tips
- category: one of: dining, outdoor, arts, adventure, cozy, unique

Return ONLY a valid JSON array of 6 objects. No markdown fences, no explanation.`;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 3000,
      messages: [{ role: 'user', content: prompt }]
    })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `API error ${res.status}`);
  }
  const data = await res.json();
  const text = data.content[0].text.trim();
  const match = text.match(/\[[\s\S]*\]/);
  if (!match) throw new Error('Unexpected AI response — try again');
  return JSON.parse(match[0]);
}
