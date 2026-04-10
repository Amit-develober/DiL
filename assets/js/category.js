document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const categoryId = urlParams.get('id');
    const searchQuery = urlParams.get('search');

    renderFilteredBooks(categoryId, searchQuery);
    initInnerSearch(categoryId);
});

function renderFilteredBooks(categoryId, searchQuery) {
    const grid = document.getElementById('books-grid');
    const titleEl = document.getElementById('category-title');
    const descEl = document.getElementById('category-desc');
    const noResults = document.getElementById('no-results');

    let filteredBooks = libraryData.books;

    if (categoryId) {
        const category = libraryData.categories.find(c => c.id === categoryId);
        if (category) {
            titleEl.innerText = category.name;
            descEl.innerText = category.description;
            filteredBooks = libraryData.books.filter(b => b.category === categoryId);
        }
    } else if (searchQuery) {
        titleEl.innerText = `Search Results: "${searchQuery}"`;
        descEl.innerText = `Results from all categories`;
        filteredBooks = libraryData.books.filter(b =>
            b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            b.author.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }

    grid.innerHTML = '';
    if (filteredBooks.length === 0) {
        grid.style.display = 'none';
        noResults.style.display = 'block';
    } else {
        grid.style.display = 'grid';
        noResults.style.display = 'none';
        filteredBooks.forEach(book => {
            const card = document.createElement('div');
            card.className = 'book-card-alt';
            card.onclick = () => openModal(book);
            card.innerHTML = `
                <div class="book-img-small">
                    <img src="${book.image}" alt="${book.title}" width="120" height="180" loading="lazy">
                </div>
                <div class="book-info-alt">
                    <h3>${book.title}</h3>
                    <p>${book.author}</p>
                    <button class="view-btn" aria-label="View details of ${book.title}">Read / View</button>
                </div>
            `;
            grid.appendChild(card);
        });
    }
}

function initInnerSearch(categoryId) {
    const searchInput = document.getElementById('inner-search');
    const urlParams = new URLSearchParams(window.location.search);
    const initialSearchQuery = urlParams.get('search');

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        let filtered = libraryData.books;

        if (categoryId) {
            filtered = filtered.filter(b => b.category === categoryId);
        } else if (initialSearchQuery) {
            filtered = filtered.filter(b => 
                b.title.toLowerCase().includes(initialSearchQuery.toLowerCase()) || 
                b.author.toLowerCase().includes(initialSearchQuery.toLowerCase())
            );
        }

        const finalFiltered = filtered.filter(b =>
            b.title.toLowerCase().includes(query) ||
            b.author.toLowerCase().includes(query)
        );

        updateGridContent(finalFiltered);
    });
}

function updateGridContent(books) {
    const grid = document.getElementById('books-grid');
    const noResults = document.getElementById('no-results');

    grid.innerHTML = '';
    if (books.length === 0) {
        grid.style.display = 'none';
        noResults.style.display = 'block';
    } else {
        grid.style.display = 'grid';
        noResults.style.display = 'none';
        books.forEach(book => {
            const card = document.createElement('div');
            card.className = 'book-card-alt';
            card.onclick = () => openModal(book);
            card.innerHTML = `
                <div class="book-img-small">
                    <img src="${book.image}" alt="${book.title}" width="120" height="180" loading="lazy">
                </div>
                <div class="book-info-alt">
                    <h3>${book.title}</h3>
                    <p>${book.author}</p>
                    <button class="view-btn" aria-label="View details of ${book.title}">Read / View</button>
                </div>
            `;
            grid.appendChild(card);
        });
    }
}
