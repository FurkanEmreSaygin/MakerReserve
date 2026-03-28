using Business.Abstract;
using Entities.DTOs.MachineDTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MachineController : ControllerBase
    {
        private readonly IMachineService _machineService;

        public MachineController(IMachineService machineService)
        {
            _machineService = machineService;
        }

        // GET: api/machine
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAll() => Ok(await _machineService.GetAllMachinesAsync());

        // GET: api/machine/active (Öğrencilerin göreceği liste)
        [HttpGet("active")]
        [Authorize]
        public async Task<IActionResult> GetActive() => Ok(await _machineService.GetActiveMachinesAsync());

        // POST: api/machine (Admin makine ekler)
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Add(MachineCreateDto dto) => Ok(await _machineService.AddMachineAsync(dto));

        // PATCH: api/machine/5/toggle (Admin makineyi açar/kapatır)
        [HttpPatch("{id}/toggle")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ToggleStatus(int id)
        {
            await _machineService.ToggleMachineStatusAsync(id);
            return NoContent(); // 204 Başarılı ama geri dönecek veri yok
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            await _machineService.DeleteMachineAsync(id);
            return NoContent();
        }
    }
}