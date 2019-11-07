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
    public class CCARateCellsController : Controller
    {

        private readonly DataContext _context;
        private readonly IMapper _mapper;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ILogger _logger;

        private const int PageIndex = Constants.PaginationParams.PageIndex;
        private const int PageSize = Constants.PaginationParams.PageSize;

        public CCARateCellsController(DataContext context,
           IMapper mapper,
           IHttpContextAccessor httpContextAccessor,
           ILogger<CCARateCellsController> logger)
        {
            _context = context;
            _mapper = mapper;
            _httpContextAccessor = httpContextAccessor;
            _logger = logger;
        }

        [HttpPost("GetCCARateCellList")]
        public async Task<ActionResult> GetCCARateCellListByConAsync([FromBody] CCARateCellListRequestDto request)
        {
            string searchRateCell = String.IsNullOrEmpty(request.CCARateCell) ? "" : request.CCARateCell;
            string searchProduct = String.IsNullOrEmpty(request.Product) ? "" : request.Product;
            int eventUserID = Request.GetUserID();

            var response = new ResponseData<ResponseDataList<CCARateCells>>
            {
                IsSuccess = true,
                Code = Constants.ResponseCode.Success,
                Message = "Success",
            };

            var query = _context.Query<CCARateCells>().FromSql($"dbo.spGetCCARateCells {eventUserID}, {searchRateCell}, {searchProduct}");
            var ccatRateCellList = await query.AsNoTracking().ToArrayAsync();

            response.Data = new ResponseDataList<CCARateCells>
            {
                List = ccatRateCellList,
            };

            return Ok(response);
        }
    }
}
