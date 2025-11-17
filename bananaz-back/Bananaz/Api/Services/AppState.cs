using System.Collections.Generic;
using ImageTagger.Api.Models;

namespace ImageTagger.Api.Services
{
    public class AppState
    {
        public List<User> Users { get; } = new();
        public List<ImageItem> Images { get; } = new();
        public List<ImageThread> Threads { get; } = new();
    }
}
