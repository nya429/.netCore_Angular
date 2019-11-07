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
    public class CCARegionsController : Controller
    {

        private readonly DataContext _context;
        private readonly IMapper _mapper;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ILogger _logger;

        private const int PageIndex = Constants.PaginationParams.PageIndex;
        private const int PageSize = Constants.PaginationParams.PageSize;

        public CCARegionsController(DataContext context,
           IMapper mapper,
           IHttpContextAccessor httpContextAccessor,
           ILogger<CCARegionsController> logger)
        {
            _context = context;
            _mapper = mapper;
            _httpContextAccessor = httpContextAccessor;
            _logger = logger;
        }

        [HttpPost("GetCCARegionList")]
        public async Task<ActionResult> GetCCARegionListByConAsync([FromBody] CCARegionListRequestDto request)
        {
            string searchRegion = String.IsNullOrEmpty(request.CCARegion) ? "" : request.CCARegion;
            string searchProduct = String.IsNullOrEmpty(request.Product) ? "" : request.Product;
            int eventUserID = Request.GetUserID();

            var response = new ResponseData<ResponseDataList<CCARegions>>
            {
                IsSuccess = true,
                Code = Constants.ResponseCode.Success,
                Message = "Success",
            };

            var query = _context.Query<CCARegions>().FromSql($"dbo.spGetCCARegions {eventUserID}, {searchRegion}, {searchProduct}");
            var ccaRegionList = await query.AsNoTracking().ToArrayAsync();

            response.Data = new ResponseDataList<CCARegions>
            {
                List = ccaRegionList,
            };

            return Ok(response);
        }
    }
}
