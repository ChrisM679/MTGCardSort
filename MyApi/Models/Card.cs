
using System.ComponentModel.DataAnnotations;

namespace MyApi.Models;
public class Card()
{
    [Key]
    public int Id {get; set;}
    public string name;

}