using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Revrec2.DTOs
{

    public class DiscrepancyStatusesForCreateDto
    {
        public string DiscrepancyStatus { get; set; }
        public string DiscrepancyStatusDescription { get; set; }
        public int DiscrepancyCategoryID { get; set; }
        public bool? ActiveFlag { get; set; }
    }

    public class DiscrepancyStatusesListRequestDto
    {
        public string DiscrepancyStatus { get; set; }
        public int? DiscrepancyCategoryID { get; set; }
        public int? DiscrepancyStatusType { get; set; }
        public int? PageIndex { get; set; }
        public int? PageSize { get; set; }
        public string SortBy { get; set; }
        public int? OrderBy { get; set; }
    }

    public class DiscrepancyStatusesForListDto
    {
        public int DiscrepancyStatusId { get; private set; }
        public string DiscrepancyStatus { get; private set; }
        public string DiscrepancyStatusDescription { get; private set; }
        public int? DiscrepancyCategoryID { get; private set; }
        public int? DiscrepancyStatusType { get; private set; }
        public string DiscrepancyCategory { get; private set; }
        public string DiscrepancyCategoryDescription { get; private set; }
        public bool? ActiveFlag { get; private set; }
    }
}
