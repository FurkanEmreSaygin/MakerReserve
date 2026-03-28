using Entities.DTOs.FilamentDTOs;

namespace Business.Abstract;

public interface IFilamentService
{
    Task<List<FilamentDto>> GetAllFilamentsAsync();
    Task<FilamentDto> AddFilamentAsync(FilamentCreateDto filamentDto);
    Task DeleteFilamentAsync(int id);
    Task UpdateFilamentWeightAsync(FilamentUpdateWeightDto updateDto); // Admin için elle gramaj girme
}