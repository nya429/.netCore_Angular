using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Revrec2.DTOs
{

    public class RateCardForCreateDto
    {
        public int CCARateCellId { get; set; }
        public int CCARegionId { get; set; }
        public string Product { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public decimal Amount { get; set; }
    }

    public class RateCardListRequestDto
    {
        public string CCARateCell { get; set; }
        public string CCARegion { get; set; }
        public string Product { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public int? PageIndex { get; set; }
        public int? PageSize { get; set; }
        public string SortBy { get; set; }
        public int? OrderBy { get; set; }
    }

    public class RateCardForListDto
    {
        public int RateCardId { get; private set; }
        public int? CCARateCellId { get; private set; }
        public string CCARateCell { get; private set; }
        public int? CCARegionId { get; private set; }
        public string CCARegion { get; private set; }
        public DateTime? StartDate { get; private set; }
        public DateTime? EndDate { get; private set; }
        public decimal? Amount { get; private set; }
        public string RateCardLabel { get; private set; }
        public string Eligibility { get; private set; }
        public string Product { get; private set; }
        public bool? ActiveFlag { get; private set; }
    }
}
