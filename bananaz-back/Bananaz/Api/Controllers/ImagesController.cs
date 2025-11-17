using System.Security.Cryptography;
using Ganss.Xss;
using ImageTagger.Api.Models;
using ImageTagger.Api.Models.Requests;
using ImageTagger.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace ImageTagger.Api.Controllers
{
    [ApiController]
    [Route("images")]
    public class ImagesController : ControllerBase
    {
        private readonly AppState _state;
        private readonly HtmlSanitizer _sanitizer;

        public ImagesController(AppState state, HtmlSanitizer sanitizer)
        {
            _state = state;
            _sanitizer = sanitizer;
        }

        // POST /images - create new random image
        [HttpPost]
        public IActionResult CreateImage()
        {
            var user = GetCurrentUser();
            if (user is null)
            {
                return Unauthorized(new { message = "Invalid or missing X-User-Name header." });
            }

            var id = Ulid.NewUlid().ToString();

            // random picsum id
            var picsumId = RandomNumberGenerator.GetInt32(1, 1000);
            var url = $"https://picsum.photos/id/{picsumId}/800/600";

            var image = new ImageItem
            {
                Id = id,
                Url = url,
                CreatedByName = user.Name
            };

            _state.Images.Add(image);

            return Ok(new { id = image.Id, url = image.Url });
        }

        // GET /images - list all images
        [HttpGet]
        public IActionResult GetImages()
        {
            var user = GetCurrentUser();
            if (user is null)
            {
                return Unauthorized(new { message = "Invalid or missing X-User-Name header." });
            }

            return Ok(_state.Images);
        }

        // POST /images/{id}/threads - add pin/comment
        [HttpPost("{id}/threads")]
        public IActionResult CreateThread(string id, [FromBody] CreateThreadRequest request)
        {
            var user = GetCurrentUser();
            if (user is null)
            {
                return Unauthorized(new { message = "Invalid or missing X-User-Name header." });
            }

            var image = _state.Images.FirstOrDefault(i => i.Id == id);
            if (image is null)
            {
                return NotFound(new { message = "Image not found." });
            }

            var cleanComment = _sanitizer.Sanitize(request.Comment ?? string.Empty);

            var thread = new ImageThread
            {
                Id = Ulid.NewUlid().ToString(),
                ImageId = image.Id,
                X = request.X,
                Y = request.Y,
                Comment = cleanComment,
                CreatedByName = user.Name
            };

            _state.Threads.Add(thread);

            return Ok(thread);
        }

        // GET /images/{id}/threads - list pins for an image
        [HttpGet("{id}/threads")]
        public IActionResult GetThreadsForImage(string id)
        {
            var user = GetCurrentUser();
            if (user is null)
            {
                return Unauthorized(new { message = "Invalid or missing X-User-Name header." });
            }

            var image = _state.Images.FirstOrDefault(i => i.Id == id);
            if (image is null)
            {
                return NotFound(new { message = "Image not found." });
            }

            var threads = _state.Threads.Where(t => t.ImageId == id).ToList();
            return Ok(threads);
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
