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
    public class RateCardsController : Controller
    {

        private readonly DataContext _context;
        private readonly IMapper _mapper;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ILogger _logger;

        private const int PageIndex = Constants.PaginationParams.PageIndex;
        private const int PageSize = Constants.PaginationParams.PageSize;

        public RateCardsController(DataContext context,
           IMapper mapper,
           IHttpContextAccessor httpContextAccessor,
           ILogger<RateCardsController> logger)
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

        [HttpGet("[action]")]
        public IEnumerable<RateCard> GetRateCards()
        {
            try
            {
                var results = _context.RateCards.ToList();
                return results;
            }
            catch (Exception e)
            {
                System.Diagnostics.Debug.WriteLine(e);
                return null;
            }
        }

        [HttpPost("GetRateCardList")]
        public async Task<ActionResult> GetRateCardListByConAsync([FromBody] RateCardListRequestDto request)
        {
            string filterRateCell = String.IsNullOrEmpty(request.CCARateCell) ? "" : request.CCARateCell;
            string filterRegion = String.IsNullOrEmpty(request.CCARegion) ? "" : request.CCARegion;
            string filterProduct = String.IsNullOrEmpty(request.Product) ? "" : request.Product;
            DateTime? startDate = !request.StartDate.HasValue ? null : request.StartDate;
            DateTime? endDate = !request.EndDate.HasValue ? null : request.EndDate;
            int pageSize = request.PageSize.IsNullOrValue(0) ? PageSize : request.PageSize.Value;
            int pageIndex = request.PageIndex.IsNullOrValue(0) ? PageIndex : request.PageIndex.Value;
            string sortBy = String.IsNullOrEmpty(request.SortBy) ? "" : request.SortBy;
            int orderBy = request.OrderBy.GetValueOrDefault(0);

            int eventUserID = Request.GetUserID();

            var response = new ResponseData<ResponseDataListPaged<RateCardForListDto>>
            {
                IsSuccess = true,
                Code = Constants.ResponseCode.Success,
                Message = "Success",
            };

            var query = _context.Query<RateCardPaged>().FromSql($"dbo.spGetRateCard {eventUserID}, {filterRateCell}, {filterRegion}, {filterProduct}, {startDate}, {endDate}, {pageIndex}, {pageSize}, {sortBy}, {orderBy}");
            var rateCardPagedList = await query.AsNoTracking().ToArrayAsync();

            response.Data = new ResponseDataListPaged<RateCardForListDto>
            {
                List = _mapper.Map<IEnumerable<RateCardForListDto>>(rateCardPagedList),
                Count = rateCardPagedList.Any() ? rateCardPagedList[0].ResultCount : 0,
                PageSize = pageSize,
                PageIndex = pageIndex,
                SortBy = sortBy,
                OrderBy = orderBy

            };
            return Ok(response);
        }

        [HttpPost("CreateRateCard")]
        public async Task<ActionResult> CreateRateCardAsync([FromBody] RateCardForCreateDto request)
        {
            int eventUserID = Request.GetUserID();

            SqlParameter[] parameters =
                {

                    new SqlParameter("@eventUserID", eventUserID),
                    new SqlParameter("@CCARateCellID", request.CCARateCellId),
                    new SqlParameter("@CCARegionID", request.CCARegionId),
                    new SqlParameter("@Amount", request.Amount),
                    new SqlParameter("@StartDate ", request.StartDate),
                    new SqlParameter("@EndDate ", request.EndDate),
                    new SqlParameter("@RateCardLabel", ""),
                    new SqlParameter("@Product", request.Product),
                    new SqlParameter("@ActiveFlag", 1),
                    new SqlParameter() {
                       ParameterName = "@NewIdentity",
                       SqlDbType = SqlDbType.Int,
                       Direction = System.Data.ParameterDirection.Output},
                    new SqlParameter() {
                       ParameterName = "@ReturnCode",
                       SqlDbType = SqlDbType.Int,
                       Direction = System.Data.ParameterDirection.Output}
                };

            var response = new ResponseData<int?>();
            var result = await _context.Database.ExecuteSqlCommandAsync(" EXEC dbo.spCreateRateCard @eventUserID, @CCARateCellID, @CCARegionID, @Amount, @StartDate, @EndDate, @RateCardLabel, @Product, @ActiveFlag, @NewIdentity OUT, @ReturnCode OUT", parameters);

            response.IsSuccess = true;
            response.Data = parameters.FirstOrDefault(p => p.ParameterName.Equals("@NewIdentity")).Value.toInt();
            response.Code = parameters.FirstOrDefault(p => p.ParameterName.Equals("@ReturnCode")).Value.toInt();
            response.Message = "Success";
            var code = parameters[0];
            return Ok(response);
        }

        [HttpPatch("UpdateRateCard/{rateCardID}")]
        public async Task<ActionResult> UpdateRateCardAync(int rateCardID, [FromBody] RateCardForCreateDto request)
        {
            int eventUserID = Request.GetUserID();

            SqlParameter[] parameters =
                {
                    new SqlParameter("@eventUserID", eventUserID),
                    new SqlParameter("@RateCardID", rateCardID),
                    new SqlParameter("@CCARateCellID", request.CCARateCellId),
                    new SqlParameter("@CCARegionID", request.CCARegionId),
                    new SqlParameter("@Amount", request.Amount),
                    new SqlParameter("@StartDate ", request.StartDate),
                    new SqlParameter("@EndDate ", request.EndDate),
                    new SqlParameter("@RateCardLabel", ""),
                    new SqlParameter("@Product", request.Product),
                    new SqlParameter("@ActiveFlag", 1),
                    new SqlParameter() {
                       ParameterName = "@ReturnCode",
                       SqlDbType = SqlDbType.Int,
                       Direction = System.Data.ParameterDirection.Output}
                };

            var response = new ResponseData<int>();
            var result = await _context.Database.ExecuteSqlCommandAsync($"dbo.spUpdateRateCard @eventUserID, @RateCardID, @CCARateCellID, @CCARegionID, @Amount, @StartDate, @EndDate, @RateCardLabel, @Product, @ActiveFlag, @ReturnCode Output", parameters);

            response.IsSuccess = true;
            response.Code = parameters.FirstOrDefault(p => p.ParameterName.Equals("@ReturnCode")).Value.toInt();
            response.Message = "Success";

            return Ok(response);
        }
    }
}
