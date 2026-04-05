using Entities.DTOs.ReservationDTOs;

namespace Business.Abstract;

public interface IReservationService
{
    // userId'yi Controller'dan (Token'ın içinden okuyup) buraya parametre olarak göndereceğiz
    Task<ReservationDto> CreateReservationAsync(int userId, ReservationCreateDto dto);
    Task<List<ReservationDto>> GetDailyReservationsAsync(DateTime date);
    Task<List<ReservationDto>> GetMyReservationsAsync(int userId);
    Task CancelReservationAsync(int reservationId, int userId);
    Task<List<ReservationDto>> GetAllActiveReservationsAsync();
    Task AdminCancelReservationAsync(int reservationId);
}