namespace ImageTagger.Api.Models.Requests
{
    public class CreateThreadRequest
    {
        public double X { get; set; }
        public double Y { get; set; }
        public string Comment { get; set; } = string.Empty;
    }
}
