using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Revrec2.Data;
using Revrec2.DTOs;
using Revrec2.Extensions;
using static Revrec2.Models.Report;

namespace Revrec2.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReportController : Controller
    {
        private readonly DataContext _context;
        private readonly IMapper _mapper;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ILogger _logger;
        private const int PageIndex = Constants.PaginationParams.PageIndex;
        private const int PageSize = Constants.PaginationParams.PageSize;
        public ReportController(DataContext context,
           IMapper mapper,
           IHttpContextAccessor httpContextAccessor,
           ILogger<ReportController> logger)
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

        [HttpPost("operational")]
        public async Task<ActionResult> GetReportOperationalList([FromBody] ReportRequestDto request)
        {
            int eventUserID = Request.GetUserID();
            SqlParameter[] parameters =
            {
           
               new SqlParameter("@UserID", eventUserID),
               new SqlParameter("@StartDate", !(request.StartDate.HasValue) ? DBNull.Value : (object)request.StartDate),
               new SqlParameter("@EndDate", !(request.EndDate.HasValue) ? DBNull.Value : (object)request.EndDate),
            };

            var response = new ResponseData<ResponseDataList<ReportOperationlDto>>
            {
                IsSuccess = true,
                Code = Constants.ResponseCode.Success,
                Message = "Success",
            };

            var query = _context.Query<ReportOperational>().FromSql($"dbo.spGetReportOperational @userID , @startDate, @endDate", parameters);
            var reportOperationals = await query.AsNoTracking().ToArrayAsync();

            response.Data = new ResponseDataList<ReportOperationlDto>
            {
                List = _mapper.Map<IEnumerable<ReportOperationlDto>>(reportOperationals)
            };

            return Ok(response);
        }


        [HttpPost("operational/detail")]
        public async Task<ActionResult> GetReportOperationalDetail([FromBody] ReportDetailRequestDto request)
        {
            int eventUserID = Request.GetUserID();
            SqlParameter[] parameters =
            {

               new SqlParameter("@userID", eventUserID),
               new SqlParameter("@month", request.Month),
               new SqlParameter("@isEnrolled", !(request.IsEnrolled.HasValue) ? DBNull.Value : (object)request.IsEnrolled),
               new SqlParameter("@isResolved", !(request.IsResolved.HasValue) ? DBNull.Value : (object)request.IsResolved),
            };

            var response = new ResponseData<ResponseDataList<ReportOperationalDetail>>
            {
                IsSuccess = true,
                Code = Constants.ResponseCode.Success,
                Message = "Success",
            };

            var query = _context.Query<ReportOperationalDetail>().FromSql($"dbo.spGetReportOperationalDetail @userID , @month, @isEnrolled, @isResolved", parameters);
            var reportOperationalDetails = await query.AsNoTracking().ToArrayAsync();

            response.Data = new ResponseDataList<ReportOperationalDetail>
            {
                List = reportOperationalDetails
            };

            return Ok(response);
        }

        [HttpPost("financial")]
        public async Task<ActionResult> GetReportFinancialList([FromBody] ReportRequestDto request)
        {
            int eventUserID = Request.GetUserID();
            SqlParameter[] parameters =
            {

               new SqlParameter("@UserID", eventUserID),
               new SqlParameter("@StartDate", !(request.StartDate.HasValue) ? DBNull.Value : (object)request.StartDate),
               new SqlParameter("@EndDate", !(request.EndDate.HasValue) ? DBNull.Value : (object)request.EndDate),
            };

            var response = new ResponseData<ResponseDataList<ReportFinancialDto>>
            {
                IsSuccess = true,
                Code = Constants.ResponseCode.Success,
                Message = "Success",
            };

            var query = _context.Query<ReportFinancial>().FromSql($"dbo.spGetReportFinancial @userID , @startDate, @endDate", parameters);
            var reportFinancials = await query.AsNoTracking().ToArrayAsync();

            response.Data = new ResponseDataList<ReportFinancialDto>
            {
                List = _mapper.Map<IEnumerable<ReportFinancialDto>>(reportFinancials)
            };

            return Ok(response);
        }

        [HttpPost("productivity")]
        public async Task<ActionResult> GetReportProductivity([FromBody] ReportProductivityRequestDto request)
        {
            int eventUserID = Request.GetUserID();
            SqlParameter[] parameters =
            {

               new SqlParameter("@userID", eventUserID),
               new SqlParameter("@StartDate", !(request.StartDate.HasValue) ? DBNull.Value : (object)request.StartDate),
               new SqlParameter("@EndDate", !(request.EndDate.HasValue) ? DBNull.Value : (object)request.EndDate),
               new SqlParameter("@checkPointType", request.CheckPointType == null? DBNull.Value  : (object)request.CheckPointType),
            };

            var response = new ResponseData<ResponseDataList<ReportProductivityDto>>
            {
                IsSuccess = true,
                Code = Constants.ResponseCode.Success,
                Message = "Success",
            };

            var query = _context.Query<ReportProductivityPaged>().FromSql($"dbo.spGetReportProductivityList @userID, @StartDate, @EndDate, @checkPointType", parameters);
            var reportProductivityList = await query.AsNoTracking().ToArrayAsync();

            response.Data = new ResponseDataList<ReportProductivityDto>
            {
                List = _mapper.Map<IEnumerable<ReportProductivityDto>>(reportProductivityList),
            };

            return Ok(response);
        }

        [HttpPost("productivity/{userID}")]
        public async Task<ActionResult> GetReportProductivityDetail(int userID, [FromBody] ReportProductivityRequestDto request)
        {
            int eventUserID = Request.GetUserID();
            int pageSize = request.PageSize.IsNullOrValue(0) ? PageSize : request.PageSize.Value;
            int pageIndex = request.PageIndex.IsNullOrValue(0) ? PageIndex : request.PageIndex.Value;
            string sortBy = String.IsNullOrEmpty(request.SortBy) ? "" : request.SortBy;
            int orderBy = request.OrderBy.GetValueOrDefault(0);

            SqlParameter[] parameters =
            {

               new SqlParameter("@eventUserID", eventUserID),
               new SqlParameter("@userID", userID),
               new SqlParameter("@checkPointType", request.CheckPointType == null? DBNull.Value  : (object)request.CheckPointType),
               new SqlParameter("@startDate", !(request.StartDate.HasValue) ? DBNull.Value : (object)request.StartDate),
               new SqlParameter("@endDate", !(request.EndDate.HasValue) ? DBNull.Value : (object)request.EndDate),
               new SqlParameter("@pageIndex", pageIndex),
               new SqlParameter("@pageSize", pageSize),
               new SqlParameter("@sortBy", sortBy),
               new SqlParameter("@orderBy", orderBy)
            };

            var response = new ResponseData<ResponseDataListPaged<ReportProductivityDto>>
            {
                IsSuccess = true,
                Code = Constants.ResponseCode.Success,
                Message = "Success",
            };

            var query = _context.Query<ReportProductivityPaged>().FromSql($"dbo.spGetReportProductivityDetail @eventUserID, @userID ,@checkPointType, @startDate, @endDate, @pageIndex, @pageSize, @sortBy, @orderBy", parameters);
            var reportOperationalDetails = await query.AsNoTracking().ToArrayAsync();

            response.Data = new ResponseDataListPaged<ReportProductivityDto>
            {
                List = _mapper.Map<IEnumerable<ReportProductivityDto>>(reportOperationalDetails),
                Count = reportOperationalDetails.Any() ? reportOperationalDetails[0].ResultCount : 0,
                PageSize = pageSize,
                PageIndex = pageIndex,
                SortBy = sortBy,
                OrderBy = orderBy
            };

            return Ok(response);
        }
    }
}