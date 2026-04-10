document.addEventListener('DOMContentLoaded', () => {
    // 1. Core Utilities (Always need to work)
    initMobileMenu();
    initReveal();
    
    // 2. Dynamic Components (May depend on libraryData or specific page structure)
    try {
        if (typeof libraryData !== 'undefined') {
            initTrendingSlider();
            initAchievementsCounter();
            renderCategories();
        }
        initSearch();
        initHeroSlider();
        initModal();
        initResourceSearch();
        initGameSearch();
        initCategorySearch();
        initKeyboardAccessibility();
        initQuotePopup();
    } catch (error) {
        console.error('Error initializing some components:', error);
    }
});

// Trending Slider Logic
function initTrendingSlider() {
    const sliderContainer = document.querySelector('.slider-container');
    if (!sliderContainer) return;

    // Show only first 3 trending books
    const trendingBooks = libraryData.books.filter(book => book.trending).slice(0, 3);

    trendingBooks.forEach(book => {
        const bookCard = document.createElement('div');
        bookCard.className = 'book-card';
        bookCard.onclick = () => openModal(book);
        bookCard.innerHTML = `
            <div class="book-img">
                <img src="${book.image}" alt="${book.title}" width="350" height="350" loading="lazy">
            </div>
            <div class="book-info">
                <h3>${book.title}</h3>
                <p>${book.author}</p>
                <button class="view-btn" aria-label="View details of ${book.title}">Read / View</button>
            </div>
        `;
        sliderContainer.appendChild(bookCard);
    });
}

// Achievements Counter Logic
function initAchievementsCounter() {
    const achievementsSection = document.querySelector('.achievements');
    const statsGrid = document.querySelector('.stats-grid');
    if (!statsGrid) return;

    // Render Stats
    libraryData.achievements.forEach(stat => {
        const statCard = document.createElement('div');
        statCard.className = 'stat-card';
        statCard.innerHTML = `
            <i class="${stat.icon}"></i>
            <h3 class="counter" data-target="${stat.value}" data-suffix="${stat.suffix || ''}">0</h3>
            <p>${stat.label}</p>
        `;
        statsGrid.appendChild(statCard);
    });

    // Intersection Observer for Animation
    const counters = document.querySelectorAll('.counter');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = parseInt(counter.getAttribute('data-target'));
                const suffix = counter.getAttribute('data-suffix');
                animateCounter(counter, target, suffix);
                observer.unobserve(counter);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => observer.observe(counter));
}

function animateCounter(el, target, suffix) {
    let current = 0;
    const increment = target / 100;
    const update = () => {
        if (current < target) {
            current += increment;
            el.innerText = Math.ceil(current).toLocaleString() + suffix;
            setTimeout(update, 20);
        } else {
            el.innerText = target.toLocaleString() + suffix;
        }
    };
    update();
}

// Render Categories
function renderCategories(filter = '') {
    const categoriesGrid = document.querySelector('.categories-grid[data-dynamic="true"]');
    if (!categoriesGrid) return;

    categoriesGrid.innerHTML = '';
    const filtered = libraryData.categories.filter(cat => 
        cat.name.toLowerCase().includes(filter.toLowerCase()) ||
        cat.description.toLowerCase().includes(filter.toLowerCase())
    );

    if (filtered.length === 0) {
        categoriesGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted); font-size: 1.2rem;">No categories found matching your search.</div>';
        return;
    }

    filtered.forEach(cat => {
        const catCard = document.createElement('div');
        catCard.className = 'category-card';
        catCard.setAttribute('role', 'button');
        catCard.setAttribute('tabindex', '0');
        catCard.onclick = (e) => {
            e.preventDefault();
            window.location.href = `category.html?id=${encodeURIComponent(cat.id)}`;
        };
        catCard.innerHTML = `
            <div class="category-icon-wrapper">
                <i class="${cat.icon}"></i>
            </div>
            <h3>${cat.name}</h3>
            <p>${cat.description}</p>
        `;
        categoriesGrid.appendChild(catCard);
    });
}

