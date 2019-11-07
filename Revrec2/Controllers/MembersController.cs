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
using Newtonsoft.Json;

namespace Revrec2.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MembersController : Controller
    {
        private readonly DataContext _context;
        private readonly IMapper _mapper;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ILogger _logger;

        private const int PageIndex = Constants.PaginationParams.PageIndex;
        private const int PageSize = Constants.PaginationParams.PageSize;

        public MembersController(DataContext context,
           IMapper mapper,
           IHttpContextAccessor httpContextAccessor,
           ILogger<MembersController> logger)
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

        [HttpPost("GetMemberList")]
        public async Task<ActionResult> GetMemberListByConAsync([FromBody] MemberListRequestDto request)
        {
            int? masterPatientId = request.MasterPatientID;
            string name = String.IsNullOrEmpty(request.Name) ? "" : request.Name;
            long? ccaId = request.CCAID;
            string mmisId = String.IsNullOrEmpty(request.MMIS_ID) ? "" : request.MMIS_ID;
            int? includeZeroDiscrepancy = request.IncludeZeroDiscrepancy;
            int? assigneeID = request.AssigneeID;
            int pageSize = request.PageSize.IsNullOrValue(0) ? PageSize : request.PageSize.Value;
            int pageIndex = request.PageIndex.IsNullOrValue(0) ? PageIndex : request.PageIndex.Value;
            string sortBy = String.IsNullOrEmpty(request.SortBy) ? "" : request.SortBy;
            int orderBy = request.OrderBy.GetValueOrDefault(0);

            //int eventUserID = 1;
            int eventUserID = Request.GetUserID();

            var response = new ResponseData<ResponseDataListPaged<MemberForListDto>>
            {
                IsSuccess = true,
                Code = Constants.ResponseCode.Success,
                Message = "Success",
            };

            var query = _context.Query<MembersPaged>().FromSql($"dbo.spGetMemberList {eventUserID}, {masterPatientId}, {name}, {ccaId}, {mmisId}, {includeZeroDiscrepancy}, {assigneeID}, {pageIndex}, {pageSize}, {sortBy}, {orderBy}");
            var memberList = await query.AsNoTracking().ToArrayAsync();

            response.Data = new ResponseDataListPaged<MemberForListDto>
            {
                Count = memberList.Any() ? memberList[0].ResultCount : 0,
                List = _mapper.Map<IEnumerable<MemberForListDto>>(memberList),
                PageSize = pageSize,
                PageIndex = pageIndex,
                SortBy = sortBy,
                OrderBy = orderBy
            };

            return Ok(response);
        }

        [HttpGet("GetMemberInfo/{masterPatientID}")]
        public async Task<ActionResult> GetMemberInfoByConAsync(int masterPatientID)
        {
            int? masterPatientId = masterPatientID;
            int eventUserID = Request.GetUserID();

            var response = new ResponseData<Members>
            {
                IsSuccess = true,
                Code = Constants.ResponseCode.Success,
                Message = "Success",
            };

            var query = _context.Query<Members>().FromSql($"dbo.spGetMemberInfo {eventUserID},{masterPatientId}");
            var memberInfo = await query.AsNoTracking().FirstAsync();

            response.Data = memberInfo;

            return Ok(response);
        }

        [HttpGet("GetMemberByName/{memberName}")]
        public async Task<ActionResult> GetMemberByNameByConAsync(string memberName)
        {
            string name = memberName;
            int eventUserID = Request.GetUserID();

            var response = new ResponseData<ResponseDataList<MemberByNameListDto>>
            {
                IsSuccess = true,
                Code = Constants.ResponseCode.Success,
                Message = "Success",
            };

            var query = _context.Query<MembersByNamePaged>().FromSql($"dbo.spGetMemberName {eventUserID},{name}");
            var memberByNameList = await query.AsNoTracking().ToArrayAsync();

            response.Data = new ResponseDataList<MemberByNameListDto>
            {
                List = _mapper.Map<IEnumerable<MemberByNameListDto>>(memberByNameList)
            };

            return Ok(response);
        }

        [HttpPost("UpdateDiscrepancyForMultipleMembers")]
        public async Task<ActionResult> UpdateDiscrepancyForMultipleMembersByConAsync([FromBody] DiscrepancyUpdateForMultipleMembersRequestDto request)
        {
            DataTable dtMemberIDs = GenerateDataTableBulkIDs("UpdateID", request.MemberIds);
            int eventUserID = Request.GetUserID();

            SqlParameter[] parameters =
                   {
                    new SqlParameter("@eventUserID", eventUserID),
                    new SqlParameter() {
                       ParameterName = "@MemberIDs",
                       SqlDbType = SqlDbType.Structured,
                       TypeName="dbo.BulkID",
                       Value = dtMemberIDs
                       },
                    new SqlParameter("@DiscrepancyStatusId", !(request.DiscrepancyStatusId.HasValue) ? DBNull.Value : (object)request.DiscrepancyStatusId),
                    new SqlParameter("@Assigned_UserID", !(request.Assigned_UserID.HasValue) ? DBNull.Value : (object)request.Assigned_UserID),
                    new SqlParameter("@DueDate", !(request.DueDate.HasValue) ? DBNull.Value : (object)request.DueDate),
                    new SqlParameter("@DiscrepancyComment", String.IsNullOrEmpty(request.DiscrepancyComment) ? "" : request.DiscrepancyComment),
                    new SqlParameter() {
                       ParameterName = "@ReturnCode",
                       SqlDbType = SqlDbType.Int,
                       Direction = System.Data.ParameterDirection.Output},
                    };

            var response = new Response();

            var result = await _context.Database.ExecuteSqlCommandAsync("EXEC dbo.spUpdateBulkMembers @eventUserID, @MemberIDs, @DiscrepancyStatusId ,@Assigned_UserID, @DueDate, @DiscrepancyComment, @ReturnCode OUT", parameters);
            response.IsSuccess = true;
            response.Code = parameters.FirstOrDefault(p => p.ParameterName.Equals("@ReturnCode")).Value.toInt();
            response.Message = "Success";
            return Ok(response);
        }

        [HttpPost("UpdateMultipleDiscrepanciesBYFilters")]
        public async Task<ActionResult> UpdateMultipleDiscrepanciesBYFiltersByConAsync([FromBody] DiscrepancyUpdateByFiltersRequestDto request)
        {
            DataTable dtMemberIDs = GenerateDataTableBulkIDs("UpdateID", request.MemberIds);
            int eventUserID = Request.GetUserID();

            SqlParameter[] parameters =
                   {
                    new SqlParameter("@eventUserID", eventUserID),
                    new SqlParameter("@Name", String.IsNullOrEmpty(request.Name) ? "" : request.Name),
                    new SqlParameter("@CCAID", !(request.CCAID.HasValue) ? DBNull.Value : (object)request.CCAID),
                    new SqlParameter("@MMIS_ID", String.IsNullOrEmpty(request.MMIS_ID) ? "" : request.MMIS_ID),
                    new SqlParameter("@includeZeroDiscrepancy", request.IncludeZeroDiscrepancy),
                    new SqlParameter() {
                       ParameterName = "@MemberIDs",
                       SqlDbType = SqlDbType.Structured,
                       TypeName="dbo.BulkID",
                       Value = dtMemberIDs
                       },
                    new SqlParameter("@DiscrepancyStatusId", !(request.DiscrepancyStatusId.HasValue) ? DBNull.Value : (object)request.DiscrepancyStatusId),
                    new SqlParameter("@Assigned_UserID", !(request.Assigned_UserID.HasValue) ? DBNull.Value : (object)request.Assigned_UserID),
                    new SqlParameter("@DueDate", !(request.DueDate.HasValue) ? DBNull.Value : (object)request.DueDate),
                    new SqlParameter("@DiscrepancyComment", String.IsNullOrEmpty(request.DiscrepancyComment) ? "" : request.DiscrepancyComment),
                    new SqlParameter() {
                       ParameterName = "@ReturnCode",
                       SqlDbType = SqlDbType.Int,
                       Direction = System.Data.ParameterDirection.Output},
                    };

            var response = new Response();

            var result = await _context.Database.ExecuteSqlCommandAsync("EXEC dbo.spUpdateFilterMembers @eventUserID, @Name ,@CCAID, @MMIS_ID, @includeZeroDiscrepancy, @MemberIDs, @DiscrepancyStatusId ,@Assigned_UserID, @DueDate, @DiscrepancyComment, @ReturnCode OUT", parameters);
            response.IsSuccess = true;
            response.Code = parameters.FirstOrDefault(p => p.ParameterName.Equals("@ReturnCode")).Value.toInt();
            response.Message = "Success";
            return Ok(response);
        }

        protected DataTable GenerateDataTableBulkIDs(string columnName, MemberIDs memberIDs)
        {
            DataTable dataTable = new DataTable();
            dataTable.Columns.Add(columnName, typeof(int));

            foreach (MemberID bulkID in memberIDs.MemberID)
            {
                dataTable.Rows.Add(bulkID.UpdateID);
            }

            return dataTable;
        }
    }
}