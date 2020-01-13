using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Revrec2.Data;
using Revrec2.Extensions;
using Revrec2.Models;
using Revrec2.Services;

namespace Revrec2.Controllers
{

    [Route("api/sse")]
    [ApiController]
    public class NotificationController : Controller
    {
        private readonly DataContext _context;
        private readonly IMapper _mapper;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ILogger _logger;
        private readonly SseService _sseService;
        private readonly NotificationService _notificationService;

        public NotificationController(DataContext context,
            IMapper mapper,
            IHttpContextAccessor httpContextAccessor,
            ILogger<NotificationController> logger,
            SseService sseService,
            NotificationService notificationService)
        {
            _context = context;
            _mapper = mapper;
            _httpContextAccessor = httpContextAccessor;
            _logger = logger;
            _sseService = sseService;
            _notificationService = notificationService;
        }


        public async Task TestGet()
        {
            var response = Response;

            // Sse response header
            response.Headers.Add("Content-Type", "text/event-stream");

            for (var i = 0; true; ++i)
            {
                // Data
                await response
                    .WriteAsync($"data: Controller {i} at {DateTime.Now}\r\r");


                response.Body.Flush();
                await Task.Delay(5 * 1000);
            }
        }

        [HttpGet("Subscribe/{eventUserID}")]
        public async Task SubscribeClient(int eventUserID)
        {
            // int eventUserID = Request.GetUserID();
            // int eventUserID = 1;

            _httpContextAccessor.HttpContext.Response.ContentType = "text/event-stream";
            _httpContextAccessor.HttpContext.Response.Body.Flush();

            SseClient client = new SseClient(_httpContextAccessor.HttpContext.Response, eventUserID);
            Guid clientId = _sseService.AddClient(client);

            _httpContextAccessor.HttpContext.RequestAborted.WaitHandle.WaitOne();

            _sseService.RemoveClient(clientId);


            await Task.FromResult(true);
        }

        [HttpGet("reset")]
        public async Task<ActionResult> resetDiscrepancyAssignmentRead()
        {
            // int eventUserID = 1;
            int eventUserID = Request.GetUserID();
            await Task.Run(() => _notificationService.resetNotificationByUserIdAsync(eventUserID));
            return Ok();
        }

        [HttpGet("discrepancyAssignmentUnread/{stringGuid}")]
        public async Task<ActionResult> discrepancyAssignmentRead(string stringGuid)
        {
            // int eventUserID = 1;
            int eventUserID = Request.GetUserID();
            await Task.Run(() => _notificationService.getNotification(eventUserID, stringGuid));
            return Ok();
        }
        //
    }
}