// Category Page Search Logic
function initCategorySearch() {
    const searchInput = document.getElementById('cat-search');
    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
        renderCategories(e.target.value.trim());
    });
}

// Search Logic
function initSearch() {
    const searchBar = document.querySelector('.search-bar');
    const searchBtn = document.querySelector('.search-btn');

    if (!searchBar) return;

    const handleSearch = () => {
        const query = searchBar.value.trim().toLowerCase();
        if (query) {
            window.location.href = `category.html?search=${encodeURIComponent(query)}`;
        }
    };

    searchBtn.addEventListener('click', handleSearch);
    searchBar.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });
}

// Hero Slider Logic
function initHeroSlider() {
    const sliderBg = document.querySelector('.hero-slider-bg');
    if (!sliderBg) return;

    const desktopImages = ['Image/scan.webp', 'Image/scan1.webp', 'Image/scan2.webp'];
    const mobileImages = ['Image/scan3.webp', 'Image/scan4.webp', 'Image/scan5.webp'];

    let currentMode = window.innerWidth <= 768 ? 'mobile' : 'desktop';

    function loadImages(mode) {
        sliderBg.innerHTML = '';
        const images = mode === 'mobile' ? mobileImages : desktopImages;
        images.forEach((src, index) => {
            const img = document.createElement('img');
            img.src = src;
            img.width = 1920; // Hero image standard width
            img.height = 1080; // Hero image standard height
            if (index === 0) img.classList.add('active');
            sliderBg.appendChild(img);
        });
        return sliderBg.querySelectorAll('img');
    }

    let imgs = loadImages(currentMode);
    let currentIndex = 0;

    // Swap image set on resize between mobile/desktop (Passive listener)
    window.addEventListener('resize', () => {
        const newMode = window.innerWidth <= 768 ? 'mobile' : 'desktop';
        if (newMode !== currentMode) {
            currentMode = newMode;
            currentIndex = 0;
            imgs = loadImages(currentMode);
        }
    }, { passive: true });

    setInterval(() => {
        if (imgs && imgs.length > 0) {
            imgs[currentIndex].classList.remove('active');
            currentIndex = (currentIndex + 1) % imgs.length;
            imgs[currentIndex].classList.add('active');
        }
    }, 3000); // 3 seconds interval
}

// Mobile Menu Logic
function initMobileMenu() {
    const toggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (!toggle || !navLinks) return;

    toggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        const icon = toggle.querySelector('i');
        if (navLinks.classList.contains('active')) {
            icon.classList.replace('fa-bars', 'fa-times');
        } else {
            icon.classList.replace('fa-times', 'fa-bars');
        }
    });

    // Close menu on link click
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            toggle.querySelector('i').classList.replace('fa-times', 'fa-bars');
        });
    });
}

// Modal Logic
function initModal() {
    const modal = document.getElementById('reader-modal');
    if (!modal) return;
    const closeBtn = document.querySelector('.close-modal');

    if (closeBtn) {
        closeBtn.onclick = () => modal.classList.remove('active');
    }
    window.addEventListener('click', (e) => { 
        if (e.target === modal) modal.classList.remove('active'); 
    });
}

function openModal(book) {
    const modal = document.getElementById('reader-modal');
    if (!modal) return;
    const mImg = document.getElementById('modal-img');
    const mTitle = document.getElementById('modal-title');
    const mAuthor = document.getElementById('modal-author');
    const mCat = document.getElementById('modal-cat');

    mImg.src = book.image;
    mTitle.innerText = book.title;
    mAuthor.innerText = book.author;
    mCat.innerText = book.category ? book.category.toUpperCase() : 'GENERAL';

    modal.classList.add('active');
}

// Scroll Reveal Logic
function initReveal() {
    const reveals = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0.15 });

    reveals.forEach(el => observer.observe(el));
}

