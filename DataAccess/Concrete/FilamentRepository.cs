using DataAccess.Abstract;
using Entities;
using Microsoft.EntityFrameworkCore;

namespace DataAccess.Concrete;

public class FilamentRepository : IFilamentRepository
{
    private readonly PrinterDbContext _context;

    public FilamentRepository(PrinterDbContext context)
    {
        _context = context;
    }

    public async Task<Filament?> GetByIdAsync(int id) =>
        await _context.Filaments.FirstOrDefaultAsync(f => f.Id == id);

    public async Task<List<Filament>> GetAllAsync() =>
        await _context.Filaments.ToListAsync();

    public async Task AddAsync(Filament filament)
    {
        await _context.Filaments.AddAsync(filament);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(Filament filament)
    {
        _context.Filaments.Update(filament);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var filament = await GetByIdAsync(id);
        if (filament != null)
        {
            _context.Filaments.Remove(filament);
            await _context.SaveChangesAsync();
        }
    }
}