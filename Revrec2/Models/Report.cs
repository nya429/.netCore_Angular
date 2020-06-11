using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Revrec2.Models
{
    public class Report
    {
        public partial class ReportOperational
        {
            public DateTime Month { get; set; }
            public int? MR_total { get; set; }
            public int? MU_total { get; set; }
            public int? NR_total { get; set; }
            public int? NU_total { get; set; }
        }

        public partial class ReportOperationalDetail
        {
            public int  DiscrepancyStatusID  { get; set; }
            public string DiscrepancyStatus { get; set; }
            public int VarianceCount { get; set; }
            public decimal VarianceSum { get; set; }
        }

        public partial class ReportFinancial
        {
            public DateTime Month { get; set; }
            public decimal? MR_overpay_sum { get; set; }
            public decimal? MR_overpay_count { get; set; }
            public decimal? MR_underpay_sum { get; set; }
            public decimal? MR_underpay_count { get; set; }
            public decimal? MU_overpay_sum { get; set; }
            public decimal? MU_overpay_count { get; set; }
            public decimal? MU_underpay_sum { get; set; }
            public decimal? MU_underpay_count { get; set; }
            public decimal? NR_overpay_sum { get; set; }
            public decimal? NR_overpay_count { get; set; }
            public decimal? NR_underpay_sum { get; set; }
            public decimal? NR_underpay_count { get; set; }
            public decimal? NU_overpay_sum { get; set; }
            public decimal? NU_overpay_count { get; set; }
            public decimal? NU_underpay_sum { get; set; }
            public decimal? NU_underpay_count { get; set; }
        }


        public partial class ReportProductivity
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

        public partial class ReportProductivityPaged: ReportProductivity
        {
           public int ResultCount { get; set; }
        }
    }
}
