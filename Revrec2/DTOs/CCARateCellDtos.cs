using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Revrec2.DTOs
{
    public class CCARateCellListRequestDto
    {
        public string CCARateCell { get; set; }
        public string Product { get; set; }
        //  temporarily added, will be deleted
        /*
        public int? PageIndex { get; set; }
        public int? PageSize { get; set; }
        public string SortBy { get; set; }
        public int? OrderBy { get; set; }*/
    }

    public class CCARateCellForListDto
    {
        public int CCARateCellID { get; private set; }
        public string CCARateCell { get; private set; }
        public string Product { get; private set; }
       //  public bool? ActiveFlag { get; private set; }

    }
}