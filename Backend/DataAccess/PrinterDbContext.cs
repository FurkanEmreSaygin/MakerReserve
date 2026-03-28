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
    public DbSet<SystemSetting> SystemSettings { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Sistem ilk kurulduğunda varsayılan olarak 480 dakika (8 saat) ayarlasın
        modelBuilder.Entity<SystemSetting>().HasData(
            new SystemSetting { Id = 1, MaxActiveReservationMinutes = 480 }
        );
    }
}