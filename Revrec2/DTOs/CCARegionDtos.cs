using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Revrec2.DTOs
{
    public class CCARegionListRequestDto
    {
        public string CCARegion { get; set; }
        public string Product { get; set; }
        //  temporarily added, will be deleted
        /*
        public int? PageIndex { get; set; }
        public int? PageSize { get; set; }
        public string SortBy { get; set; }
        public int? OrderBy { get; set; } */
    }

    public class CCARegionForListDto
    {
        public int CCARegionID { get; private set; }
        public string CCARegion { get; private set; }
        public string Product { get; private set; }
        // public bool? ActiveFlag { get; private set; }

    }
}