using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.DirectoryServices;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Authentication;
using System.IdentityModel.Tokens.Jwt;
using Revrec2.Extensions;

namespace Revrec2.Controllers
{
   // [Authorize]
    [Route("api/[controller]")]
    public class SampleDataController : Controller
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        // private readonly HttpContext httpContext;
        public SampleDataController(
            IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
           // httpContext = http;

        }

        [HttpGet]
        public async Task<ActionResult> TestNameAD()
        {
            try
            {

                var a = Request.GetUserID();
                var identity = _httpContextAccessor.HttpContext.User.Identity;
                var userName = _httpContextAccessor.HttpContext.User.Identity.Name;

                var name = userName;

                DirectorySearcher ds = new DirectorySearcher();

                ds.Filter = "(&(objectClass=user)(objectcategory=person)(name=" + name + "))";
                SearchResult userProperty = ds.FindOne();
                //      var userId = _httpContextAccessor.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier).Value;

                return Ok(await Task.FromResult(new TestHTTP
                {
                    Info = "This is a TEST",
                    UserName = name,
                    UserId = null,
                    Identity = null,
                    searchResult = userProperty
                }));
            }
            catch (Exception e)
            {
                return BadRequest(e);
            }

        }

        [HttpGet("decode")]
        public async Task<ActionResult> getUserId()
        {
            try
            {
                var accessToken = Request.Headers["Authorization"].ToString().Remove(0, 7);
                var handler = new JwtSecurityTokenHandler();
                var jsonToken = handler.ReadJwtToken(accessToken);
                var UserId = await Task.FromResult(jsonToken.Claims.First(claim => claim.Type == "nameid").Value);
                return Ok(new
                {
                    userId = UserId

                });
            }
            catch (Exception e)
            {
                return BadRequest(e);
            }

        }


        private static string[] Summaries = new[]
        {
            "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
        };

        [HttpGet("[action]")]
        public IEnumerable<WeatherForecast> WeatherForecasts()
        {
            var rng = new Random();
            var userName = _httpContextAccessor.HttpContext.User.Identity.Name;

            return Enumerable.Range(1, 5).Select(index => new WeatherForecast
            {
                DateFormatted = DateTime.Now.AddDays(index).ToString("d"),
                TemperatureC = rng.Next(-20, 55),
                Summary = Summaries[rng.Next(Summaries.Length)]
            });
        }

        public class WeatherForecast
        {
            public string DateFormatted { get; set; }
            public int TemperatureC { get; set; }
            public string Summary { get; set; }

            public int TemperatureF
            {
                get
                {
                    return 32 + (int)(TemperatureC / 0.5556);
                }
            }
        }

        public class TestHTTP
        {
            public string Info { get; set; }
            public string UserName { get; set; }

            public System.Security.Principal.IIdentity Identity { get; set; }
            public string UserId { get; set; }

            public SearchResult searchResult { get; set; }

        }
    }
}
