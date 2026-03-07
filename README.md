# MTG Card Sort

MTG Card Sort is a web app for searching Magic: The Gathering cards and saving selected cards to a personal collection.

It includes:
- A static frontend (`Home.html`, `Search.html`, `MyCards.html`)
- An ASP.NET Core Web API backend (`MyApi/`)
- SQL Server persistence via Entity Framework Core
- Card search powered by the Scryfall API

## Features

- Search cards using Scryfall query syntax
- View card details and images
- Save cards to your backend database from the search results
- View saved cards from the API on the My Cards page

## Project Structure

```text
MTGCardSort/
	Home.html
	Search.html
	MyCards.html
	script.js
	styles.css
	MyApi/
		Controllers/
			CardsController.cs
			MainController.cs
		Data/
			DbContext.cs
		Models/
			Card.cs
		Migrations/
		Program.cs
```

## Tech Stack

- Frontend: HTML, CSS, JavaScript
- Backend: ASP.NET Core (.NET 10)
- ORM: Entity Framework Core
- Database: SQL Server
- External API: Scryfall (`https://api.scryfall.com`)

## Prerequisites

- .NET SDK 10.0
- SQL Server (local or accessible instance)
- `dotnet-ef` tool installed for migrations

Install EF CLI tool if needed:

```bash
dotnet tool install --global dotnet-ef
```

## Setup

1. Clone/open this workspace.
2. Update the connection string in `MyApi/appsettings.json` if needed:

```json
"ConnectionStrings": {
	"DefaultConnection": "Server=localhost;Database=MTGCardSort;Trusted_Connection=True;TrustServerCertificate=True;"
}
```

3. Apply database migrations:

```bash
cd MyApi
dotnet ef database update
```

4. Run the API:

```bash
cd MyApi
dotnet run
```

The API runs at `http://localhost:5274` by default (see `MyApi/Properties/launchSettings.json`).

5. Open frontend pages in your browser:
- `Home.html`
- `Search.html`
- `MyCards.html`

## API Endpoints

Base URL: `http://localhost:5274`

- `GET /api/cards`
	Returns all saved cards.

- `POST /api/cards`
	Saves a card.

Example request body:

```json
{
	"source": "Scryfall",
	"name": "Lightning Bolt",
	"type": "Instant",
	"manaCost": "{R}",
	"setName": "Magic 2010",
	"rarity": "common",
	"url": "https://scryfall.com/card/m10/146/lightning-bolt",
	"image": "https://cards.scryfall.io/normal/front/...jpg"
}
```

## Notes

- CORS is currently configured with an `AllowAll` policy in `MyApi/Program.cs` for local development.
- Scryfall search is performed directly from the frontend in `script.js`.
- The repository currently includes `mycards.js`, but `MyCards.html` uses `script.js` to render saved cards from the backend API.

## Development Commands

From `MyApi/`:

```bash
dotnet restore
dotnet build
dotnet run
```

## Disclaimer

Magic: The Gathering and all related properties are trademarks of Wizards of the Coast.
