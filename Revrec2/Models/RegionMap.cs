using System;

namespace Revrec2.Models
{
    public partial class RegionMap
    {
        public int RegionMapID { get; set; }
        public int? CCARegionID { get; set; }
        public string CCARegion { get; set; }
        public string CCAProduct { get; set; }
        public int MMISRegionID{ get; set; }        
        public string MMISRegion { get; set; }
        public string MMISProduct { get; set; }
        public bool? ActiveFlag { get; set; }
        public DateTime? InsertDate { get; set; }
        public DateTime? UpdateDate { get; set; }
    }
    public partial class RegionMapPaged
    {
        public int RegionMapID { get; set; }
        public int? CCARegionID { get; set; }
        public string CCARegion { get; set; }
        public string CCAProduct { get; set; }
        public int? MMISRegionID { get; set; }
        public string MMISRegion { get; set; }
        public string MMISProduct { get; set; }
        public bool? ActiveFlag { get; set; }
        public DateTime? InsertDate { get; set; }
        public DateTime? UpdateDate { get; set; }
        public int ResultCount { get; private set; }
    }
    public partial class UnmappedMMISRegions
    {
        public int UnmappedMMISRegionCount { get; set; }
    }
}
