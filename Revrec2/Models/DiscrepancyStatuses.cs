using System;
using System.Collections.Generic;

namespace Revrec2
{
    public partial class DiscrepancyStatuses
    {
        public int DiscrepancyStatusId { get; private set; }
        public string DiscrepancyStatus { get; private set; }
        public string DiscrepancyStatusDescription { get; private set; }
        public int? DiscrepancyCategoryID { get; private set; }
        public int? DiscrepancyStatusType { get; private set; }
        public string DiscrepancyCategory { get; private set; }
        public string DiscrepancyCategoryDescription { get; private set; }
        public bool? ActiveFlag { get; private set; }
        public DateTime? InsertDate { get; private set; }
        public DateTime? UpdateDate { get; private set; }
    }

    public partial class DiscrepancyStatusesPaged
    {
        public int DiscrepancyStatusId { get; private set; }
        public string DiscrepancyStatus { get; private set; }
        public string DiscrepancyStatusDescription { get; private set; }
        public int? DiscrepancyCategoryID { get; private set; }
        public int? DiscrepancyStatusType { get; private set; }
        public string DiscrepancyCategory { get; private set; }
        public string DiscrepancyCategoryDescription { get; private set; }
        public bool? ActiveFlag { get; private set; }
        public DateTime? InsertDate { get; private set; }
        public DateTime? UpdateDate { get; private set; }
        public int ResultCount { get; private set; }
    }

    public class DiscrepancyStatusOption
    {
        public int? discrepancyStatusID { get; private set; }
        public string discrepancyStatus { get; private set; }
        public bool DiscrepancyCategoryDisplay { get; private set; }
        public string DiscrepancyCategory { get; private set; }
    }
}
