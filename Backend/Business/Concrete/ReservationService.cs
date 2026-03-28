using Business.Abstract;
using DataAccess.Abstract;
using Entities;
using Entities.DTOs.ReservationDTOs;

namespace Business.Concrete;

public class ReservationService : IReservationService
{
    private readonly IReservationRepository _reservationRepository;
    private readonly IMachineRepository _machineRepository;
    private readonly IFilamentRepository _filamentRepository;
    private readonly IUserRepository _userRepository;
    private readonly ISystemSettingRepository _systemSettingRepository;

    public ReservationService(
        IReservationRepository reservationRepository,
        IMachineRepository machineRepository,
        IFilamentRepository filamentRepository,
        IUserRepository userRepository,
        ISystemSettingRepository systemSettingRepository)
    {
        _reservationRepository = reservationRepository;
        _machineRepository = machineRepository;
        _filamentRepository = filamentRepository;
        _userRepository = userRepository;
        _systemSettingRepository = systemSettingRepository;
    }

    public async Task<ReservationDto> CreateReservationAsync(int userId, ReservationCreateDto dto)
    {
        // --- 1. GÜVENLİK VE SINIR KONTROLLERİ ---

        if (dto.StartTime.DayOfWeek == DayOfWeek.Saturday || dto.StartTime.DayOfWeek == DayOfWeek.Sunday)
            throw new Exception("Hafta sonları için randevu alınamaz.");

        if (dto.StartTime.Date > DateTime.Now.Date.AddDays(14))
            throw new Exception("En fazla 2 hafta (14 gün) sonrasına randevu alabilirsiniz.");

        // --- AKTİF KOTA KONTROLÜ (Repository üzerinden güvenli çekim) ---
        var setting = await _systemSettingRepository.GetSettingsAsync();
        int maxAllowedMinutes = setting.MaxActiveReservationMinutes;

        var userReservations = await _reservationRepository.GetByUserIdAsync(userId);

        var activeTotalMinutes = userReservations
            .Where(r => r.Status != "Cancelled" && r.EndTime > DateTime.Now)
            .Sum(r => (r.EndTime - r.StartTime).TotalMinutes);

        int requestedRoundedMinutes = (int)Math.Ceiling(dto.EstimatedDurationInMinutes / 30.0) * 30;

        if (activeTotalMinutes + requestedRoundedMinutes > maxAllowedMinutes)
        {
            double remainingHours = (maxAllowedMinutes - activeTotalMinutes) / 60.0;
            throw new Exception($"Aynı anda en fazla {maxAllowedMinutes / 60} saatlik aktif randevu tutabilirsiniz. Şu an alabileceğiniz maksimum süre: {remainingHours:F1} saat.");
        }

        // --- 2. MAKİNE VE FİLAMENT KONTROLLERİ ---
        var machine = await _machineRepository.GetByIdAsync(dto.MachineId);
        if (machine == null || !machine.IsActive)
            throw new Exception("Seçilen makine bulunamadı veya şu an aktif değil.");

        var filament = await _filamentRepository.GetByIdAsync(dto.FilamentId);
        if (filament == null || filament.CurrentWeight < dto.ExpectedFilamentUsage)
            throw new Exception("Seçilen filament bulunamadı veya yeterli gramaj yok.");

        // --- 3. SÜRE HESAPLAMA VE ÇAKIŞMA KONTROLÜ ---
        DateTime calculatedEndTime = dto.StartTime.AddMinutes(requestedRoundedMinutes);

        TimeSpan startHour = dto.StartTime.TimeOfDay;
        TimeSpan endHour = calculatedEndTime.TimeOfDay;

        if (startHour < new TimeSpan(10, 0, 0) || endHour > new TimeSpan(17, 0, 0))
            throw new Exception($"Baskı süresi çalışma saatleri (10:00 - 17:00) dışına taşıyor. Yuvarlanmış bitiş saatiniz: {calculatedEndTime:HH:mm}");

        var dailyReservations = await _reservationRepository.GetByDateAsync(dto.StartTime.Date);
        bool isMachineBusy = dailyReservations.Any(r =>
            r.MachineId == dto.MachineId &&
            r.Status != "Cancelled" &&
            dto.StartTime < r.EndTime &&
            calculatedEndTime > r.StartTime);

        if (isMachineBusy)
            throw new Exception("Seçtiğiniz saat diliminde bu makine dolu. Lütfen başka bir saat veya makine seçin.");

        // --- 4. KAYIT İŞLEMLERİ ---
        var reservation = new Reservation
        {
            UserId = userId,
            MachineId = dto.MachineId,
            FilamentId = dto.FilamentId,
            StartTime = dto.StartTime,
            EndTime = calculatedEndTime,
            EstimatedDurationInMinutes = dto.EstimatedDurationInMinutes,
            ExpectedFilamentUsage = dto.ExpectedFilamentUsage,
            PrintType = dto.PrintType,
            Status = "Pending"
        };

        await _reservationRepository.AddAsync(reservation);

        filament.CurrentWeight -= dto.ExpectedFilamentUsage;
        await _filamentRepository.UpdateAsync(filament);

        var user = await _userRepository.GetByIdAsync(userId);
        return new ReservationDto
        {
            Id = reservation.Id,
            UserName = $"{user!.FirstName} {user.LastName}",
            MachineName = machine.Name,
            FilamentName = filament.Name,
            StartTime = reservation.StartTime,
            EndTime = reservation.EndTime,
            ExpectedFilamentUsage = reservation.ExpectedFilamentUsage,
            PrintType = reservation.PrintType,
            Status = reservation.Status
        };
    }

