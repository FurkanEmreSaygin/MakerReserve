using DataAccess;
using Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class SettingsController : ControllerBase
{
    private readonly PrinterDbContext _context;

    public SettingsController(PrinterDbContext context)
    {
        _context = context;
    }

    // Herkes okuyabilir (Frontend'de kalan süreyi hesaplamak için lazım)
    [HttpGet]
    public async Task<IActionResult> GetSettings()
    {
        var setting = await _context.SystemSettings.FirstOrDefaultAsync();
        return Ok(setting ?? new SystemSetting { MaxActiveReservationMinutes = 480 });
    }

    // Sadece Admin güncelleyebilir
    [HttpPut]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateSettings([FromBody] UpdateSettingDto dto)
    {
        var setting = await _context.SystemSettings.FirstOrDefaultAsync();
        if (setting != null)
        {
            setting.MaxActiveReservationMinutes = dto.NewLimit;
            _context.SystemSettings.Update(setting);
            await _context.SaveChangesAsync();
        }
        return Ok(new { message = "Ayarlar başarıyla güncellendi." });
    }
}

// React'tan gelecek veriyi karşılamak için ufak bir DTO
public class UpdateSettingDto
{
    public int NewLimit { get; set; }
}