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

namespace Revrec2.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DiscrepancyCategoryController : Controller
    {
        private readonly DataContext _context;
        private readonly IMapper _mapper;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ILogger _logger;

        private const int PageIndex = Constants.PaginationParams.PageIndex;
        private const int PageSize = Constants.PaginationParams.PageSize;

        public DiscrepancyCategoryController(DataContext context,
           IMapper mapper,
           IHttpContextAccessor httpContextAccessor,
           ILogger<DiscrepancyCategoryController> logger)
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
        public async Task<ActionResult> GetDiscrepancyCategoryListByConAsync([FromBody] DiscrepancyCategoriesListRequestDto request)
        {            
            int pageSize = request.PageSize.IsNullOrValue(0) ? PageSize : request.PageSize.Value;
            int pageIndex = request.PageIndex.IsNullOrValue(0) ? PageIndex : request.PageIndex.Value;
            string sortBy = String.IsNullOrEmpty(request.SortBy) ? "" : request.SortBy;
            int orderBy = request.OrderBy.GetValueOrDefault(0);

            //int eventUserID = 1;
            int eventUserID = Request.GetUserID();

            var response = new ResponseData<ResponseDataListPaged<DiscrepancyCategoriesForListDto>>
            {
                IsSuccess = true,
                Code = Constants.ResponseCode.Success,
                Message = "Success",
            };

            try
            {
                var query = _context.Query<DiscrepancyCategoriesPaged>().FromSql($"dbo.spGetDiscrepancyCategories {eventUserID}, {pageIndex}, {pageSize}, {sortBy}, {orderBy}");
                var discrepancyCategoriesList = await query.AsNoTracking().ToArrayAsync();

                response.Data = new ResponseDataListPaged<DiscrepancyCategoriesForListDto>
                {
                    Count = discrepancyCategoriesList.Any() ? discrepancyCategoriesList[0].ResultCount : 0,
                    List = _mapper.Map<IEnumerable<DiscrepancyCategoriesForListDto>>(discrepancyCategoriesList),
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
                _logger?.LogCritical("There was an error on '{0}' invocation: {1}", nameof(GetDiscrepancyCategoryListByConAsync), e);
                return BadRequest(response);
            }
        }

        [HttpPost]
        public async Task<ActionResult> CreateDiscreapancyCategoryAsync([FromBody] DiscrepancyCategoriesForCreateDto request)
        {
            //int eventUserID = 1;
            int eventUserID = Request.GetUserID();

            SqlParameter[] parameters =
                   {

                    new SqlParameter("@eventUserID", eventUserID),
                    new SqlParameter("@DiscrepancyCategory", request.DiscrepancyCategory),
                    new SqlParameter("@DiscrepancyCategoryDescription", request.DiscrepancyCategoryDescription),
                    new SqlParameter("@DiscrepancyCategoryDisplay", request.DiscrepancyCategoryDisplay),
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

            var response = new ResponseData<int?>();

            try
            {
                var result = await _context.Database.ExecuteSqlCommandAsync("EXEC dbo.spCreateDiscrepancyCategories @eventUserID, @DiscrepancyCategory, @DiscrepancyCategoryDescription, @DiscrepancyCategoryDisplay, @ActiveFlag, @NewIdentity OUT, @ReturnCode OUT", parameters);

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
                _logger?.LogCritical("There was an error on '{0}' invocation: {1}", nameof(CreateDiscreapancyCategoryAsync), e);
                return BadRequest(response);
            }
        }

        [HttpPatch("{discrepancyCategoryID}")]
        public async Task<ActionResult> UpdateDiscrepancyCategoryByIDAsync(int discrepancyCategoryID, [FromBody] DiscrepancyCategoriesForCreateDto request)
        {
            //int eventUserID = 1;
            int eventUserID = Request.GetUserID();

            SqlParameter[] parameters =
                   {
                    new SqlParameter("@eventUserID", eventUserID),
                    new SqlParameter("@DiscrepancyCategoryID", discrepancyCategoryID),
                    new SqlParameter("@DiscrepancyCategory", request.DiscrepancyCategory),
                    new SqlParameter("@DiscrepancyCategoryDescription", request.DiscrepancyCategoryDescription),
                    new SqlParameter("@DiscrepancyCategoryDisplay", request.DiscrepancyCategoryDisplay),
                    new SqlParameter("@ActiveFlag ", request.ActiveFlag),
                    new SqlParameter() {
                       ParameterName = "@ReturnCode",
                       SqlDbType = SqlDbType.Int,
                       Direction = System.Data.ParameterDirection.Output},
                    };

            var response = new Response();

            try
            {
                var result = await _context.Database.ExecuteSqlCommandAsync("EXEC dbo.spUpdateDiscrepancyCategories @eventUserID, @DiscrepancyCategoryID, @DiscrepancyCategory, @DiscrepancyCategoryDescription, @DiscrepancyCategoryDisplay, @ActiveFlag, @ReturnCode OUT", parameters);

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
                _logger?.LogCritical("There was an error on '{0}' invocation: {1}", nameof(UpdateDiscrepancyCategoryByIDAsync), e);
                return BadRequest(response);
            }
        }

        [HttpGet("options")]
        public async Task<ActionResult> GetDiscrepancyCategoryOptions()
        {

            // int eventUserID = 1;
            int eventUserID = Request.GetUserID();

            var response = new ResponseData<ResponseDataList<DiscrepancyCategoryOption>>
            {
                IsSuccess = true,
                Code = Constants.ResponseCode.Success,
                Message = "Success",
            };

            try
            {
                var query = _context.Query<DiscrepancyCategoryOption>().FromSql($"dbo.spGetDiscrepancyCategoriesDropDown");
                var discrepancyCateogyrOptions = await query.AsNoTracking().ToArrayAsync();
                
                response.Data = new ResponseDataList<DiscrepancyCategoryOption>
                {
                    List = discrepancyCateogyrOptions
                };
                return Ok(response);

            }
            catch (Exception e)
            {
                response.IsSuccess = false;
                response.Code = Constants.ResponseCode.Fail;
                response.Message = "There was an internal error, please contact to technical support.";
                response.ErrorMessage = e.Message;
                _logger?.LogCritical("There was an error on '{0}' invocation: {1}", nameof(GetDiscrepancyCategoryOptions), e);
                return BadRequest(response);
            }
        }
    }
}