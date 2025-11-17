using Ganss.Xss;
using ImageTagger.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddSingleton<AppState>();       // in-memory "DB"
builder.Services.AddSingleton<HtmlSanitizer>();  // comment sanitizer

builder.Services.AddControllers();

// CORS for your React app (Vite default is http://localhost:5173)
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy
            .WithOrigins("http://localhost:5173")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// If HTTPS redirection annoys you during dev, you can comment this out
//app.UseHttpsRedirection();

app.UseCors();

app.UseAuthorization();

app.MapControllers();

app.Run();
