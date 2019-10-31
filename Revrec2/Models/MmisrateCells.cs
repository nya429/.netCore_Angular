using System;
using System.Collections.Generic;

namespace Revrec2
{
    public partial class MmisrateCells
    {
        public int MmisrateCellId { get; set; }
        public string MmisrateCell { get; set; }
        public string Product { get; set; }
        public bool? ActiveFlag { get; set; }
        public DateTime? InsertDate { get; set; }
        public DateTime? UpdateDate { get; set; }
    }
}
