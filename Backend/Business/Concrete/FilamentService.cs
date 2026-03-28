using Business.Abstract;
using DataAccess.Abstract;
using Entities;
using Entities.DTOs.FilamentDTOs;

namespace Business.Concrete;

public class FilamentService : IFilamentService
{
    private readonly IFilamentRepository _filamentRepository;

    public FilamentService(IFilamentRepository filamentRepository)
    {
        _filamentRepository = filamentRepository;
    }

    public async Task<List<FilamentDto>> GetAllFilamentsAsync()
    {
        var filaments = await _filamentRepository.GetAllAsync();
        return filaments.Select(f => new FilamentDto { Id = f.Id, Name = f.Name, Code = f.Code, FilamentPhoto = f.FilamentPhoto, CurrentWeight = f.CurrentWeight }).ToList();
    }

    public async Task<FilamentDto> AddFilamentAsync(FilamentCreateDto filamentDto)
    {
        var filament = new Filament { Name = filamentDto.Name, Code = filamentDto.Code, FilamentPhoto = filamentDto.FilamentPhoto, CurrentWeight = filamentDto.InitialWeight };
        await _filamentRepository.AddAsync(filament);
        return new FilamentDto { Id = filament.Id, Name = filament.Name, Code = filament.Code, FilamentPhoto = filament.FilamentPhoto, CurrentWeight = filament.CurrentWeight };
    }

    public async Task UpdateFilamentWeightAsync(FilamentUpdateWeightDto updateDto)
    {
        var filament = await _filamentRepository.GetByIdAsync(updateDto.Id);
        if (filament == null) throw new Exception("Filament bulunamadı.");

        filament.CurrentWeight = updateDto.NewWeight;
        await _filamentRepository.UpdateAsync(filament);
    }
    public async Task DeleteFilamentAsync(int id) => await _filamentRepository.DeleteAsync(id);
}