using System;
using System.Collections.Generic;
using System.Linq;
using System.Data.SqlClient;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using AutoMapper;
using Revrec2.Extensions;
using Revrec2.Models;
using Revrec2.Data;
using Revrec2.DTOs;
using System.Data;

namespace Revrec2.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DiscrepancyStatusController : Controller
    {

        private readonly DataContext _context;
        private readonly IMapper _mapper;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ILogger _logger;

        private const int PageIndex = Constants.PaginationParams.PageIndex;
        private const int PageSize = Constants.PaginationParams.PageSize;

        public DiscrepancyStatusController(DataContext context,
           IMapper mapper,
           IHttpContextAccessor httpContextAccessor,
           ILogger<DiscrepancyStatusController> logger)
        {
            _context = context;
            _mapper = mapper;
            _httpContextAccessor = httpContextAccessor;
            _logger = logger;
        }
        public IActionResult Index()
        {
            return View();
        }

        [HttpPost("list")]
        public async Task<ActionResult> GetDiscrepancyStatusesListByConAsync([FromBody] DiscrepancyStatusesListRequestDto request)
        {
            string discrepancyStatus = String.IsNullOrEmpty(request.DiscrepancyStatus) ? "" : request.DiscrepancyStatus;
            int? discrepancyCategoryID = request.DiscrepancyCategoryID;
            int? discrepancyStatusType = request.DiscrepancyStatusType;
            int pageSize = request.PageSize.IsNullOrValue(0) ? PageSize : request.PageSize.Value;
            int pageIndex = request.PageIndex.IsNullOrValue(0) ? PageIndex : request.PageIndex.Value;
            string sortBy = String.IsNullOrEmpty(request.SortBy) ? "" : request.SortBy;
            int orderBy = request.OrderBy.GetValueOrDefault(0);

            // Temprarioly set EventUserId at Local Env
            //int eventUserID = 1;
            int eventUserID = Request.GetUserID();

            var response = new ResponseData<ResponseDataListPaged<DiscrepancyStatusesForListDto>>
            {
                IsSuccess = true,
                Code = Constants.ResponseCode.Success,
                Message = "Success",
            };

            try
            {
                var query = _context.Query<DiscrepancyStatusesPaged>().FromSql($"dbo.spGetDiscrepancyStatus {eventUserID}, {discrepancyStatus}, {discrepancyCategoryID}, {discrepancyStatusType}, {pageIndex}, {pageSize}, {sortBy}, {orderBy}");
                var discrepancyStatusesList = await query.AsNoTracking().ToArrayAsync();

                response.Data = new ResponseDataListPaged<DiscrepancyStatusesForListDto>
                {
                    Count = discrepancyStatusesList.Any() ? discrepancyStatusesList[0].ResultCount : 0,
                    List = _mapper.Map<IEnumerable<DiscrepancyStatusesForListDto>>(discrepancyStatusesList),
                    PageSize = pageSize,
                    PageIndex = pageIndex,
                    SortBy = sortBy,
                    OrderBy = orderBy
                };

                return Ok(response);
            }
            catch (Exception e)
            {
                response.IsSuccess = false;
                response.Code = Constants.ResponseCode.Fail;
                response.Message = "There was an internal error, please contact to technical support.";
                response.ErrorMessage = e.Message;
                _logger?.LogCritical("There was an error on '{0}' invocation: {1}", nameof(GetDiscrepancyStatusesListByConAsync), e);
                return BadRequest(response);
            }
        }



        [HttpPost]
        public async Task<ActionResult> CreateDiscrepancyStatusAsync([FromBody] DiscrepancyStatusesForCreateDto request)
        {
            // Temprarioly set EventUserId at Local Env
            //int eventUserID = 1;
            int eventUserID = Request.GetUserID();

            SqlParameter[] parameters =
                   {

                    new SqlParameter("@eventUserID", eventUserID),
                    new SqlParameter("@DiscrepancyStatus", request.DiscrepancyStatus),
                    new SqlParameter("@DiscrepancyStatusDescription  ", request.DiscrepancyStatusDescription),
                    new SqlParameter("@DiscrepancyCategoryID ", request.DiscrepancyCategoryID),
                    new SqlParameter("@ActiveFlag ", request.ActiveFlag),
                    new SqlParameter() {
                       ParameterName = "@NewIdentity",
                       SqlDbType = SqlDbType.Int,
                       Direction = System.Data.ParameterDirection.Output},
                    new SqlParameter() {
                       ParameterName = "@ReturnCode",
                       SqlDbType = SqlDbType.Int,
                       Direction = System.Data.ParameterDirection.Output},

                };
            //            select @NewIdentity as NewIdentity --Return @NewIdentity

            // Return @ReturnCode
            var response = new ResponseData<int?>();

            try
            {
                var result = await _context.Database.ExecuteSqlCommandAsync("EXEC dbo.spCreateDiscrepancyStatus @eventUserID, @DiscrepancyStatus,  @DiscrepancyStatusDescription, @DiscrepancyCategoryID, @ActiveFlag, @NewIdentity OUT, @ReturnCode OUT", parameters);

                response.IsSuccess = true;
                response.Data = parameters.FirstOrDefault(p => p.ParameterName.Equals("@NewIdentity")).Value.toInt();
                response.Code = parameters.FirstOrDefault(p => p.ParameterName.Equals("@ReturnCode")).Value.toInt();
                response.Message = nameof(response.Code);
                return Ok(response);
            }
            catch (Exception e)
            {
                response.Code = Constants.ResponseCode.Fail;
                response.IsSuccess = false;
                response.Message = "There was an internal error, please contact to technical support.";
                response.ErrorMessage = e.Message;
                _logger?.LogCritical("There was an error on '{0}' invocation: {1}", nameof(CreateDiscrepancyStatusAsync), e);
                return BadRequest(response);
            }
        }

        [HttpPatch("{discrepancyStatusID}")]
        public async Task<ActionResult> UpdateDiscrepancyStatusByIDAsync(int discrepancyStatusID, [FromBody] DiscrepancyStatusesForCreateDto request)
        {
            // Temprarioly set EventUserId at Local Env
            //int eventUserID = 1;
            int eventUserID = Request.GetUserID();

            SqlParameter[] parameters =
                   {
                    new SqlParameter("@eventUserID", eventUserID),
                     new SqlParameter("@DiscrepancyStatusID", discrepancyStatusID),
                    new SqlParameter("@DiscrepancyStatus", request.DiscrepancyStatus),
                    new SqlParameter("@DiscrepancyCategoryID ", request.DiscrepancyCategoryID),
                    new SqlParameter("@DiscrepancyStatusDescription  ", request.DiscrepancyStatusDescription),
                    new SqlParameter("@ActiveFlag ", request.ActiveFlag),
                    new SqlParameter() {
                       ParameterName = "@ReturnCode",
                       SqlDbType = SqlDbType.Int,
                       Direction = System.Data.ParameterDirection.Output},
                    };

            var response = new Response();

            try
            {
                var result = await _context.Database.ExecuteSqlCommandAsync("EXEC dbo.spUpdateDiscrepancyStatus @eventUserID, @DiscrepancyStatusID, @DiscrepancyStatus, @DiscrepancyCategoryID,  @DiscrepancyStatusDescription,  @ActiveFlag, @ReturnCode OUT", parameters);

                response.IsSuccess = true;
                response.Code = parameters.FirstOrDefault(p => p.ParameterName.Equals("@ReturnCode")).Value.toInt();
                response.Message = "Success";

                return Ok(response);
            }
            catch (Exception e)
            {
                response.Code = Constants.ResponseCode.Fail;
                response.Message = "There was an internal error, please contact to technical support.";
                response.ErrorMessage = e.Message;
                _logger?.LogCritical("There was an error on '{0}' invocation: {1}", nameof(UpdateDiscrepancyStatusByIDAsync), e);
                return BadRequest(response);
            }
        }

        [HttpGet("options")]
        public async Task<ActionResult> GetDiscrepancyStatusOptions()
        {

            // int eventUserID = 1;

            var response = new ResponseData<ResponseDataList<DiscrepancyStatusOption>>
            {
                IsSuccess = true,
                Code = Constants.ResponseCode.Success,
                Message = "Success",
            };

            try
            {
                var query = _context.Query<DiscrepancyStatusOption>().FromSql($"dbo.spGetDiscrepancyStatusDropDown");
                var discrepancyStatusOptions = await query.AsNoTracking().ToArrayAsync();

                response.Data = new ResponseDataList<DiscrepancyStatusOption>
                {
                    List = discrepancyStatusOptions
                };
                return Ok(response);

            }
            catch (Exception e)
            {
                response.IsSuccess = false;
                response.Code = Constants.ResponseCode.Fail;
                response.Message = "There was an internal error, please contact to technical support.";
                response.ErrorMessage = e.Message;
                _logger?.LogCritical("There was an error on '{0}' invocation: {1}", nameof(GetDiscrepancyStatusOptions), e);
                return BadRequest(response);
            }
        }
    }
}
