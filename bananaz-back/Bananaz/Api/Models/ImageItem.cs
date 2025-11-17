namespace ImageTagger.Api.Models
{
    public class ImageItem
    {
        public string Id { get; set; } = string.Empty;   // ULID
        public string Url { get; set; } = string.Empty;  // https://picsum.photos/id/...
        public string CreatedByName { get; set; } = string.Empty;
    }
}
