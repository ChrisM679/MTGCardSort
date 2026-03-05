const MY_CARDS_STORAGE_KEY = 'myCards';

const statusMessage = document.getElementById('my-cards-status');
const cardsGrid = document.getElementById('my-cards-grid');

function setStatus(message, type = 'info') {
    statusMessage.textContent = message;
    statusMessage.dataset.type = type;
}

function getMyCards() {
    try {
        const storedCards = localStorage.getItem(MY_CARDS_STORAGE_KEY);
        const parsedCards = JSON.parse(storedCards || '[]');
        return Array.isArray(parsedCards) ? parsedCards : [];
    } catch {
        return [];
    }
}

function renderMyCards(cards) {
    cardsGrid.innerHTML = '';

    if (!cards.length) {
        setStatus('No cards saved yet. Use Search to add cards to your collection.', 'warning');
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
                <a class="card-link" href="${card.url || '#'}" target="_blank" rel="noopener noreferrer">View details</a>
                <span class="source-badge">${card.source || 'Saved'}</span>
            </div>
        `;

        fragment.appendChild(cardElement);
    });

    cardsGrid.appendChild(fragment);
    setStatus(`Showing ${cards.length} saved card${cards.length === 1 ? '' : 's'}.`, 'success');
}

document.addEventListener('DOMContentLoaded', () => {
    const cards = getMyCards();
    renderMyCards(cards);
});
