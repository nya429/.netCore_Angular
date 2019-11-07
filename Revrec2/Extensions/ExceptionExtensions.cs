using Revrec2.Models;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Http;
using System.Net;
using Revrec2.DTOs;

namespace Revrec2.Extensions
{
    public static class ExceptionExtensions
    {
        public static void ConfigureExceptionHandler(this IApplicationBuilder applicationBuilder, ILogger logger)
        {
            applicationBuilder.UseExceptionHandler(appError=>
            {
                appError.Run(async context =>
                {
                    context.Response.ContentType = "application/json";
                    var contextFeaturePath = context.Features.Get<IExceptionHandlerPathFeature>();                    
                    if (contextFeaturePath != null)
                    {
                        logger.LogError($"Something went wrong: {contextFeaturePath.Error}");
                        logger.LogCritical("There was an error on the path '{0}.' Error Message: {1}", contextFeaturePath.Path, contextFeaturePath.Error);

                        // Token Not Found Exception
                        if (contextFeaturePath.Error.GetType().Name.Contains("KeyNotFound"))
                            context.Response.StatusCode = 401;
                        // Sql Related Exception
                        if (contextFeaturePath.Error.GetType().Name.Contains("SqlException"))
                            context.Response.StatusCode = 400;

                        await context.Response.WriteAsync(new ErrorInformation()
                        {
                            Message = "There was an internal error, please contact technical support.",
                            IsSuccess = false,
                            Code = Constants.ResponseCode.Fail,
                            ErrorMessage = contextFeaturePath.Error.Message
                        }.ToString()) ;
                    }
                });
            });
        }
    }
}
