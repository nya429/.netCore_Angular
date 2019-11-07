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

namespace Revrec2.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserManagementController : Controller
    {
        private readonly DataContext _context;
        private readonly IMapper _mapper;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ILogger _logger;
        private readonly IConfiguration _config;

        private const int PageIndex = Constants.PaginationParams.PageIndex;
        private const int PageSize = Constants.PaginationParams.PageSize;

        public UserManagementController(DataContext context,
           IMapper mapper,
           IHttpContextAccessor httpContextAccessor,
           ILogger<UserManagementController> logger,
           IConfiguration config)
        {
            _context = context;
            _mapper = mapper;
            _httpContextAccessor = httpContextAccessor;
            _logger = logger;
            _config = config;
        }

        public IActionResult Index()
        {
            return View();
        }

        [HttpPost("CreateNewUser")]
        public async Task<ActionResult> CreateNewUserByAsync([FromBody] UsersForCreateDto request)
        {
            int eventUserID = Request.GetUserID();

            SqlParameter[] parameters =
                   {

                    new SqlParameter("@eventUserID", eventUserID),
                    new SqlParameter("@UserNameAD",string.IsNullOrEmpty(request.UserNameAD)?"":request.UserNameAD),
                    new SqlParameter("@UserEmail",string.IsNullOrEmpty(request.UserEmail)?"":request.UserEmail),
                    new SqlParameter("@UserFirstName",string.IsNullOrEmpty(request.UserFirstName)?"":request.UserFirstName),
                    new SqlParameter("@UserLastName",string.IsNullOrEmpty(request.UserLastName)?"":request.UserLastName),
                    new SqlParameter("@RoleAdministrator", request.RoleAdministrator),
                    new SqlParameter("@RoleHelpdesk", request.RoleHelpdesk),
                    new SqlParameter("@RoleSupervisor", request.RoleSupervisor),
                    new SqlParameter("@RoleSpecialist", request.RoleSpecialist),
                    new SqlParameter("@ActiveFlag", request.ActiveFlag),
                    new SqlParameter() {
                       ParameterName = "@NewIdentity",
                       SqlDbType = SqlDbType.Int,
                       Direction = System.Data.ParameterDirection.Output},
                    new SqlParameter() {
                       ParameterName = "@ReturnCode",
                       SqlDbType = SqlDbType.Int,
                       Direction = System.Data.ParameterDirection.Output},
                };

            var response = new ResponseData<int?>();
            var result = await _context.Database.ExecuteSqlCommandAsync("EXEC dbo.spCreateUser @eventUserID, @UserNameAD, @UserEmail, @UserFirstName, @UserLastName, @RoleAdministrator, @RoleHelpdesk, @RoleSupervisor, @RoleSpecialist, @ActiveFlag, @NewIdentity OUT, @ReturnCode OUT", parameters);

            response.IsSuccess = true;
            response.Data = parameters.FirstOrDefault(p => p.ParameterName.Equals("@NewIdentity")).Value.toInt();
            response.Code = parameters.FirstOrDefault(p => p.ParameterName.Equals("@ReturnCode")).Value.toInt();
            response.Message = nameof(response.Code);
            return Ok(response);
        }

        [HttpPatch("UpdateUserByUserId/{userID}")]
        public async Task<ActionResult> UpdateUserByUserIdAsync(int userID, [FromBody] UsersForCreateDto request)
        {
            int eventUserID = Request.GetUserID();

            SqlParameter[] parameters =
                   {
                    new SqlParameter("@eventUserID", eventUserID),
                    new SqlParameter("@UserID", userID),
                    new SqlParameter("@UserNameAD",string.IsNullOrEmpty(request.UserNameAD)?"":request.UserNameAD),
                    new SqlParameter("@UserEmail",string.IsNullOrEmpty(request.UserEmail)?"":request.UserEmail),
                    new SqlParameter("@UserFirstName",string.IsNullOrEmpty(request.UserFirstName)?"":request.UserFirstName),
                    new SqlParameter("@UserLastName",string.IsNullOrEmpty(request.UserLastName)?"":request.UserLastName),
                    new SqlParameter("@RoleAdministrator", request.RoleAdministrator),
                    new SqlParameter("@RoleHelpdesk", request.RoleHelpdesk),
                    new SqlParameter("@RoleSupervisor", request.RoleSupervisor),
                    new SqlParameter("@RoleSpecialist", request.RoleSpecialist),
                    new SqlParameter("@ActiveFlag", request.ActiveFlag),
                    new SqlParameter() {
                       ParameterName = "@ReturnCode",
                       SqlDbType = SqlDbType.Int,
                       Direction = System.Data.ParameterDirection.Output},
                    };

            var response = new Response();
            var result = await _context.Database.ExecuteSqlCommandAsync("EXEC dbo.spUpdateUser @eventUserID,@UserID,  @UserNameAD, @UserEmail, @UserFirstName, @UserLastName, @RoleAdministrator, @RoleHelpdesk, @RoleSupervisor, @RoleSpecialist, @ActiveFlag, @ReturnCode OUT", parameters);

            response.IsSuccess = true;
            response.Code = parameters.FirstOrDefault(p => p.ParameterName.Equals("@ReturnCode")).Value.toInt();
            response.Message = "Success";

            return Ok(response);
        }

        [HttpPost("GetUsersList")]
        public async Task<ActionResult> GetUsersListByConAsync([FromBody] UsersListRequestDto request)
        {
            string userNameAD = string.IsNullOrEmpty(request.UserNameAD) ? "" : request.UserNameAD;
            int pageSize = request.PageSize.IsNullOrValue(0) ? PageSize : request.PageSize.Value;
            int pageIndex = request.PageIndex.IsNullOrValue(0) ? PageIndex : request.PageIndex.Value;
            string sortBy = String.IsNullOrEmpty(request.SortBy) ? "" : request.SortBy;
            int orderBy = request.OrderBy.GetValueOrDefault(0);

            SqlParameter[] parameters =
                   {
                    new SqlParameter("@UserID",!(request.UserID.HasValue) ? DBNull.Value : (object)request.UserID),
                    new SqlParameter("@UserNameAD",userNameAD),
                    new SqlParameter("@pageIndex", pageIndex),
                    new SqlParameter("@pageSize", pageSize),
                    new SqlParameter("@sortBy", sortBy),
                    new SqlParameter("@orderBy", orderBy)
                    };

            var response = new ResponseData<ResponseDataListPaged<UsersListDto>>
            {
                IsSuccess = true,
                Code = Constants.ResponseCode.Success,
                Message = "Success",

            };

            var query = _context.Query<UsersListPaged>().FromSql($"dbo.spGetUsers @UserID, @UserNameAD, @pageIndex, @pageSize, @sortBy, @orderBy", parameters);
            var usersList = await query.AsNoTracking().ToArrayAsync();

            response.Data = new ResponseDataListPaged<UsersListDto>
            {
                Count = usersList.Any() ? usersList[0].ResultCount : 0,
                List = _mapper.Map<IEnumerable<UsersListDto>>(usersList),
                PageSize = pageSize,
                PageIndex = pageIndex,
                SortBy = sortBy,
                OrderBy = orderBy
            };

            return Ok(response);
        }

        [HttpGet("GetUserRecordById/{userId}")]
        public async Task<ActionResult> GetUserRecordByIdByConAsync(int userId)
        {
            int userID = userId;
            int eventUserID = 1;

            var response = new ResponseData<UserRecordPaged>
            {
                IsSuccess = true,
                Code = Constants.ResponseCode.Success,
                Message = "Success",
            };

            var query = _context.Query<UserRecordPaged>().FromSql($"dbo.spGetUserRecord {eventUserID},{userID}");
            var userInfo = await query.AsNoTracking().FirstAsync();
            response.Data = userInfo;
            return Ok(response);
        }

        [HttpGet("GetUserDropDownOptions")]
        public async Task<ActionResult> GetUserDropDownOptionsByConAsync()
        {
            int eventUserID = Request.GetUserID();

            var response = new ResponseData<ResponseDataList<UsersForDropDown>>
            {
                IsSuccess = true,
                Code = Constants.ResponseCode.Success,
                Message = "Success",
            };

            var query = _context.Query<UsersForDropDown>().FromSql($"dbo.spGetUserDropDown {eventUserID}");
            var usersList = await query.AsNoTracking().ToArrayAsync();

            response.Data = new ResponseDataList<UsersForDropDown>
            {
                List = usersList
            };
            return Ok(response);
        }

        [HttpGet("GetUserRecordByADName/{userNameAd}")]
        public async Task<ActionResult> GetUserRecordByADNameByConAsync(string userNameAd)
        {
            string userNameAD = userNameAd;

            var response = new ResponseData<UserRecordPaged>
            {
                IsSuccess = true,
                Code = Constants.ResponseCode.Success,
                Message = "Success",
            };

            var query = _context.Query<UserRecordPaged>().FromSql($"dbo.spGetUserByAD {userNameAD}");
            var userInfo = await query.AsNoTracking().FirstAsync();
            response.Data = userInfo;
            return Ok(response);
        }
    }
}