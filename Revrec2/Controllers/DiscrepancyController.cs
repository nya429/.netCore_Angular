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
using Revrec2.Services;

namespace Revrec2.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DiscrepancyController : Controller
    {
        private readonly DataContext _context;
        private readonly IMapper _mapper;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ILogger _logger;
        private readonly DiscrepancyAssignmentService _discrepancyAssignmentService;
        private readonly CommentNotificationService _commentNotificationService;

        private const int PageIndex = Constants.PaginationParams.PageIndex;
        private const int PageSize = Constants.PaginationParams.PageSize;

        public DiscrepancyController(DataContext context,
           IMapper mapper,
           IHttpContextAccessor httpContextAccessor,
           ILogger<DiscrepancyController> logger,
           DiscrepancyAssignmentService discrepancyAssignmentService,
           CommentNotificationService commentNotificationService)
        {
            _context = context;
            _mapper = mapper;
            _httpContextAccessor = httpContextAccessor;
            _logger = logger;
            _discrepancyAssignmentService = discrepancyAssignmentService;
            _commentNotificationService = commentNotificationService;
        }

        public IActionResult Index()
        {
            return View();
        }

        [HttpGet("GetDiscrepancyById/{discrepancyId}")]
        public async Task<ActionResult> GetDiscrepancyByIdByConAsync(int discrepancyId)
        {
            int discrepancyID = discrepancyId;
            int eventUserID = Request.GetUserID();

            var response = new ResponseData<DiscrepancyRecordByIdPaged>
            {
                IsSuccess = true,
                Code = Constants.ResponseCode.Success,
                Message = "Success",
            };

            var query = _context.Query<DiscrepancyRecordByIdPaged>().FromSql($"dbo.spGetDiscrepancyRecord {eventUserID},{discrepancyID}");
            var discrepancyInfo = await query.AsNoTracking().FirstAsync();
            response.Data = discrepancyInfo;
            return Ok(response);
        }

        [HttpPost("GetDiscrepancyRecordListByFilters")]
        public async Task<ActionResult> GetDiscrepancyRecordListByConAsync([FromBody] DiscrepancyRecordListRequestDto request)
        {

            string name = String.IsNullOrEmpty(request.Name) ? "" : request.Name;
            string mmisID = String.IsNullOrEmpty(request.MMIS_ID) ? "" : request.MMIS_ID;
            int includeResolved = request.IncludeResolved;
            int pageSize = request.PageSize.IsNullOrValue(0) ? PageSize : request.PageSize.Value;
            int pageIndex = request.PageIndex.IsNullOrValue(0) ? PageIndex : request.PageIndex.Value;
            string sortBy = String.IsNullOrEmpty(request.SortBy) ? "" : request.SortBy;
            int orderBy = request.OrderBy.GetValueOrDefault(0);

            int eventUserID = Request.GetUserID();

            DataTable dtAssigneeIDs = GenerateDataTableBulkIDs("UpdateID", request.AssigneeIDs);
            DataTable dtCCARateCellIDs = GenerateDataTableBulkIDs("UpdateID", request.CCARateCellIDs);
            DataTable dtDiscrepancyStatusIDs = GenerateDataTableBulkIDs("UpdateID", request.DiscrepancyStatusIDs);
            DataTable dtMonths = GenerateDataTableBulkText("UpdateDate", request.Months);
            DataTable dtPrograms = GenerateDataTableBulkDates("UpdateString", request.Programs);

            SqlParameter[] parameters =
                   {
                    new SqlParameter("@eventUserID", eventUserID),
                    new SqlParameter("@name", name),
                    new SqlParameter("@CCAID", !(request.CCAID.HasValue) ? DBNull.Value : (object)request.CCAID),
                    new SqlParameter("@MMIS_ID ", mmisID),
                    new SqlParameter("@MasterPatientID", !(request.MasterPatientID.HasValue) ? DBNull.Value : (object)request.MasterPatientID),
                    new SqlParameter() {
                       ParameterName = "@Months",
                       SqlDbType = SqlDbType.Structured,
                       TypeName="dbo.BulkDate",
                       Value = dtMonths
                       },
                    new SqlParameter() {
                       ParameterName = "@Programs",
                       SqlDbType = SqlDbType.Structured,
                       TypeName="dbo.BulkString",
                       Value = dtPrograms
                       },
                    new SqlParameter() {
                       ParameterName = "@CCARateCellIDs",
                       SqlDbType = SqlDbType.Structured,
                       TypeName="dbo.BulkID",
                       Value = dtCCARateCellIDs
                       },
                    new SqlParameter() {
                       ParameterName = "@DiscrepancyStatusIDs",
                       SqlDbType = SqlDbType.Structured,
                       TypeName="dbo.BulkID",
                       Value = dtDiscrepancyStatusIDs
                       },
                    new SqlParameter() {
                       ParameterName = "@AssigneeIDs",
                       SqlDbType = SqlDbType.Structured,
                       TypeName="dbo.BulkID",
                       Value = dtAssigneeIDs
                       },
                    new SqlParameter("@hasComment",!(request.HasComment.HasValue) ? DBNull.Value : (object)request.HasComment),
                    new SqlParameter("@discoverDateStart", !(request.DiscoverDateStart.HasValue) ? DBNull.Value : (object)request.DiscoverDateStart),
                    new SqlParameter("@discoverDateEnd", !(request.DiscoverDateEnd.HasValue) ? DBNull.Value : (object)request.DiscoverDateEnd),
                    new SqlParameter("@resolutionDateStart", !(request.ResolutionDateStart.HasValue) ? DBNull.Value : (object)request.ResolutionDateStart),
                    new SqlParameter("@resolutionDateEnd", !(request.ResolutionDateEnd.HasValue) ? DBNull.Value : (object)request.ResolutionDateEnd),
                    new SqlParameter("@includeResolved ", includeResolved),
                    new SqlParameter("@pageIndex", pageIndex),
                    new SqlParameter("@pageSize", pageSize),
                    new SqlParameter("@sortBy", sortBy),
                    new SqlParameter("@orderBy", orderBy)
                    };


            var response = new ResponseData<ResponseDataListPaged<DiscrepancyRecordForListDto>>
            {
                IsSuccess = true,
                Code = Constants.ResponseCode.Success,
                Message = "Success",
            };

            var query = _context.Query<DiscrepancyRecordPaged>().FromSql($"dbo.spGetDiscrepancyList @eventUserID, @name, @CCAID, @MMIS_ID, @MasterPatientID, @Months, @Programs, @CCARateCellIDs, @DiscrepancyStatusIDs, @AssigneeIDs, @hasComment, @discoverDateStart, @discoverDateEnd, @resolutionDateStart, @resolutionDateEnd, @includeResolved, @pageIndex, @pageSize, @sortBy, @orderBy", parameters);
            var discrepancyRecordList = await query.AsNoTracking().ToArrayAsync();

            response.Data = new ResponseDataListPaged<DiscrepancyRecordForListDto>
            {
                Count = discrepancyRecordList.Any() ? discrepancyRecordList[0].ResultCount : 0,
                List = _mapper.Map<IEnumerable<DiscrepancyRecordForListDto>>(discrepancyRecordList),
                PageSize = pageSize,
                PageIndex = pageIndex,
                SortBy = sortBy,
                OrderBy = orderBy
            };

            return Ok(response);
        }

        [HttpGet("MonthlySummaryRecordMemberYears/{MasterPatientId}")]
        public async Task<ActionResult> GetMonthlySummaryRecordMemberYearsByConAsync(int MasterPatientId)
        {
            int MasterPatientID = MasterPatientId;
            int eventUserID = Request.GetUserID();

            var response = new ResponseData<ResponseDataList<MonthlySummaryRecordMemberYearsForListDto>>
            {
                IsSuccess = true,
                Code = Constants.ResponseCode.Success,
                Message = "Success",
            };

            var query = _context.Query<MonthlySummaryRecordMemberYearsPaged>().FromSql($"dbo.spGetMonthlySummaryRecordMemberYears {eventUserID},{MasterPatientID}");
            var summaryYearsInfo = await query.AsNoTracking().ToArrayAsync();

            response.Data = new ResponseDataList<MonthlySummaryRecordMemberYearsForListDto>
            {
                //Count = discrepancyInfo.Any() ? discrepancyInfo[0].ResultCount : 0,
                List = _mapper.Map<IEnumerable<MonthlySummaryRecordMemberYearsForListDto>>(summaryYearsInfo)
            };

            return Ok(response);
        }

        [HttpPost("MonthlySummaryRecordMemberMonths")]
        public async Task<ActionResult> GetMonthlySummaryRecordMemberMonthsByConAsync([FromBody] MonthlySummaryRecordMemberMonthsListRequestDto request)
        {
            int MasterPatientID = request.MasterPatientID;
            string Year = request.MemberYear;
            int eventUserID = Request.GetUserID();

            var response = new ResponseData<ResponseDataListPaged<MonthlySummaryRecordMemberMonthsForListDto>>
            {
                IsSuccess = true,
                Code = Constants.ResponseCode.Success,
                Message = "Success",
            };

            var query = _context.Query<MonthlySummaryRecordMemberMonthsPaged>().FromSql($"dbo.spGetMonthlySummaryRecordMemberMonths {eventUserID},{MasterPatientID},{Year}");
            var summaryYearsInfo = await query.AsNoTracking().ToArrayAsync();

            response.Data = new ResponseDataListPaged<MonthlySummaryRecordMemberMonthsForListDto>
            {
                List = _mapper.Map<IEnumerable<MonthlySummaryRecordMemberMonthsForListDto>>(summaryYearsInfo)
            };

            return Ok(response);
        }

        [HttpPatch("UpdateDiscrepancyByID/{discrepancyID}")]
        public async Task<ActionResult> UpdateDiscrepancyByIDAsync(int discrepancyID, [FromBody] DiscrepancyRecordForCreateDto request)
        {
            int eventUserID = Request.GetUserID();

            SqlParameter[] parameters =
                   {
                    new SqlParameter("@eventUserID", eventUserID),
                    new SqlParameter("@DiscrepancyID", discrepancyID),
                    new SqlParameter("@Assigned_UserID", !(request.AssigneeID.HasValue) ? DBNull.Value : (object)request.AssigneeID),
                    new SqlParameter("@DiscrepancyStatusID", request.DiscrepancyStatusID),
                    new SqlParameter("@DueDate", !(request.DueDate.HasValue) ? DBNull.Value : (object)request.DueDate),
                    new SqlParameter() {
                       ParameterName = "@ReturnCode",
                       SqlDbType = SqlDbType.Int,
                       Direction = System.Data.ParameterDirection.Output},
                   };

            var response = new Response();
            var result = await _context.Database.ExecuteSqlCommandAsync("EXEC dbo.spUpdateDiscrepancy @eventUserID, @DiscrepancyID, @Assigned_UserID, @DiscrepancyStatusID, @DueDate, @ReturnCode OUT", parameters);

            response.IsSuccess = true;
            response.Code = parameters.FirstOrDefault(p => p.ParameterName.Equals("@ReturnCode")).Value.toInt();
            response.Message = "Success";

            if (request.AssigneeID.HasValue && request.AssignmentChanged)
            {
                string actionUserName = Request.GetUserName();

                List<KeyValuePair<int, int>> discrepancyIds = new List<KeyValuePair<int, int>>();
                discrepancyIds.Add(new KeyValuePair<int, int>(discrepancyID, request.discrepancy.MasterPatientID));
                _discrepancyAssignmentService.discrepancyAssignement(request.AssigneeID ?? default(int), actionUserName, discrepancyIds);
            }

            return Ok(response);
        }

        [HttpPost("UpdateMultipleDiscrepanciesByIdList")]
        public async Task<ActionResult> UpdateMultipleDiscrepanciesByIdListByConAsync([FromBody] DiscrepancyRecordForUpdateDto request)
        {
            int eventUserID = Request.GetUserID();

            DataTable dtDiscrepancyIDs = new DataTable();
            dtDiscrepancyIDs.Columns.Add("UpdateID", typeof(int));

            foreach (BulkID ID in request.DiscrepancyIDs.BulkID)
            {
                dtDiscrepancyIDs.Rows.Add(ID.UpdateID);
            }

            SqlParameter[] parameters =
                   {
                    new SqlParameter("@eventUserID", eventUserID),
                    new SqlParameter() {
                       ParameterName = "@DiscrepancyIDs",
                       SqlDbType = SqlDbType.Structured,
                       TypeName="dbo.BulkID",
                       Value = dtDiscrepancyIDs
                       },
                    new SqlParameter("@DiscrepancyStatusId", !(request.DiscrepancyStatusID.HasValue) ? DBNull.Value : (object)request.DiscrepancyStatusID),
                    new SqlParameter("@Assigned_UserID", !(request.Assigned_UserID.HasValue) ? DBNull.Value : (object)request.Assigned_UserID),
                    new SqlParameter("@DueDate", !(request.DueDate.HasValue) ? DBNull.Value : (object)request.DueDate),
                    new SqlParameter("@DiscrepancyComment", String.IsNullOrEmpty(request.DiscrepancyComment) ? "" : request.DiscrepancyComment),
                    new SqlParameter() {
                       ParameterName = "@ReturnCode",
                       SqlDbType = SqlDbType.Int,
                       Direction = System.Data.ParameterDirection.Output},
                    };

            var response = new Response();

            var result = await _context.Database.ExecuteSqlCommandAsync("EXEC dbo.spUpdateBulkDiscrepancies @eventUserID, @DiscrepancyIDs, @DiscrepancyStatusId ,@Assigned_UserID, @DueDate, @DiscrepancyComment, @ReturnCode OUT", parameters);
            response.IsSuccess = true;
            response.Code = parameters.FirstOrDefault(p => p.ParameterName.Equals("@ReturnCode")).Value.toInt();
            response.Message = "Success";

            if (request.Assigned_UserID.HasValue 
               // && request.Assigned_UserID != eventUserID
                )
            {
                string actionUserName = Request.GetUserName();
                List<KeyValuePair<int, int>> list = request.Discrepancies.Select((discrepancy) => new KeyValuePair<int, int> (discrepancy.DiscrepancyID, discrepancy.MasterPatientID)).ToList();
                _discrepancyAssignmentService.discrepancyAssignement(request.Assigned_UserID ?? default(int), actionUserName, list);
            }

            return Ok(response);
        }

        [HttpGet("DiscrepancyCommentListById/{discrepancyId}")]
        public async Task<ActionResult> GetDiscrepancyCommentListByIdByConAsync(int discrepancyId)
        {
            int discrepancyID = discrepancyId;
            int eventUserID = Request.GetUserID();

            var response = new ResponseData<ResponseDataListPaged<DiscrepancyCommentsForListDto>>
            {
                IsSuccess = true,
                Code = Constants.ResponseCode.Success,
                Message = "Success",
            };

            var query = _context.Query<DiscrepancyCommentsPaged>().FromSql($"dbo.spGetDiscrepancyCommentList {eventUserID},{discrepancyID}");
            var discrepancyCommentsList = await query.AsNoTracking().ToArrayAsync();

            response.Data = new ResponseDataListPaged<DiscrepancyCommentsForListDto>
            {
                List = _mapper.Map<IEnumerable<DiscrepancyCommentsForListDto>>(discrepancyCommentsList)
            };

            return Ok(response);
        }

        [HttpPost("CreateDiscrepancyComment")]
        public async Task<ActionResult> CreateDiscreapancyCommentAsync([FromBody] DiscrepancyCommentForCreatWrapperDto request)
        {
            int eventUserID = Request.GetUserID();

            SqlParameter[] parameters =
                   {

                    new SqlParameter("@eventUserID", eventUserID),
                    new SqlParameter("@DiscrepancyID", request.discrepancyCommentForCreateDto.DiscrepancyID),
                    new SqlParameter("@ReplyCommentID", !(request.discrepancyCommentForCreateDto.ReplyCommentID.HasValue) ? DBNull.Value : (object)request.discrepancyCommentForCreateDto.ReplyCommentID),
                    new SqlParameter("@DiscrepancyComment", request.discrepancyCommentForCreateDto.DiscrepancyComment),
                    new SqlParameter("@ActiveFlag ", request.discrepancyCommentForCreateDto.ActiveFlag),
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

            var result = await _context.Database.ExecuteSqlCommandAsync("EXEC dbo.spCreateDiscrepancyComment @eventUserID, @DiscrepancyID, @ReplyCommentID, @DiscrepancyComment, @ActiveFlag, @NewIdentity OUT, @ReturnCode OUT", parameters);

            response.IsSuccess = true;
            response.Data = parameters.FirstOrDefault(p => p.ParameterName.Equals("@NewIdentity")).Value.toInt();
            response.Code = parameters.FirstOrDefault(p => p.ParameterName.Equals("@ReturnCode")).Value.toInt();
            response.Message = nameof(response.Code);


            if (request.anchoredUserIds.Any() && request.anchoredUserIds.Count > 0 && response.Data.HasValue)
            {
                string actionUserName = Request.GetUserName();
                _commentNotificationService.commentByAnchoredUserIdsAsync(request.anchoredUserIds, actionUserName, request.masterPatientID, request.discrepancyCommentForCreateDto.DiscrepancyID, response.Data.Value);
            }



            return Ok(response);
        }

        [HttpPatch("UpdateDiscrepancyComment/{discrepancyCommentID}")]
        public async Task<ActionResult> UpdateDiscrepancyCommentByIDAsync(int discrepancyCommentID, [FromBody] DiscrepancyCommentForUpdateDto request)
        {
            int eventUserID = Request.GetUserID();

            SqlParameter[] parameters =
                   {
                    new SqlParameter("@eventUserID", eventUserID),
                    new SqlParameter("@DiscrepancyCommentID", discrepancyCommentID),
                    new SqlParameter("@DiscrepancyComment", request.DiscrepancyComment),
                    new SqlParameter("@ActiveFlag", request.ActiveFlag),
                    new SqlParameter() {
                       ParameterName = "@ReturnCode",
                       SqlDbType = SqlDbType.Int,
                       Direction = System.Data.ParameterDirection.Output},
                   };

            var response = new Response();
            var result = await _context.Database.ExecuteSqlCommandAsync("EXEC dbo.spUpdateDiscrepancyComment @eventUserID, @DiscrepancyCommentID, @DiscrepancyComment, @ActiveFlag, @ReturnCode OUT", parameters);

            response.IsSuccess = true;
            response.Code = parameters.FirstOrDefault(p => p.ParameterName.Equals("@ReturnCode")).Value.toInt();
            response.Message = "Success";

            return Ok(response);
        }

        [HttpPost("UpdateMultipleDiscrepanciesByFilters")]
        public async Task<ActionResult> UpdateMultipleDiscrepanciesByFiltersByConAsync([FromBody] DiscrepancyRecordUpdateBulkFiltersDto request)
        {
            int eventUserID = Request.GetUserID();

            DataTable dtAssigneeIDs = GenerateDataTableBulkIDs("UpdateID", request.AssigneeIDs);
            DataTable dtCCARateCellIDs = GenerateDataTableBulkIDs("UpdateID", request.CCARateCellIDs);
            DataTable dtDiscrepancyStatusIDs = GenerateDataTableBulkIDs("UpdateID", request.DiscrepancyStatusIDs);
            DataTable dtMonths = GenerateDataTableBulkText("UpdateDate", request.Months);
            DataTable dtPrograms = GenerateDataTableBulkDates("UpdateString", request.Programs);
            DataTable dtDiscrepancyIDs = GenerateDataTableBulkIDs("UpdateID", request.DiscrepancyIDs);

            SqlParameter[] parameters =
                   {
                    new SqlParameter("@eventUserID", eventUserID),
                    new SqlParameter("@CCAID", !(request.CCAID.HasValue) ? DBNull.Value : (object)request.CCAID),
                    new SqlParameter("@MMIS_ID ", string.IsNullOrEmpty(request.MMIS_ID)?"":request.MMIS_ID),
                    new SqlParameter("@MasterPatientID", !(request.MasterPatientID.HasValue) ? DBNull.Value : (object)request.MasterPatientID),
                    new SqlParameter() {
                       ParameterName = "@Months",
                       SqlDbType = SqlDbType.Structured,
                       TypeName="dbo.BulkDate",
                       Value = dtMonths
                       },
                    new SqlParameter() {
                       ParameterName = "@Programs",
                       SqlDbType = SqlDbType.Structured,
                       TypeName="dbo.BulkString",
                       Value = dtPrograms
                       },
                    new SqlParameter() {
                       ParameterName = "@CCARateCellIDs",
                       SqlDbType = SqlDbType.Structured,
                       TypeName="dbo.BulkID",
                       Value = dtCCARateCellIDs
                       },
                    new SqlParameter() {
                       ParameterName = "@DiscrepancyStatusIDs",
                       SqlDbType = SqlDbType.Structured,
                       TypeName="dbo.BulkID",
                       Value = dtDiscrepancyStatusIDs
                       },
                    new SqlParameter() {
                       ParameterName = "@AssigneeIDs",
                       SqlDbType = SqlDbType.Structured,
                       TypeName="dbo.BulkID",
                       Value = dtAssigneeIDs
                       },
                    new SqlParameter("@hasComment",!(request.HasComment.HasValue) ? DBNull.Value : (object)request.HasComment),
                    new SqlParameter("@discoverDateStart", !(request.DiscoverDateStart.HasValue) ? DBNull.Value : (object)request.DiscoverDateStart),
                    new SqlParameter("@discoverDateEnd", !(request.DiscoverDateEnd.HasValue) ? DBNull.Value : (object)request.DiscoverDateEnd),
                    new SqlParameter("@resolutionDateStart", !(request.ResolutionDateStart.HasValue) ? DBNull.Value : (object)request.ResolutionDateStart),
                    new SqlParameter("@resolutionDateEnd", !(request.ResolutionDateEnd.HasValue) ? DBNull.Value : (object)request.ResolutionDateEnd),
                    new SqlParameter() {
                       ParameterName = "@DiscrepancyIDs",
                       SqlDbType = SqlDbType.Structured,
                       TypeName="dbo.BulkID",
                       Value = dtDiscrepancyIDs
                       },
                    new SqlParameter("@DiscrepancyStatusId", !(request.DiscrepancyStatusID.HasValue) ? DBNull.Value : (object)request.DiscrepancyStatusID),
                    new SqlParameter("@Assigned_UserID", !(request.Assigned_UserID.HasValue) ? DBNull.Value : (object)request.Assigned_UserID),
                    new SqlParameter("@DueDate", !(request.DueDate.HasValue) ? DBNull.Value : (object)request.DueDate),
                    new SqlParameter("@DiscrepancyComment", String.IsNullOrEmpty(request.DiscrepancyComment) ? "" : request.DiscrepancyComment),
                    new SqlParameter() {
                       ParameterName = "@ReturnCode",
                       SqlDbType = SqlDbType.Int,
                       Direction = System.Data.ParameterDirection.Output},
                    };

            var response = new Response();

            var result = await _context.Database.ExecuteSqlCommandAsync("EXEC dbo.spUpdateFilterDiscrepancies @eventUserID, @CCAID, @MMIS_ID, @MasterPatientID, @Months, @Programs, @CCARateCellIDs, @DiscrepancyStatusIDs, @AssigneeIDs, @hasComment, @discoverDateStart, @discoverDateEnd, @resolutionDateStart, @resolutionDateEnd, @DiscrepancyIDs, @DiscrepancyStatusId ,@Assigned_UserID, @DueDate, @DiscrepancyComment, @ReturnCode OUT", parameters);
            response.IsSuccess = true;
            response.Code = parameters.FirstOrDefault(p => p.ParameterName.Equals("@ReturnCode")).Value.toInt();
            response.Message = "Success";
            return Ok(response);
        }

        [HttpPost("GetDiscrepancyById/{discrepancyId}/GetRateCellCrossSourceList")]
        public async Task<ActionResult> GetDiscrepancyRateCellCrossSourceList(int discrepancyId, [FromBody] ExplorerDetailsRequestDto request)
        {
            SqlParameter[] parameters =
               {
            
                    new SqlParameter("@DiscrepancyID", discrepancyId),
                    new SqlParameter("@StartDate", !(request.StartDate.HasValue) ? DBNull.Value : (object)request.StartDate),
                    new SqlParameter("@EndDate", !(request.EndDate.HasValue) ? DBNull.Value : (object)request.EndDate),
               
               };

            var response = new ResponseData<ResponseDataList<ExplorerDetailsDto>>
            {
                IsSuccess = true,
                Code = Constants.ResponseCode.Success,
                Message = "Success",
            };

            var query = _context.Query<ExplorerDetails>().FromSql($"dbo.spGetExplorerDetails @DiscrepancyID , @startDate, @endDate", parameters);
            var explorerDetailsList = await query.AsNoTracking().ToArrayAsync();

            response.Data = new ResponseDataList<ExplorerDetailsDto>
            {
                List = _mapper.Map<IEnumerable<ExplorerDetailsDto>>(explorerDetailsList)
            };

            return Ok(response);
        }

        protected DataTable GenerateDataTableBulkIDs(string columnName, AssigneeIDs assigneeIDs)
        {
            DataTable dataTable = new DataTable();
            dataTable.Columns.Add(columnName, typeof(int));

            foreach (BulkID bulkID in assigneeIDs.BulkID)
            {
                dataTable.Rows.Add(bulkID.UpdateID);
            }

            return dataTable;
        }

        protected DataTable GenerateDataTableBulkDates(string columnName, Programs programs)
        {
            DataTable dataTable = new DataTable();
            dataTable.Columns.Add(columnName, typeof(string));

            foreach (BulkText bulkText in programs.BulkText)
            {
                dataTable.Rows.Add(bulkText.UpdateText);
            }

            return dataTable;
        }

        protected DataTable GenerateDataTableBulkText(string columnName, Months months)
        {
            DataTable dataTable = new DataTable();
            dataTable.Columns.Add(columnName, typeof(DateTime));

            foreach (BulkDate bulkDate in months.BulkDate)
            {
                dataTable.Rows.Add(bulkDate.UpdateDate);
            }

            return dataTable;
        }

    }
}