using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Revrec2.Models;
using Revrec2.Services;

namespace Revrec2
{
    public class SseMiddleWare
    {
        private readonly RequestDelegate _next;
        private readonly SseService _sseService;

        public SseMiddleWare(RequestDelegate next, SseService sseService)
        { 
            _sseService = sseService;
            _next = next;
        }

        // Test subscribe
        public Task Invoke(HttpContext context)
        {
            if (context.Request.Headers["Accept"] == "text/event-stream")
            {
                context.Response.ContentType = "text/event-stream";
                context.Response.Body.Flush();

                SseClient client = new SseClient(context.Response, 1);
                Guid clientId = _sseService.AddClient(client);

                context.RequestAborted.WaitHandle.WaitOne();

                _sseService.RemoveClient(clientId);

                return Task.FromResult(true);
            }
            else
            {
                return _next(context);
            }
        }
    }

    // Extension method used to add the middleware to the HTTP request pipeline.
    public static class MiddlewareExtensions
    {
        public static IApplicationBuilder UseSseMiddleWare(this IApplicationBuilder builder)
        {
            return builder.UseMiddleware<SseMiddleWare>();
        }
    }
}
