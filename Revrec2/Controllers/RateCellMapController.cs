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
    public class RateCellMapController : Controller
    {
        private readonly DataContext _context;
        private readonly IMapper _mapper;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ILogger _logger;

        private const int PageIndex = Constants.PaginationParams.PageIndex;
        private const int PageSize = Constants.PaginationParams.PageSize;

        public RateCellMapController(DataContext context,
           IMapper mapper,
           IHttpContextAccessor httpContextAccessor,
           ILogger<RateCellMapController> logger)
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

        [HttpPost("GetRateCellMapList")]
        public async Task<ActionResult> GetRateCellMapListByConAsync([FromBody] RateCellMapListRequestDto request)
        {
            string product = String.IsNullOrEmpty(request.Product) ? "" : request.Product;
            string cCARateCell = String.IsNullOrEmpty(request.CCARateCell) ? "" : request.CCARateCell;
            string mMISRateCell = String.IsNullOrEmpty(request.MMISRateCell) ? "" : request.MMISRateCell;
            int pageSize = request.PageSize.IsNullOrValue(0) ? PageSize : request.PageSize.Value;
            int pageIndex = request.PageIndex.IsNullOrValue(0) ? PageIndex : request.PageIndex.Value;
            string sortBy = String.IsNullOrEmpty(request.SortBy) ? "" : request.SortBy;
            int orderBy = request.OrderBy.GetValueOrDefault(0);

            int eventUserID = Request.GetUserID();

            var response = new ResponseData<ResponseDataListPaged<RateCellMapForListDto>>
            {
                IsSuccess = true,
                Code = Constants.ResponseCode.Success,
                Message = "Success",
            };

            var query = _context.Query<RateCellMapPaged>().FromSql($"dbo.spGetRateCellMap {eventUserID}, {cCARateCell}, {mMISRateCell}, {product}, {pageIndex}, {pageSize}, {sortBy}, {orderBy}");
            var rateCellMapList = await query.AsNoTracking().ToArrayAsync();
            response.Data = new ResponseDataListPaged<RateCellMapForListDto>
            {
                Count = rateCellMapList.Any() ? rateCellMapList[0].ResultCount : 0,
                List = _mapper.Map<IEnumerable<RateCellMapForListDto>>(rateCellMapList),
                PageSize = pageSize,
                PageIndex = pageIndex,
                SortBy = sortBy,
                OrderBy = orderBy
            };

            return Ok(response);
        }

        [HttpGet("GetRateCellMapCount")]
        public async Task<ActionResult> GetRateCellMapCountByConAsync()
        {
            int eventUserID = Request.GetUserID();

            var response = new ResponseData<ResponseCount>
            {
                IsSuccess = true,
                Code = Constants.ResponseCode.Success,
                Message = "Success",
            };

            var query = _context.Query<UnmappedMMISRateCells>().FromSql($"dbo.spGetUnmappedMMISRateCellCount {eventUserID}");
            var unmappedMMISRateCells = await query.AsNoTracking().ToArrayAsync();

            response.Data = new ResponseCount
            {
                Count = unmappedMMISRateCells.Any() ? unmappedMMISRateCells[0].UnmappedMMISRateCellCount : 0
            };

            return Ok(response);
        }

        [HttpPatch("UpdateRateCellMapByID/{rateCellMapID}")]
        public async Task<ActionResult> UpdateRateCellMapByIDAsync(int rateCellMapID, [FromBody] RateCellMapForCreateDto request)
        {
            int eventUserID = Request.GetUserID();

            SqlParameter[] parameters =
                   {
                    new SqlParameter("@eventUserID", eventUserID),
                    new SqlParameter("@RateCellMapID", rateCellMapID),
                    new SqlParameter("@CCARateCellID", request.CCARateCellID),
                    new SqlParameter("@ActiveFlag ", request.ActiveFlag),
                    new SqlParameter() {
                       ParameterName = "@ReturnCode",
                       SqlDbType = SqlDbType.Int,
                       Direction = System.Data.ParameterDirection.Output},
                    };

            var response = new Response();
            var result = await _context.Database.ExecuteSqlCommandAsync("EXEC dbo.spUpdateRateCellMap @eventUserID, @RateCellMapID, @CCARateCellID,@ActiveFlag, @ReturnCode OUT", parameters);

            response.IsSuccess = true;
            response.Code = parameters.FirstOrDefault(p => p.ParameterName.Equals("@ReturnCode")).Value.toInt();
            response.Message = "Success";

            return Ok(response);
        }
    }
}