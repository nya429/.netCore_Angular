using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Revrec2.DTOs
{    
    public class RateCellMapListRequestDto
    {
        public string Product { get; set; }
        public string CCARateCell { get; set; }
        public string MMISRateCell { get; set; }
        public int? PageIndex { get; set; }
        public int? PageSize { get; set; }
        public string SortBy { get; set; }
        public int? OrderBy { get; set; }
    }
    public class RateCellMapForListDto
    {
        public int? RateCellMapID { get; private set; }
        public string MMISProduct { get; private set; }
        public string CCARateCell { get; private set; }
        public int? CCARateCellID { get; private set; }
        public string MMISRateCell { get; private set; }
        public int? MMISRateCellID { get; private set; }
        public bool? ActiveFlag { get; private set; }
    }
    public class RateCellMapForCreateDto
    {
        public int CCARateCellID { get; set; }
        public bool ActiveFlag { get; set; }
    }
}