    public async Task CancelReservationAsync(int reservationId, int userId)
    {
        var res = await _reservationRepository.GetByIdAsync(reservationId);

        if (res == null || res.UserId != userId)
            throw new Exception("Randevu bulunamadı veya bu işlemi yapmaya yetkiniz yok.");

        if (res.Status == "Cancelled")
            throw new Exception("Bu randevu zaten iptal edilmiş.");

        if (res.StartTime <= DateTime.Now)
            throw new Exception("Geçmiş veya başlamış bir randevuyu iptal edemezsiniz.");

        res.Status = "Cancelled";
        await _reservationRepository.UpdateAsync(res);

        var filament = await _filamentRepository.GetByIdAsync(res.FilamentId);
        if (filament != null)
        {
            filament.CurrentWeight += res.ExpectedFilamentUsage;
            await _filamentRepository.UpdateAsync(filament);
        }
    }

    public async Task<List<ReservationDto>> GetDailyReservationsAsync(DateTime date)
    {
        var reservations = await _reservationRepository.GetByDateAsync(date);
        return reservations.Select(r => new ReservationDto
        {
            Id = r.Id,
            UserName = $"{r.User.FirstName} {r.User.LastName}",
            MachineName = r.Machine.Name,
            FilamentName = r.Filament.Name,
            StartTime = r.StartTime,
            EndTime = r.EndTime,
            ExpectedFilamentUsage = r.ExpectedFilamentUsage,
            PrintType = r.PrintType,
            Status = r.Status
        }).ToList();
    }

    public async Task<List<ReservationDto>> GetMyReservationsAsync(int userId)
    {
        var reservations = await _reservationRepository.GetByUserIdAsync(userId);
        return reservations.Select(r => new ReservationDto
        {
            Id = r.Id,
            UserName = "",
            MachineName = r.Machine.Name,
            FilamentName = r.Filament.Name,
            StartTime = r.StartTime,
            EndTime = r.EndTime,
            ExpectedFilamentUsage = r.ExpectedFilamentUsage,
            PrintType = r.PrintType,
            Status = r.Status
        }).ToList();
    }
}