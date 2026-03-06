// Cole L
const form = document.getElementById('search-form');
const queryInput = document.getElementById('card-query');
const statusMessage = document.getElementById('status-message');
const resultsGrid = document.getElementById('results-grid');

const SCRYFALL_URL = 'https://api.scryfall.com/cards/search';

function isDefaultCardBackImage(imageUrl) {
    if (!imageUrl) {
        return true;
    }

    const normalizedUrl = imageUrl.toLowerCase();
    const defaultBackPatterns = [
        'multiverseid=0',
        'cardback',
        'card_back',
        '/backs/',
        'default-card-back'
    ];

    return defaultBackPatterns.some((pattern) => normalizedUrl.includes(pattern));
}

function setStatus(message, type = 'info') {
    statusMessage.textContent = message;
    statusMessage.dataset.type = type;
}

function clearResults() {
    resultsGrid.innerHTML = '';
}

function renderResults(cards) {
    clearResults();

    if (!cards.length) {
        setStatus('No cards found for this query.', 'warning');
        return;
    }

    const fragment = document.createDocumentFragment();

    cards.forEach((card) => {
        const cardElement = document.createElement('article');
        cardElement.className = 'card-item';

        const imageHtml = card.image
            ? `<img src="${card.image}" alt="${card.name}" loading="lazy">`
            : '<div class="card-image-placeholder">No image</div>';

        cardElement.innerHTML = `
            <div class="card-image-wrap">${imageHtml}</div>
            <div class="card-body">
                <h3>${card.name || 'Unknown card'}</h3>
                <p class="card-meta">${card.type || 'Type unavailable'}</p>
                <p class="card-meta">Mana: ${card.manaCost || 'N/A'} | Set: ${card.setName || 'N/A'}</p>
                <p class="card-meta">Rarity: ${card.rarity || 'N/A'}</p>
                <a class="card-link" href="${card.url}" target="_blank" rel="noopener noreferrer">View details</a>
                <span class="source-badge">${card.source}</span>
                <button class="add-card-button" data-card-id="${card.id}">Add to My Cards</button>
            </div>
        `;

        fragment.appendChild(cardElement);

        cardElement.querySelector('.add-card-button').addEventListener('click', async () => {
    const cardId = card.id; // same as data-card-id
    try {
        const response = await fetch('http://localhost:5274/api/cards', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
    source: card.source,
    name: card.name,
    type: card.type,
    manaCost: card.manaCost,
    setName: card.setName,
    rarity: card.rarity,
    url: card.url,
    image: card.image
})
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(text || 'Failed to save card');
        }

        setStatus(`Added "${card.name}" to My Cards!`, 'success');
    } catch (err) {
        setStatus(`Error: ${err.message}`, 'error');
    }
});
    });

    resultsGrid.appendChild(fragment);
    setStatus(`Found ${cards.length} cards.`, 'success');
}

function normalizeScryfallCard(card) {
    const imageUrl = card.image_uris?.normal || card.card_faces?.[0]?.image_uris?.normal || '';

    return {
        id: `scryfall-${card.id}`,
        source: 'Scryfall',
        name: card.name,
        type: card.type_line,
        manaCost: card.mana_cost,
        setName: card.set_name,
        rarity: card.rarity,
        url: card.scryfall_uri,
        image: isDefaultCardBackImage(imageUrl) ? '' : imageUrl
    };
}

async function searchScryfall(query) {
    const url = `${SCRYFALL_URL}?q=${encodeURIComponent(query)}`;
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Scryfall error (${response.status})`);
    }

    const data = await response.json();
    const cards = Array.isArray(data.data) ? data.data : [];
    return cards.map(normalizeScryfallCard);
}

function dedupeCards(cards) {
    const seen = new Set();
    return cards.filter((card) => {
        const key = `${card.name}|${card.setName}|${card.source}`;
        if (seen.has(key)) {
            return false;
        }
        seen.add(key);
        return true;
    });
}

async function runSearch(query) {
    setStatus('Searching cards…', 'info');
    clearResults();

    const cards = await searchScryfall(query);
    const uniqueCards = dedupeCards(cards);
    renderResults(uniqueCards);
}

document.addEventListener('DOMContentLoaded', function () {
    form.addEventListener('submit', async function (event) {
        event.preventDefault();

        const query = queryInput.value.trim();

        if (!query) {
            setStatus('Enter a card name or search query.', 'warning');
            return;
        }

        try {
            await runSearch(query);
        } catch (error) {
            setStatus(`Search failed: ${error.message}`, 'error');
        }
    });

    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener('click', function (event) {
            event.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
});
