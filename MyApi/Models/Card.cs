
using System.ComponentModel.DataAnnotations;

namespace MyApi.Models;
public class Card
{
    [Key]
    public int Id {get; set;}
   public string Source { get; set; }  // e.g., "Scryfall"
        public string Name { get; set; }
        public string Type { get; set; }
        public string ManaCost { get; set; }
        public string SetName { get; set; }
        public string Rarity { get; set; }
        public string Url { get; set; }      // link to Scryfall page
        public string Image { get; set; }    // image URL

}