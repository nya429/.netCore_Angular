using System;
using System.Collections.Generic;

namespace Revrec2
{
    public partial class MmismultiMap
    {
        public int MmismultiId { get; set; }
        public int? MasterPatientId { get; set; }
        public string MmisId { get; set; }
        public bool? ActiveFlag { get; set; }
        public DateTime? InsertDate { get; set; }
        public DateTime? UpdateDate { get; set; }
    }
}
