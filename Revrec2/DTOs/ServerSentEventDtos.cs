using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Revrec2.DTOs
{
    public class ServerSentEventDtos
    {
        public string Id { get; set; }
        public string Type { get; set; }
        public IList<string> Data { get; set; }
    }
}
