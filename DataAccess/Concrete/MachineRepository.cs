using DataAccess.Abstract;
using Entities;
using Microsoft.EntityFrameworkCore;

namespace DataAccess.Concrete;

public class MachineRepository : IMachineRepository
{
    private readonly PrinterDbContext _context;

    public MachineRepository(PrinterDbContext context)
    {
        _context = context;
    }

    public async Task<Machine?> GetByIdAsync(int id) =>
        await _context.Machines.FirstOrDefaultAsync(m => m.Id == id);

    public async Task<List<Machine>> GetAllAsync() =>
        await _context.Machines.ToListAsync();

    public async Task<List<Machine>> GetActiveMachinesAsync() =>
        await _context.Machines.Where(m => m.IsActive).ToListAsync();

    public async Task AddAsync(Machine machine)
    {
        await _context.Machines.AddAsync(machine);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(Machine machine)
    {
        _context.Machines.Update(machine);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var machine = await GetByIdAsync(id);
        if (machine != null)
        {
            _context.Machines.Remove(machine);
            await _context.SaveChangesAsync();
        }
    }
}