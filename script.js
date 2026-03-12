// Cole Lo
const form = document.getElementById('search-form');
const queryInput = document.getElementById('card-query');
const statusMessage = document.getElementById('status-message');
const resultsGrid = document.getElementById('results-grid');

const SCRYFALL_URL = 'https://api.scryfall.com/cards/search';
const API_URL = "http://localhost:5274/api/cards";

let currentSearchCards = [];

function setStatus(message, type = 'info') {
    statusMessage.textContent = message;
    statusMessage.dataset.type = type;
}

function clearResults() {
    resultsGrid.innerHTML = '';
}

function renderResults(cards) {
    clearResults();
    currentSearchCards = cards;

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
                <a class="card-link" href="${card.url}" target="_blank">View details</a>
                <button class="add-card-button">Add to My Cards</button>
                <span class="source-badge">${card.source}</span>
            </div>
        `;

        const addButton = cardElement.querySelector(".add-card-button");

        addButton.addEventListener("click", async () => {

            try {

                const response = await fetch(API_URL, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
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

                if (response.status === 409) {
                    setStatus(`${card.name} already exists in your collection.`, "warning");
                    return;
                }

                if (!response.ok) {
                    throw new Error("Failed to save card");
                }

                setStatus(`Added "${card.name}" to My Cards!`, "success");

                addButton.textContent = "Added";
                addButton.disabled = true;

            } catch (err) {
                setStatus(`Error: ${err.message}`, "error");
            }

        });

        fragment.appendChild(cardElement);
    });

    resultsGrid.appendChild(fragment);

    setStatus(`Found ${cards.length} cards.`, "success");
}

function isDefaultCardBackImage(imageUrl) {
    if (!imageUrl) return true;

    const normalizedUrl = imageUrl.toLowerCase();

    const patterns = [
        'multiverseid=0',
        'cardback',
        'card_back',
        '/backs/',
        'default-card-back'
    ];

    return patterns.some(p => normalizedUrl.includes(p));
}

function normalizeScryfallCard(card) {

    const imageUrl =
        card.image_uris?.normal ||
        card.card_faces?.[0]?.image_uris?.normal ||
        '';

    return {
        id: card.id,
        source: "Scryfall",
        name: card.name,
        type: card.type_line,
        manaCost: card.mana_cost,
        setName: card.set_name,
        rarity: card.rarity,
        url: card.scryfall_uri,
        image: isDefaultCardBackImage(imageUrl) ? "" : imageUrl
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

    return cards.filter(card => {

        const key = `${card.name}|${card.setName}`;

        if (seen.has(key)) return false;

        seen.add(key);

        return true;
    });
}

async function runSearch(query) {

    setStatus("Searching cards…", "info");

    clearResults();

    const cards = await searchScryfall(query);

    const uniqueCards = dedupeCards(cards);

    renderResults(uniqueCards);
}

document.addEventListener("DOMContentLoaded", () => {

    form.addEventListener("submit", async (event) => {

        event.preventDefault();

        const query = queryInput.value.trim();

        if (!query) {
            setStatus("Enter a card name.", "warning");
            return;
        }

        try {
            await runSearch(query);
        }
        catch (error) {
            setStatus(`Search failed: ${error.message}`, "error");
        }

    });

});