using Microsoft.Extensions.Hosting;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Revrec2.Services
{
    public class HeartbeatService : BackgroundService
    {

        private const string HEARTBEAT_MESSAGE_FORMAT = "Heartbeat at ({0} UTC)";

        private readonly SseService _sseService;
   
        public HeartbeatService(SseService sseService)
        {
            _sseService = sseService;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                await _sseService.SendEventsAsync(String.Format(HEARTBEAT_MESSAGE_FORMAT, DateTime.UtcNow), false);

                await Task.Delay(TimeSpan.FromSeconds(5), stoppingToken);
            }
        }
    }
}
