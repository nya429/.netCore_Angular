using Newtonsoft.Json;

namespace Revrec2.DTOs
{
    public interface IErrorInformation
    {
        string Message { get; set; }
        bool IsSuccess { get; set; }
        int? Code { get; set; }
        string ErrorMessage { get; set; }
    }
    public class ErrorInformation : IErrorInformation
    {
        public string Message { get; set; }
        public bool IsSuccess { get; set; }
        public int? Code { get; set; }
        public string ErrorMessage { get; set; }
        public override string ToString()
        {
            return JsonConvert.SerializeObject(this);
        }
    }
}
