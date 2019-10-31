using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Revrec2.DTOs
{
    public class RegionMapListRequestDto
    {
        public string Product { get; set; }
        public string CCARegion { get; set; }
        public string MMISRegion { get; set; }
        public int? PageIndex { get; set; }
        public int? PageSize { get; set; }
        public string SortBy { get; set; }
        public int? OrderBy { get; set; }
    }
    public class RegionMapForListDto
    {
        public int? RegionMapID { get; private set; }
        public int CCARegionID { get; private set; }
        public string CCARegion { get; private set; }
        public string MMISProduct { get; private set; }
        public int MMISRegionID { get; private set; }
        public string MMISRegion { get; private set; }
        public bool? ActiveFlag { get; private set; }
    }
    public class RegionMapForCreateDto
    {
        public int CCARegionID { get; set; }
        public bool ActiveFlag { get; set; }
    }
}
