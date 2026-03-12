using Xunit;
using MyApi.Controllers;
using MyApi.Models;
using MyApi.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;

public class CardsControllerTests
{
    private AppDbContext GetDbContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: System.Guid.NewGuid().ToString())
            .Options;

        return new AppDbContext(options);
    }

    [Fact]
    public async Task AddCard_ShouldAddCard()
    {
        var context = GetDbContext();
        var controller = new CardsController(context);

        var card = new Card
        {
            Id = 1,
            Name = "Black Lotus",
            Source = "MTG",
            Type = "Artifact",
            ManaCost = "0",
            SetName = "Alpha",
            Rarity = "Rare",
            Url = "https://example.com/blacklotus",
            Image = "https://example.com/blacklotus.jpg"
        };

        await controller.AddCard(card);

        Assert.Equal(1, context.Cards.Count());
    }

    [Fact]
    public async Task AddCard_ShouldPreventDuplicate()
    {
        var context = GetDbContext();

        context.Cards.Add(new Card
        {
            Id = 1,
            Name = "Black Lotus",
            Source = "MTG",
            Type = "Artifact",
            ManaCost = "0",
            SetName = "Alpha",
            Rarity = "Rare",
            Url = "https://example.com/blacklotus",
            Image = "https://example.com/blacklotus.jpg"
        });

        context.SaveChanges();

        var controller = new CardsController(context);

        var duplicateCard = new Card
        {
            Id = 1,
            Name = "Black Lotus",
            Source = "MTG",
            Type = "Artifact",
            ManaCost = "0",
            SetName = "Alpha",
            Rarity = "Rare",
            Url = "https://example.com/blacklotus",
            Image = "https://example.com/blacklotus.jpg"
        };

        var result = await controller.AddCard(duplicateCard);

        Assert.IsType<ConflictObjectResult>(result);
    }

    [Fact]
    public void GetCards_ShouldReturnCards()
    {
        var context = GetDbContext();

        context.Cards.Add(new Card
        {
            Id = 1,
            Name = "Sol Ring",
            Source = "MTG",
            Type = "Artifact",
            ManaCost = "1",
            SetName = "Commander",
            Rarity = "Uncommon",
            Url = "https://example.com/solring",
            Image = "https://example.com/solring.jpg"
        });

        context.SaveChanges();

        var controller = new CardsController(context);

        var result = controller.GetCards();

        var okResult = Assert.IsType<OkObjectResult>(result);
        var cards = Assert.IsAssignableFrom<List<Card>>(okResult.Value);

        Assert.Single(cards);
    }

    [Fact]
    public async Task DeleteCard_ShouldRemoveCard()
    {
        var context = GetDbContext();

        context.Cards.Add(new Card
        {
            Id = 1,
            Name = "Lightning Bolt",
            Source = "MTG",
            Type = "Instant",
            ManaCost = "R",
            SetName = "Alpha",
            Rarity = "Common",
            Url = "https://example.com/lightningbolt",
            Image = "https://example.com/lightningbolt.jpg"
        });

        context.SaveChanges();

        var controller = new CardsController(context);

        await controller.DeleteCard(1);

        Assert.Empty(context.Cards);
    }
}