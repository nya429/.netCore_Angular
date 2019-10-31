using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Revrec2.Models
{
    public partial class Members
    {
        public int MasterPatientID { get; set; }
        public long CCAID { get; set; }
        public string MMIS_MMIS_ID { get; set; }
        public string MemberFirstName { get; set; }
        public string MemberMiddleName { get; set; }
        public string MemberLastName { get; set; }
        public string Gender { get; set; }
        public DateTime? DOB { get; set; }
        public string DOD { get; set; }
        public string Product { get; set; }
        //public DateTime? UpdateDate { get; set; }
        public DateTime? EnrollStartDate { get; set; }
        public DateTime? EnrollEndDate { get; set; }
        public string RatingCategory { get; set; }
        public DateTime? RatingCategoryStartDate { get; set; }
        public DateTime? RatingCategoryEndDate { get; set; }
        public string Region { get; set; }
        public DateTime? RegionStartDate { get; set; }
        public DateTime? RegionEndDate { get; set; }
        public string PatientPay { get; set; }
        public DateTime? PatientPayStartDate { get; set; }
        public DateTime? PatientPayEndDate { get; set; }
        public string PatientSpendDown { get; set; }
        public DateTime? PatientSpendDownStartDate { get; set; }
        public DateTime? PatientSpendDownEndDate { get; set; }
        public int? RateCardID { get; set; }
        public int? CCARateCellID { get; set; }
        public int? CCARegionID { get; set; }
        public Decimal? Amount { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public bool? ActiveFlag { get; set; }
        public string MemberEnrollmentStatus { get; set; }
        public int? totalDiscrepancies { get; set; }
        public int? TotalAssigned { get; set; }
        public int? maxAging { get; set; }
        public Decimal? absoluteVarianceSum { get; set; }
    }

    public partial class MembersPaged
    {
        public int MasterPatientID { get; set; }
        public string MemberFirstName { get; set; }
        public string MemberMiddleName { get; set; }
        public string MemberLastName { get; set; }
        public string MMIS_MMIS_ID { get; set; }
        public long CCAID { get; set; }
        public string Product { get; set; }
        public DateTime? EnrollStartDate { get; set; }
        public DateTime? EnrollEndDate { get; set; }
        public DateTime? DOB { get; set; }
        public string DOD { get; set; }        
        public string RatingCategory { get; set; }
        public string Region { get; set; }
        public string MemberEnrollmentStatus { get; set; }
        public int? totalDiscrepancies { get; set; }
        public int? TotalAssigned { get; set; }
        public int? maxAging { get; set; }
        public Decimal? absoluteVarianceSum { get; set; }
        public int ResultCount { get; set; }
    }

    public partial class MembersByNamePaged
    {
        public int MasterPatientID { get; set; }
        public string MemberFirstName { get; set; }
        public string MemberMiddleName { get; set; }
        public string MemberLastName { get; set; }
        public string MMIS_MMIS_ID { get; set; }
        public long CCAID { get; set; }
    }
}
