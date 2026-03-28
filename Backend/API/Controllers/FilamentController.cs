using Business.Abstract;
using Entities.DTOs.FilamentDTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FilamentController : ControllerBase
    {
        private readonly IFilamentService _filamentService;

        public FilamentController(IFilamentService filamentService)
        {
            _filamentService = filamentService;
        }

        // GET: api/filament
        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetAll() => Ok(await _filamentService.GetAllFilamentsAsync());

        // POST: api/filament (Admin filament ekler)
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Add(FilamentCreateDto dto) => Ok(await _filamentService.AddFilamentAsync(dto));

        // PUT: api/filament/update-weight (Admin fire/kullanım sonrası gramajı günceller)
        [HttpPut("update-weight")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateWeight(FilamentUpdateWeightDto dto)
        {
            await _filamentService.UpdateFilamentWeightAsync(dto);
            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            await _filamentService.DeleteFilamentAsync(id);
            return NoContent();
        }
    }
}