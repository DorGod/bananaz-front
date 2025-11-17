namespace ImageTagger.Api.Models
{
    public class ImageThread
    {
        public string Id { get; set; } = string.Empty;      // ULID
        public string ImageId { get; set; } = string.Empty; // FK to ImageItem.Id
        public double X { get; set; }                       // we'll store normalized 0–1 or px, up to you
        public double Y { get; set; }
        public string Comment { get; set; } = string.Empty;
        public string CreatedByName { get; set; } = string.Empty;
    }
}
