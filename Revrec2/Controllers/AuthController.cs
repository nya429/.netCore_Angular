using AutoMapper;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Revrec2.Data;
using Revrec2.DTOs;
using Revrec2.Extensions;
using Revrec2.Models;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Threading.Tasks;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Revrec2.Services;
using System.Xml.Serialization;
using System.IO;
using System.Xml.XPath;
using System.Diagnostics;

namespace Revrec2.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : Controller
    {
        private readonly DataContext _context;
        private readonly IMapper _mapper;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ILogger _logger;
        private readonly IConfiguration _config;
        private IAuthorizationService _authorizationService;

        private const int PageIndex = Constants.PaginationParams.PageIndex;
        private const int PageSize = Constants.PaginationParams.PageSize;

        public AuthController(DataContext context,
           IMapper mapper,
           IHttpContextAccessor httpContextAccessor,
           ILogger<UserManagementController> logger,
           IConfiguration config,
           IAuthorizationService authorizationService)
        {
            _context = context;
            _mapper = mapper;
            _httpContextAccessor = httpContextAccessor;
            _logger = logger;
            _config = config;
            _authorizationService = authorizationService;
        }

        [HttpGet("login")]
        public async Task<IActionResult> InAppAuthenticate()
        {
            var response = new ResponseData<UserForAuthDto>();

            try
            {
                // 1 Win Auth, get UserAD from Claims
                var identity = _httpContextAccessor.HttpContext.User.Identity;
                var userName = _httpContextAccessor.HttpContext.User.Identity.Name;
                if (userName == null)
                {
                    response.Code = Constants.ResponseCode.Fail;
                    response.IsSuccess = false;
                    response.Message = "Windows Auth Failed";
                    return Unauthorized(response);
                }

                // 2 make a DB call. check if login UserAD matches the information stored in the DB     cca\your_name
                var userNameAD = userName.Split('\\')[1];
                var query = _context.Query<UserRecordPaged>().FromSql($"dbo.spGetUserByAD {userNameAD}");
                var userInfo = await query.AsNoTracking().FirstAsync();

                if (userInfo == null)
                {
                    response.Code = Constants.ResponseCode.Fail;
                    response.IsSuccess = false;
                    response.Message = "User Not Exist";
                    return Unauthorized(response);
                }

                // 3. Claim-based token information. This case includes => UserId, UserName, UserEmail, RoleBinary
                var claims = new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, userInfo.UserID.ToString()),
                    new Claim(ClaimTypes.Name, userInfo.UserFirstName + " " + userInfo.UserLastName),
                    new Claim(ClaimTypes.Email, userInfo.UserEmail),
                    new Claim(ClaimTypes.Role, _authorizationService.SetRoles(userInfo)),
                };

                var b = _authorizationService.IsAuthorized(_authorizationService.SetRoles(userInfo));

                // 4. Create a secuirty key with secret
                var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config.GetSection("AppSettings:Secret").Value));

                // 5. Create a secuirty Credential with key
                var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512Signature);

                // 6 payload part
                var toeknDescriptor = new SecurityTokenDescriptor
                {
                    Subject = new ClaimsIdentity(claims),
                    // Add one day
                    Expires = DateTime.Now.AddDays(1),
                    SigningCredentials = creds
                };

                var tokenHandler = new JwtSecurityTokenHandler();

                var token = tokenHandler.CreateToken(toeknDescriptor);
                response.Data = new UserForAuthDto()
                {
                    Token = tokenHandler.WriteToken(token),
                    UserInfo = userInfo
                };

                response.IsSuccess = true;
                response.Code = Constants.ResponseCode.Success;
                response.Message = nameof(response.Code);


                return Ok(response);
            }
            catch (Exception e)
            {
                response.Code = Constants.ResponseCode.Fail;
                response.IsSuccess = false;
                response.Message = "There was an internal error, please contact to technical support.";
                response.ErrorMessage = e.Message;
                _logger?.LogCritical("There was an error on '{0}' invocation: {1}", nameof(InAppAuthenticate), e);
                return BadRequest(response);
            }
        }


        [HttpGet("settings")]
        public async Task<IActionResult> GetAuthSettings()
        {
            var response = new ResponseData<object>();
            var xml = new System.Xml.Serialization.XmlSerializer(typeof(Configuration));
            //  XPathDocument document = new XPathDocument("books.xml");
            try
            {
                using (FileStream xmlStream = new FileStream("endpointsettings.xml", FileMode.Open))
                {
                    var result = xml.Deserialize(xmlStream);
                    response.Data = result;
                    response.IsSuccess = true;
                    response.Code = Constants.ResponseCode.Success;
                    response.Message = nameof(response.Code);
                }

                return Ok(await Task.FromResult(response));
            }
            catch (Exception e)
            {
                StackTrace stackTrace = new StackTrace();

                // Get calling method name
                var a = stackTrace.GetFrame(1);
                var b = stackTrace.GetFrame(1).GetMethod();
                var c = stackTrace.GetFrame(1).GetMethod().Name;

                Console.WriteLine(stackTrace.GetFrame(1).GetMethod().Name);
                response.Code = Constants.ResponseCode.Fail;
                response.IsSuccess = false;
                response.Message = "There was an internal error, please contact to technical support.";
                response.ErrorMessage = e.Message;
                _logger?.LogCritical("There was an error on '{0}' invocation: {1}", nameof(GetAuthSettings), e);
                return BadRequest(response);
            }
        }
    }
}