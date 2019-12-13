using Microsoft.AspNetCore.Http;
using Revrec2.DTOs;
using Revrec2.Extensions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Revrec2.Models
{
    public class SseClient
    {
        private readonly HttpResponse _response;
        private readonly int _userID;

        internal SseClient(HttpResponse response
                         ,int userID
            )
        {
            _response = response;
            _userID = userID;
        }

        protected Task WriteSseEventAsync(ServerSentEventDtos serverSentEvent)
        {
            return _response.WriteSseEventAsync(serverSentEvent);
        }

        public bool isUser(int userID) {
            return _userID == userID;
        }

        public Task SendSseEventAsync(string notification, bool alert)
        {
            return WriteSseEventAsync(new ServerSentEventDtos
            {
                Type = alert ? "alert" : null,
                Data = new List<string>(notification.Split(new string[] { "\r\n", "\n" }, StringSplitOptions.None))
            });
        }
    }
}
