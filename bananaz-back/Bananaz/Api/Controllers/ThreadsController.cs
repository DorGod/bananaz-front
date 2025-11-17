using ImageTagger.Api.Models;
using ImageTagger.Api.Models.Requests;
using ImageTagger.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace ImageTagger.Api.Controllers
{
    [ApiController]
    [Route("threads")]
    public class ThreadsController : ControllerBase
    {
        private readonly AppState _state;

        public ThreadsController(AppState state)
        {
            _state = state;
        }

        // DELETE /threads/{id} - only creator can delete
        [HttpDelete("{id}")]
        public IActionResult DeleteThread(string id)
        {
            var user = GetCurrentUser();
            if (user is null)
            {
                return Unauthorized(new { message = "Invalid or missing X-User-Name header." });
            }

            var thread = _state.Threads.FirstOrDefault(t => t.Id == id);
            if (thread is null)
            {
                return NotFound(new { message = "Thread not found." });
            }

            if (!thread.CreatedByName.Equals(user.Name, StringComparison.OrdinalIgnoreCase))
            {
                return Forbid();
            }

            _state.Threads.Remove(thread);
            return NoContent();
        }

        // PATCH /threads/{id} - update pin position (creator only)
        [HttpPatch("{id}")]
        public IActionResult UpdateThreadPosition(
            string id,
            [FromBody] UpdateThreadPositionRequest request)
        {
            var user = GetCurrentUser();
            if (user is null)
            {
                return Unauthorized(new { message = "Invalid or missing X-User-Name header." });
            }

            var thread = _state.Threads.FirstOrDefault(t => t.Id == id);
            if (thread is null)
            {
                return NotFound(new { message = "Thread not found." });
            }

            if (!thread.CreatedByName.Equals(user.Name, StringComparison.OrdinalIgnoreCase))
            {
                return Forbid();
            }

            thread.X = request.X;
            thread.Y = request.Y;

            return Ok(thread);
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
