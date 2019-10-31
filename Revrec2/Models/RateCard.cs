using System;
using System.Collections.Generic;

namespace Revrec2
{
    public partial class RateCard
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
        public DateTime? InsertDate { get; private set; }
        public DateTime? UpdateDate { get; private set; }
    }

    public class RateCardPaged
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
        public DateTime? InsertDate { get; private set; }
        public DateTime? UpdateDate { get; private set; }
        public int ResultCount { get; private set; }
    }
}
