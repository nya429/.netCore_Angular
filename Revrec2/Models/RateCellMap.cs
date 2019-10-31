using System;

namespace Revrec2.Models
{
    public partial class RateCellMap
    {
        public int RateCellMapID { get; set; }
        public string CCAProduct { get; set; }
        public string MMISProduct { get; set; }
        public string CCARateCell { get; set; }
        public int? CCARateCellID { get; set; }
        public string MMISRateCell { get; set; }
        public int? MMISRateCellID { get; set; }
        public bool? ActiveFlag { get; set; }
        public DateTime? InsertDate { get; set; }
        public DateTime? UpdateDate { get; set; }
    }
    public partial class RateCellMapPaged
    {
        public int RateCellMapID { get; set; }
        public string CCAProduct { get; set; }
        public string MMISProduct { get; set; }
        public string CCARateCell { get; set; }
        public int? CCARateCellID { get; set; }
        public string MMISRateCell { get; set; }
        public int? MMISRateCellID { get; set; }
        public bool? ActiveFlag { get; set; }
        public DateTime? InsertDate { get; set; }
        public DateTime? UpdateDate { get; set; }
        public int ResultCount { get; private set; }
    }
    public partial class UnmappedMMISRateCells
    {
        public int UnmappedMMISRateCellCount { get; set; }
    }
}
