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
    public class RegionMapController : Controller
    {
        private readonly DataContext _context;
        private readonly IMapper _mapper;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ILogger _logger;

        private const int PageIndex = Constants.PaginationParams.PageIndex;
        private const int PageSize = Constants.PaginationParams.PageSize;

        public RegionMapController(DataContext context,
           IMapper mapper,
           IHttpContextAccessor httpContextAccessor,
           ILogger<RegionMapController> logger)
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

        [HttpPost("GetRegionMapList")]
        public async Task<ActionResult> GetRegionMapListByConAsync([FromBody] RegionMapListRequestDto request)
        {
            string product = String.IsNullOrEmpty(request.Product) ? "" : request.Product;
            string cCARegion = String.IsNullOrEmpty(request.CCARegion) ? "" : request.CCARegion;
            string mMISRegion = String.IsNullOrEmpty(request.MMISRegion) ? "" : request.MMISRegion;
            int pageSize = request.PageSize.IsNullOrValue(0) ? PageSize : request.PageSize.Value;
            int pageIndex = request.PageIndex.IsNullOrValue(0) ? PageIndex : request.PageIndex.Value;
            string sortBy = String.IsNullOrEmpty(request.SortBy) ? "" : request.SortBy;
            int orderBy = request.OrderBy.GetValueOrDefault(0);

            int eventUserID = Request.GetUserID();

            SqlParameter[] parameters =
                   {

                    new SqlParameter("@eventUserID", eventUserID),
                    new SqlParameter("@pageIndex", pageIndex),
                    new SqlParameter("@pageSize", pageSize),
                    new SqlParameter()
                        {
                        ParameterName = "@sortBy",
                         SqlDbType = SqlDbType.VarChar,
                         Size = 20,
                         Value = sortBy
                    },
                    new SqlParameter("@orderBy ", orderBy)
                };

            var response = new ResponseData<ResponseDataListPaged<RegionMapForListDto>>
            {
                IsSuccess = true,
                Code = Constants.ResponseCode.Success,
                Message = "Success",
            };

            var query = _context.Query<RegionMapPaged>().FromSql($"dbo.spGetRegionMap {eventUserID}, {product}, {cCARegion}, {mMISRegion}, {pageIndex}, {pageSize}, {sortBy}, {orderBy}");
            var regionMapList = await query.AsNoTracking().ToArrayAsync();

            response.Data = new ResponseDataListPaged<RegionMapForListDto>
            {
                Count = regionMapList.Any() ? regionMapList[0].ResultCount : 0,
                List = _mapper.Map<IEnumerable<RegionMapForListDto>>(regionMapList),
                PageSize = pageSize,
                PageIndex = pageIndex,
                SortBy = sortBy,
                OrderBy = orderBy
            };

            return Ok(response);
        }

        [HttpGet("GetRegionMapCount")]
        public async Task<ActionResult> GetRegionMapCountByConAsync()
        {
            int eventUserID = Request.GetUserID();

            var response = new ResponseData<ResponseCount>
            {
                IsSuccess = true,
                Code = Constants.ResponseCode.Success,
                Message = "Success",
            };

            var query = _context.Query<UnmappedMMISRegions>().FromSql($"dbo.spGetUnmappedMMISRegionCount {eventUserID}");
            var unmappedMMISRegions = await query.AsNoTracking().ToArrayAsync();

            response.Data = new ResponseCount
            {
                Count = unmappedMMISRegions.Any() ? unmappedMMISRegions[0].UnmappedMMISRegionCount : 0
            };

            return Ok(response);
        }

        [HttpPatch("UpdateRegionMapByID/{regionMapID}")]
        public async Task<ActionResult> UpdateRegionMapByIDAsync(int regionMapID, [FromBody] RegionMapForCreateDto request)
        {
            int eventUserID = Request.GetUserID();

            SqlParameter[] parameters =
                   {
                    new SqlParameter("@eventUserID", eventUserID),
                    new SqlParameter("@RegionMapID", regionMapID),
                    new SqlParameter("@CCARegionID", request.CCARegionID),
                    new SqlParameter("@ActiveFlag ", request.ActiveFlag),
                    new SqlParameter() {
                       ParameterName = "@ReturnCode",
                       SqlDbType = SqlDbType.Int,
                       Direction = System.Data.ParameterDirection.Output},
                    };

            var response = new Response();

            var result = await _context.Database.ExecuteSqlCommandAsync("EXEC dbo.spUpdateRegionMap @eventUserID, @RegionMapID, @CCARegionID,@ActiveFlag, @ReturnCode OUT", parameters);

            response.IsSuccess = true;
            response.Code = parameters.FirstOrDefault(p => p.ParameterName.Equals("@ReturnCode")).Value.toInt();
            response.Message = "Success";

            return Ok(response);
        }
    }
}