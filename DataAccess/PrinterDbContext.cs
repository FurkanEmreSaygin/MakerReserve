using Entities; // Modellerimizi kullanabilmek için
using Microsoft.EntityFrameworkCore;

namespace DataAccess;

public class PrinterDbContext : DbContext
{
    public PrinterDbContext(DbContextOptions<PrinterDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
    public DbSet<Machine> Machines { get; set; }
    public DbSet<Filament> Filaments { get; set; }
    public DbSet<Reservation> Reservations { get; set; }
}