using System;
using System.Collections.Generic;

namespace Revrec2
{
    public partial class Mmisregions
    {
        public int MmisregionId { get; set; }
        public string Mmisregion { get; set; }
        public string Product { get; set; }
        public bool? ActiveFlag { get; set; }
        public DateTime? InsertDate { get; set; }
        public DateTime? UpdateDate { get; set; }
    }
}
