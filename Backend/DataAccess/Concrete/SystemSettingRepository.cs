using DataAccess.Abstract;
using Entities;
using Microsoft.EntityFrameworkCore;

namespace DataAccess.Concrete;

public class SystemSettingRepository : ISystemSettingRepository
{
    private readonly PrinterDbContext _context;

    public SystemSettingRepository(PrinterDbContext context)
    {
        _context = context;
    }

    public async Task<SystemSetting> GetSettingsAsync()
    {
        // Eğer veritabanında ayar yoksa, uygulamayı çökertmek yerine varsayılan olarak 480 dönüyoruz
        return await _context.SystemSettings.FirstOrDefaultAsync()
               ?? new SystemSetting { MaxActiveReservationMinutes = 480 };
    }
}