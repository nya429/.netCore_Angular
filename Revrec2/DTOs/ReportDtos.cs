using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Revrec2.DTOs
{
    public partial class ReportRequestDto
    {
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
    }

    public partial class ReportDetailRequestDto
    {
        public DateTime? Month { get; set; }
        public int? IsEnrolled { get; set; }
        public int? IsResolved { get; set; }
    }

    public partial class ReportProductivityRequestDto
    {
        public string CheckPointType { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public int? PageIndex { get; set; }
        public int? PageSize { get; set; }
        public string SortBy { get; set; }
        public int? OrderBy { get; set; }
    }


    public class ReportOperationlDto
    {
        public DateTime Month { get; set; }
        public int? Total_Member_Resolved{ get; set; }
        public int? Total_Member_Unresolved { get; set; }
        public int? Total_Nonmember_Resolved { get; set; }
        public int? Total_Nonmember_Unresolved { get; set; }
    }


    public class ReportFinancialDto
    {
        public DateTime Month { get; set; }
        public decimal? Underpay_Member_Unresolved { get; set; }
        public decimal? Overpay_Member_Unresolved { get; set; }
        public decimal? Underpay_Member_Resolved { get; set; }
        public decimal? Overpay_Member_Resolved { get; set; }
        public decimal? Underpay_Nonmember_Unresolved { get; set; }
        public decimal? Overpay_Nonmember_Unresolved { get; set; }
        public decimal? Underpay_Nonmember_Resolved { get; set; }
        public decimal? Overpay_Nonmember_Resolved { get; set; }
        public int Underpay_Member_Unresolved_Count { get; set; }
        public int Overpay_Member_Unresolved_Count { get; set; }
        public int Underpay_Member_Resolved_Count { get; set; }
        public int Overpay_Member_Resolved_Count { get; set; }
        public int Underpay_Nonmember_Unresolved_Count { get; set; }
        public int Overpay_Nonmember_Unresolved_Count { get; set; }
        public int Underpay_Nonmember_Resolved_Count { get; set; }
        public int Overpay_Nonmember_Resolved_Count { get; set; }
    }

    public class ReportProductivityDto
    {
        public int UserID { get; set; }
        public DateTime DateTime { get; set; }
        public DateTime EndDate { get; set; }
        public int? CountDiscrepancy { get; set; }
        public int? CountInFlow { get; set; }
        public int? CountOutFlow { get; set; }
        public int? CountOutStanding { get; set; }
        public int? CountTriage { get; set; }
    }
}
