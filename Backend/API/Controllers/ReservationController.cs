using Business.Abstract;
using Entities.DTOs.ReservationDTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // DİKKAT: Bu sınıfa sadece elinde geçerli bir Token olanlar girebilir!
    public class ReservationController : ControllerBase
    {
        private readonly IReservationService _reservationService;

        public ReservationController(IReservationService reservationService)
        {
            _reservationService = reservationService;
        }

        // Token'ın içinden ID'yi çıkartan pratik yardımcı metodumuz
        private int GetUserIdFromToken()
        {
            // ClaimTypes.NameIdentifier, biz token üretirken ID'yi koyduğumuz yerdir
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return int.Parse(userIdString!);
        }

        // POST: api/reservation
        [HttpPost]
        public async Task<IActionResult> CreateReservation(ReservationCreateDto dto)
        {
            try
            {
                // Güvenlik: ID'yi dışarıdan almıyoruz, Token'dan kendimiz çekiyoruz!
                int userId = GetUserIdFromToken(); 
                
                var result = await _reservationService.CreateReservationAsync(userId, dto);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // GET: api/reservation/daily/2026-11-15
        [HttpGet("daily/{date}")]
        public async Task<IActionResult> GetDaily(DateTime date)
        {
            // React bu endpoint'i çağırıp dolu saatleri kırmızıya boyayacak
            var reservations = await _reservationService.GetDailyReservationsAsync(date);
            return Ok(reservations);
        }

        // GET: api/reservation/my-reservations
        [HttpGet("my-reservations")]
        public async Task<IActionResult> GetMyReservations()
        {
            int userId = GetUserIdFromToken();
            var reservations = await _reservationService.GetMyReservationsAsync(userId);
            return Ok(reservations);
        }
        [HttpPut("cancel/{id}")]
        public async Task<IActionResult> CancelReservation(int id)
        {
            // Token'dan giriş yapan kullanıcının ID'sini alıyoruz
            var userIdStr = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr)) return Unauthorized();

            await _reservationService.CancelReservationAsync(id, int.Parse(userIdStr));
            return Ok(new { message = "Randevu başarıyla iptal edildi ve filament iade edildi." });
        }
        [HttpGet("admin/active")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllActiveReservations()
        {
            try
            {
                var result = await _reservationService.GetAllActiveReservationsAsync();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("admin/cancel/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> AdminCancelReservation(int id)
        {
            try
            {
                await _reservationService.AdminCancelReservationAsync(id);
                return Ok(new { message = "Randevu admin tarafından başarıyla iptal edildi." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    } 
}