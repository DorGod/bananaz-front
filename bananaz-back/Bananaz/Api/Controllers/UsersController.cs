using ImageTagger.Api.Models;
using ImageTagger.Api.Models.Requests;
using ImageTagger.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace ImageTagger.Api.Controllers
{
    [ApiController]
    [Route("users")]
    public class UsersController : ControllerBase
    {
        private readonly AppState _state;

        public UsersController(AppState state)
        {
            _state = state;
        }

        // POST /users - Create user
        [HttpPost]
        public IActionResult CreateUser([FromBody] CreateUserRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Name))
            {
                return BadRequest(new { message = "Name is required." });
            }

            var exists = _state.Users.Any(u =>
                u.Name.Equals(request.Name, StringComparison.OrdinalIgnoreCase));

            if (exists)
            {
                return Conflict(new { message = "User already exists." });
            }

            var user = new User { Name = request.Name.Trim() };
            _state.Users.Add(user);

            return CreatedAtAction(nameof(GetUsers), new { }, user);
        }

        // GET /users - Protected (requires X-User-Name)
        [HttpGet]
        public IActionResult GetUsers()
        {
            var user = GetCurrentUser();
            if (user is null)
            {
                return Unauthorized(new { message = "Invalid or missing X-User-Name header." });
            }

            return Ok(_state.Users);
        }

        private User? GetCurrentUser()
        {
            var header = Request.Headers["X-User-Name"].FirstOrDefault();
            if (string.IsNullOrWhiteSpace(header))
                return null;

            return _state.Users.FirstOrDefault(u =>
                u.Name.Equals(header, StringComparison.OrdinalIgnoreCase));
        }
    }
}