// E-Resources Search Logic
function initResourceSearch() {
    const searchInput = document.getElementById('resource-search');
    const cards = document.querySelectorAll('.category-card');
    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        cards.forEach(card => {
            const title = card.querySelector('h3').innerText.toLowerCase();
            const desc = card.querySelector('p').innerText.toLowerCase();
            card.style.display = (title.includes(query) || desc.includes(query)) ? '' : 'none';
        });
    });
}

// Games Search Logic
function initGameSearch() {
    const searchInput = document.getElementById('game-search');
    const cards = document.querySelectorAll('.category-card');
    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        cards.forEach(card => {
            const title = card.querySelector('h3').innerText.toLowerCase();
            const desc = card.querySelector('p').innerText.toLowerCase();
            card.style.display = (title.includes(query) || desc.includes(query)) ? '' : 'none';
        });
    });
}

// Keyboard Accessibility for Interactive Elements
function initKeyboardAccessibility() {
    const clickableCards = document.querySelectorAll('[role="button"][tabindex="0"]');
    clickableCards.forEach(card => {
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                card.click();
            }
        });
    });
}

// Quote Popup Logic
function initQuotePopup() {
    const modal = document.getElementById('quote-modal');
    if (!modal) return;

    // Only show on Home page
    const isHomePage = window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/');
    if (!isHomePage) return;

    const quotes = [
        { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
        { text: "Knowledge is power.", author: "Francis Bacon" },
        { text: "Reading is to the mind what exercise is to the body.", author: "Joseph Addison" },
        { text: "Education is the most powerful weapon which you can use to change the world.", author: "Nelson Mandela" },
        { text: "A library is not a luxury but one of the necessities of life.", author: "Henry Ward Beecher" },
        { text: "The journey of a thousand miles begins with one step.", author: "Lao Tzu" },
        { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
        { text: "An investment in knowledge pays the best interest.", author: "Benjamin Franklin" },
        { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
        { text: "The more that you read, the more things you will know.", author: "Dr. Seuss" },
        { text: "Believe in yourself and all that you are.", author: "Christian D. Larson" },
        { text: "Believe in yourself, you can do it.", author: "Motivational" },
        { text: "Today a reader, tomorrow a leader.", author: "Margaret Fuller" },
        { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
        { text: "Books are a uniquely portable magic.", author: "Stephen King" },
        { text: "The best way to predict the future is to create it.", author: "Peter Drucker" },
        { text: "Live as if you were to die tomorrow. Learn as if you were to live forever.", author: "Mahatma Gandhi" },
        { text: "Happiness is not something ready made. It comes from your own actions.", author: "Dalai Lama" },
        { text: "Whatever you are, be a good one.", author: "Abraham Lincoln" },
        { text: "The expert in anything was once a beginner.", author: "Helen Hayes" }
    ];

    // Get last index from localStorage
    let lastIndex = parseInt(localStorage.getItem('dil_quote_index')) || 0;
    
    // Increment index for next time, or reset if at end
    const currentIndex = lastIndex % quotes.length;
    localStorage.setItem('dil_quote_index', (currentIndex + 1).toString());

    // Set content
    const quote = quotes[currentIndex];
    const textEl = document.getElementById('quote-text');
    const authorEl = document.getElementById('quote-author');
    
    if (textEl) textEl.innerText = quote.text;
    if (authorEl) authorEl.innerText = quote.author;

    // Show modal after a short delay for better UX
    setTimeout(() => {
        modal.classList.add('active');
    }, 1000);

    // Close logic
    const closeBtn = document.getElementById('close-quote');
    const continueBtn = document.getElementById('quote-close-btn');

    const closeModal = () => modal.classList.remove('active');

    if (closeBtn) closeBtn.onclick = closeModal;
    if (continueBtn) continueBtn.onclick = closeModal;
    window.addEventListener('click', (e) => { 
        if (e.target === modal) closeModal(); 
    });
}
