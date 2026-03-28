using Entities;

namespace DataAccess.Abstract;

public interface ISystemSettingRepository
{
    Task<SystemSetting> GetSettingsAsync();
}