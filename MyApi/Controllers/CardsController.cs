using Microsoft.AspNetCore.Mvc;
using MyApi.Models;
using MyApi.Data; 
using System.Linq;
using System.Threading.Tasks;

[ApiController]
[Route("api/[controller]")]
public class CardsController : ControllerBase
{
    private readonly AppDbContext _context;

    public CardsController(AppDbContext context)
    {
        _context = context;
    }

    // POST api/cards - Add a card to the database
    [HttpPost]
    public async Task<IActionResult> AddCard([FromBody] Card card)
    {
        if (card == null) return BadRequest();

        // Prevent duplicates
        if (_context.Cards.Any(c => c.Id == card.Id))
            return Conflict("Card already exists");

        _context.Cards.Add(card);
        await _context.SaveChangesAsync();

        return Ok(card);
    }

    // GET api/cards - Retrieve all stored cards
    [HttpGet]
    public IActionResult GetCards()
    {
        return Ok(_context.Cards.ToList());
    }
}