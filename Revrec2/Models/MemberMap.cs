using System;
using System.Collections.Generic;

namespace Revrec2
{
    public partial class MemberMap
    {
        public int MemberMapId { get; set; }
        public int? MasterPatientId { get; set; }
        public long? Ccaid { get; set; }
        public bool? ActiveFlag { get; set; }
        public DateTime? InsertDate { get; set; }
        public DateTime? UpdateDate { get; set; }
    }
}
