using DataAccess.Abstract;
using Entities;
using Microsoft.EntityFrameworkCore;

namespace DataAccess.Concrete;

public class ReservationRepository : IReservationRepository
{
    private readonly PrinterDbContext _context;

    public ReservationRepository(PrinterDbContext context)
    {
        _context = context;
    }

    public async Task<Reservation?> GetByIdAsync(int id) =>
        await _context.Reservations
            .Include(r => r.User)
            .Include(r => r.Machine)
            .Include(r => r.Filament)
            .FirstOrDefaultAsync(r => r.Id == id);

    public async Task<List<Reservation>> GetAllAsync() =>
        await _context.Reservations
            .Include(r => r.User)
            .Include(r => r.Machine)
            .Include(r => r.Filament)
            .ToListAsync();

    public async Task<List<Reservation>> GetByDateAsync(DateTime date) =>
        await _context.Reservations
            .Include(r => r.User)
            .Include(r => r.Machine)
            .Where(r => r.StartTime.Date == date.Date)
            .ToListAsync();

    public async Task<List<Reservation>> GetByUserIdAsync(int userId) =>
        await _context.Reservations
            .Include(r => r.Machine)
            .Include(r => r.Filament)
            .Where(r => r.UserId == userId)
            .ToListAsync();

    public async Task AddAsync(Reservation reservation)
    {
        await _context.Reservations.AddAsync(reservation);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(Reservation reservation)
    {
        _context.Reservations.Update(reservation);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var reservation = await GetByIdAsync(id);
        if (reservation != null)
        {
            _context.Reservations.Remove(reservation);
            await _context.SaveChangesAsync();
        }
    }
}