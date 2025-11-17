using ImageTagger.Api.Models.Requests;
using ImageTagger.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace ImageTagger.Api.Controllers
{
    [ApiController]
    [Route("login")]
    public class LoginController : ControllerBase
    {
        private readonly AppState _state;

        public LoginController(AppState state)
        {
            _state = state;
        }

        // POST /login - 200 if user exists, 401 otherwise
        [HttpPost]
        public IActionResult Login([FromBody] LoginRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Name))
            {
                return Unauthorized(new { message = "Invalid credentials." });
            }

            var user = _state.Users.FirstOrDefault(u =>
                u.Name.Equals(request.Name, StringComparison.OrdinalIgnoreCase));

            if (user is null)
            {
                return Unauthorized(new { message = "User not found." });
            }

            // No token/session. Frontend just stores this name
            // and sends it in X-User-Name for protected endpoints.
            return Ok(new { message = "Login successful." });
        }
    }
}
