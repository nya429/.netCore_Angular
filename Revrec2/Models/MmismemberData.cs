using System;
using System.Collections.Generic;

namespace Revrec2
{
    public partial class MmismemberData
    {
        public int MasterPatientId { get; set; }
        public string MmisId { get; set; }
        public string MemberFirstName { get; set; }
        public string MemberMiddleName { get; set; }
        public string MemberLastName { get; set; }
        public string Suffix { get; set; }
        public bool? ActiveFlag { get; set; }
        public DateTime? InsertDate { get; set; }
        public DateTime? UpdateDate { get; set; }
    }
}
