using Business.Abstract;
using Business.Concrete;
using DataAccess;
using DataAccess.Abstract;
using DataAccess.Concrete;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// 1. VERİTABANI BAĞLANTISI
builder.Services.AddDbContext<PrinterDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Repositories
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IMachineRepository, MachineRepository>();
builder.Services.AddScoped<IFilamentRepository, FilamentRepository>();
builder.Services.AddScoped<IReservationRepository, ReservationRepository>();
builder.Services.AddScoped<ISystemSettingRepository, SystemSettingRepository>();

// Services
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IMachineService, MachineService>();
builder.Services.AddScoped<IFilamentService, FilamentService>();
builder.Services.AddScoped<IReservationService, ReservationService>();
builder.Services.AddScoped<IEmailService, EmailService>();

builder.Services.AddControllers();

// --- 🔓 CORS AYARLARI (HEPSİ BURADA) ---
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAllOrigins",
        policy =>
        {
            policy.WithOrigins(
                    "http://localhost:5173",
                    "https://maker-reserve.vercel.app",
                    "https://maker-reserve-puzdoo1cu-furkanemresaygins-projects.vercel.app"
                  )
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .SetIsOriginAllowedToAllowWildcardSubdomains();
        });
});

// 4. JWT KİMLİK DOĞRULAMA
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!))
        };
    });

var app = builder.Build();

// --- 🛡️ MIDDLEWARE SIRALAMASI (ÇOK KRİTİK!) ---

// 1. Hata sayfasını ve HTTPS yönlendirmeyi en başa al
app.UseHttpsRedirection();

// 2. CORS'u mutlaka Authentication ve Authorization'dan ÖNCE çalıştır!
app.UseCors("AllowAllOrigins");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();