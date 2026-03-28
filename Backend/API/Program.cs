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

builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IMachineRepository, MachineRepository>();
builder.Services.AddScoped<IFilamentRepository, FilamentRepository>();
builder.Services.AddScoped<IReservationRepository, ReservationRepository>();
// Servislerimiz
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IMachineService, MachineService>();
builder.Services.AddScoped<IFilamentService, FilamentService>();
builder.Services.AddScoped<IReservationService, ReservationService>();
builder.Services.AddScoped<ISystemSettingRepository, SystemSettingRepository>();
builder.Services.AddScoped<IEmailService, EmailService>();

// 3. CONTROLLER ENTEGRASYONU
builder.Services.AddControllers();


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

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:5173") // React'ın çalıştığı adres
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});


var app = builder.Build();

// 5. ARA YAZILIMLAR (Middleware) VE YÖNLENDİRMELER
app.UseHttpsRedirection();

app.UseCors("AllowReactApp");
// Kimlik Doğrulama 
app.UseAuthentication();
app.UseAuthorization();

// Controller'ların rotalarını (Endpoint'leri) eşleştirir (Örn: /api/auth)
app.MapControllers();

app.Run();