const API_URL = "http://localhost:5274/api/cards";

const statusMessage = document.getElementById("status-message");
const cardsGrid = document.getElementById("cards-grid");

function setStatus(message, type = "info") {
    statusMessage.textContent = message;
    statusMessage.dataset.type = type;
}

async function loadMyCards() {
    try {

        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Failed to load cards");
        }

        const cards = await response.json();

        renderCards(cards);

    } catch (err) {
        setStatus("Error loading cards: " + err.message, "error");
    }
}

function renderCards(cards) {

    cardsGrid.innerHTML = "";

    if (!cards.length) {
        setStatus("No cards saved yet.", "warning");
        return;
    }

    const fragment = document.createDocumentFragment();

    cards.forEach(card => {

        const cardElement = document.createElement("article");
        cardElement.className = "card-item";

        const imageHtml = card.image
            ? `<img src="${card.image}" alt="${card.name}" loading="lazy">`
            : `<div class="card-image-placeholder">No image</div>`;

        cardElement.innerHTML = `
        <div class="card-image-wrap">
            ${imageHtml}
        </div>

        <div class="card-body">

            <h3>${card.name}</h3>

            <p class="card-meta">${card.type || "Unknown type"}</p>

            <p class="card-meta">
                Mana: ${card.manaCost || "N/A"} |
                Set: ${card.setName || "N/A"}
            </p>

            <p class="card-meta">
                Rarity: ${card.rarity || "N/A"}
            </p>

            <a class="card-link"
               href="${card.url}"
               target="_blank">
               View Details
            </a>

            <button class="delete-button" data-id="${card.id}">
                Remove
            </button>

        </div>
        `;

        fragment.appendChild(cardElement);
    });

    cardsGrid.appendChild(fragment);

    setStatus(`Showing ${cards.length} cards.`, "success");

    addDeleteListeners();
}

function addDeleteListeners() {

    const buttons = document.querySelectorAll(".delete-button");

    buttons.forEach(button => {

        button.addEventListener("click", async () => {

            const id = button.dataset.id;

            try {

                const response = await fetch(`${API_URL}/${id}`, {
                    method: "DELETE"
                });

                if (!response.ok) {
                    throw new Error("Failed to delete card");
                }

                setStatus("Card removed.", "success");

                loadMyCards();

            } catch (err) {

                setStatus("Delete failed: " + err.message, "error");

            }

        });

    });

}

document.addEventListener("DOMContentLoaded", loadMyCards);