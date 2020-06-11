using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Revrec2.DTOs
{
    public class MemberListRequestDto
    {
        public int? MasterPatientID { get; set; }
        public string Name { get; set; }
        public long? CCAID { get; set; }
        public string MMIS_ID { get; set; }
        public int? IncludeZeroDiscrepancy { get; set; }
        public int? AssigneeID { get; set; }
        public int? ExportAll { get; set; }
        public int? PageIndex { get; set; }
        public int? PageSize { get; set; }
        public string SortBy { get; set; }
        public int? OrderBy { get; set; }
    }
    public class MemberForListDto
    {
        public int MasterPatientID { get; private set; }
        public string MemberFirstName { get; private set; }
        public string MemberMiddleName { get; private set; }
        public string MemberLastName { get; private set; }
        public string MMIS_MMIS_ID { get; private set; }
        public long CCAID { get; private set; }
        public string Product { get; private set; }
        public DateTime? EnrollStartDate { get; private set; }
        public DateTime? EnrollEndDate { get; private set; }
        public DateTime? DOB { get; private set; }
        public string DOD { get; private set; }
        public string RatingCategory { get; private set; }
        public string Region { get; private set; }
        public string MemberEnrollmentStatus { get; private set; }
        public int? totalDiscrepancies { get; private set; }
        public int? TotalAssigned { get; set; }
        public int? maxAging { get; private set; }
        public Decimal? absoluteVarianceSum { get; private set; }
        public int ResultCount { get; private set; }
    }

    public class MemberByNameListDto
    {
        public int MasterPatientID { get; private set; }
        public string MemberFirstName { get; private set; }
        public string MemberMiddleName { get; private set; }
        public string MemberLastName { get; private set; }
        public string MMIS_MMIS_ID { get; private set; }
        public long CCAID { get; private set; }
    }

    public class DiscrepancyUpdateForMultipleMembersRequestDto
    {
        public MemberIDs MemberIds { get; set; }
        public int? DiscrepancyStatusId { get; set; }
        public int? Assigned_UserID { get; set; }
        public DateTime? DueDate { get; set; }
        public string DiscrepancyComment { get; set; }
    }

    public class DiscrepancyUpdateByFiltersRequestDto
    {
        public string Name { get; set; }
        public long? CCAID { get; set; }
        public string MMIS_ID { get; set; }
        public int IncludeZeroDiscrepancy { get; set; }
        public MemberIDs MemberIds { get; set; }
        public int? DiscrepancyStatusId { get; set; }
        public int? Assigned_UserID { get; set; }
        public DateTime? DueDate { get; set; }
        public string DiscrepancyComment { get; set; }
    }

    public class MemberID
    {
        public int UpdateID { get; set; }
    }

    public class MemberIDs
    {
        public List<MemberID> MemberID { get; set; }
    }
}
