using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Revrec2.DTOs
{
    public class DiscrepancyRecordListRequestDto
    {
        public string Name { get; set; }
        public long? CCAID { get; set; }
        public string MMIS_ID { get; set; }
        public int? MasterPatientID { get; set; }
        public Months Months { get; set; }
        public Programs Programs { get; set; }
        public AssigneeIDs CCARateCellIDs { get; set; }
        public AssigneeIDs DiscrepancyStatusIDs { get; set; }
        public AssigneeIDs AssigneeIDs { get; set; }
        public int? HasComment { get; set; }
        public DateTime? DiscoverDateStart { get; set; }
        public DateTime? DiscoverDateEnd { get; set; }
        public DateTime? ResolutionDateStart { get; set; }
        public DateTime? ResolutionDateEnd { get; set; }
        public int? VarianceSign { get; set; }
        public int IncludeResolved { get; set; }
        public int? TypeRateCell { get; set; }
        public int? TypeRegion { get; set; }
	    public int? TypePatientPay { get; set; }
	    public int? TypePatientSpendDown { get; set; }
	    public int? TypePaymentError { get; set; }
        public int? MemberEnrollmentStatusId { get; set; }
        public int? MemberIsEnrolled { get; set; }
        public int? ExportAll { get; set; }
        public int? PageIndex { get; set; }
        public int? PageSize { get; set; }
        public string SortBy { get; set; }
        public int? OrderBy { get; set; }
    }

    public class BulkID
    {
        public int UpdateID { get; set; }
    }

    public class AssigneeIDs
    {
        public List<BulkID> BulkID { get; set; }
    }

    public class BulkText
    {
        public string UpdateText { get; set; }
    }

    public class Programs
    {
        public List<BulkText> BulkText { get; set; }
    }

    public class BulkDate
    {
        public DateTime UpdateDate { get; set; }
    }

    public class Months
    {
        public List<BulkDate> BulkDate { get; set; }
    }

    public class MonthlySummaryRecordMemberMonthsListRequestDto
    {
        public int MasterPatientID { get; set; }
        public string MemberYear { get; set; }
    }

    public class DiscrepancyRecordForCreateDto
    {
        public int? AssigneeID { get; set; }
        public int? DiscrepancyStatusID { get; set; }
        public DateTime? DueDate { get; set; }
        public DiscrepancyRecordForListDto discrepancy { get; set; }
        public bool AssignmentChanged { get; set; }
    }

    public class DiscrepancyRecordForUpdateDto
    {
        public AssigneeIDs DiscrepancyIDs { get; set; }
        public List<DiscrepancyRecordByIdForListDto> Discrepancies { get; set; }
        public int? DiscrepancyStatusID { get; set; }
        public int? Assigned_UserID { get; set; }
        public DateTime? DueDate { get; set; }
        public string DiscrepancyComment { get; set; }
    }

    public class DiscrepancyRecordUpdateBulkFiltersDto
    {
        public long? CCAID { get; set; }
        public string MMIS_ID { get; set; }
        public int? MasterPatientID { get; set; }
        public Months Months { get; set; }
        public Programs Programs { get; set; }
        public AssigneeIDs CCARateCellIDs { get; set; }
        public AssigneeIDs DiscrepancyStatusIDs { get; set; }
        public AssigneeIDs AssigneeIDs { get; set; }
        public int? HasComment { get; set; }
        public DateTime? DiscoverDateStart { get; set; }
        public DateTime? DiscoverDateEnd { get; set; }
        public DateTime? ResolutionDateStart { get; set; }
        public DateTime? ResolutionDateEnd { get; set; }
        public AssigneeIDs DiscrepancyIDs { get; set; }
        public int? DiscrepancyStatusID { get; set; }
        public int? Assigned_UserID { get; set; }
        public DateTime? DueDate { get; set; }
        public string DiscrepancyComment { get; set; }
    }

    public class DiscrepancyRecordForListDto
    {
        public int DiscrepancyID { get; set; }
        public int MonthlySummaryRecordID { get; set; }
        public int MasterPatientID { get; set; }
        public string MemberFirstName { get; set; }
        public string MemberLastName { get; set; }
        public string Product { get; set; }
        public string MemberEnrollmentStatus { get; set; }
        public DateTime MemberMonth { get; set; }
        public decimal? Variance { get; set; }
        public decimal? PaymentError { get; set; }
        public decimal BaseCapitationAmount { get; set; }
        public decimal PatientPayAmountN { get; set; }
        public decimal PatientPayAmountSCO { get; set; }
        public decimal PaidCapitationAmount { get; set; }
        public int? CCARateCellID { get; set; }
        public int? CCARegionID { get; set; }
        public string CCARateCell { get; set; }
        public string CCARegion { get; set; }
        public decimal? CCAPatientPay { get; set; }
        public decimal? CCAPatientSpendDown { get; set; }
        public int? CCARateCardID { get; set; }
        public decimal? CCAAmount { get; set; }
        public decimal? CCANetAmount { get; set; }
        public int? MMISRateCellID { get; set; }
        public int? MMISRegionID { get; set; }
        public string MMISRateCell { get; set; }
        public string MMISRegion { get; set; }
        public decimal? MMISPatientPay { get; set; }
        public decimal? MMISPatientSpendDown { get; set; }
        public int? MMISRateCardID { get; set; }
        public decimal? MMISAmount { get; set; }
        public decimal? MMISNetAmount { get; set; }
        public bool TypeRateCell { get; set; }
        public bool TypeRegion { get; set; }
        public bool TypePatientPay { get; set; }
        public bool TypePatientSpendDown { get; set; }
        public bool TypePaymentError { get; set; }
        public int? Assigned_UserID { get; set; }
        public string Assigned_UserName { get; set; }
        public int? Action_UserID { get; set; }
        public string Action_UserName { get; set; }
        public int? DiscrepancyStatusID { get; set; }
        public string DiscrepancyStatus { get; set; }
        public string DiscrepancyCategory { get; set; }
        public DateTime? DueDate { get; set; }
        public DateTime? DiscoverDate { get; set; }
        public DateTime? ResolvedDate { get; set; }
        public bool? Balanced { get; set; }
        public bool? ActiveFlag { get; set; }
        public DateTime? insertDate { get; set; }
        public DateTime? updateDate { get; set; }
        public string MMIS_MMIS_ID { get; set; }
        public long CCAID { get; set; }
        public bool HasDiscrepancyComment { get; set; }
        public int CountDiscrepancyComments { get; set; }
    }

    public class DiscrepancyRecordByIdForListDto
    {
        public int DiscrepancyID { get; set; }
        public int MonthlySummaryRecordID { get; set; }
        public int MasterPatientID { get; set; }
        public DateTime MemberMonth { get; set; }
        public decimal? Variance { get; set; }
        public decimal? PaymentError { get; set; }
        public decimal BaseCapitationAmount { get; set; }
        public decimal PatientPayAmountN { get; set; }
        public decimal PatientPayAmountSCO { get; set; }
        public decimal PaidCapitationAmount { get; set; }
        public int? CCARateCellID { get; set; }
        public int? CCARegionID { get; set; }
        public string CCARateCell { get; set; }
        public string CCARegion { get; set; }
        public decimal? CCAPatientPay { get; set; }
        public decimal? CCAPatientSpendDown { get; set; }
        public int? CCARateCardID { get; set; }
        public decimal? CCAAmount { get; set; }
        public decimal? CCANetAmount { get; set; }
        public int? MMISRateCellID { get; set; }
        public int? MMISRegionID { get; set; }
        public string MMISRateCell { get; set; }
        public string MMISRegion { get; set; }
        public decimal? MMISPatientPay { get; set; }
        public decimal? MMISPatientSpendDown { get; set; }
        public int? MMISRateCardID { get; set; }
        public decimal? MMISAmount { get; set; }
        public decimal? MMISNetAmount { get; set; }
        public bool TypeRateCell { get; set; }
        public bool TypeRegion { get; set; }
        public bool TypePatientPay { get; set; }
        public bool TypePatientSpendDown { get; set; }
        public bool TypePaymentError { get; set; }
        public int? Assigned_UserID { get; set; }
        public string Assigned_UserName { get; set; }
        public int? Action_UserID { get; set; }
        public int? DiscrepancyStatusID { get; set; }
        public DateTime? DueDate { get; set; }
        public DateTime? DiscoverDate { get; set; }
        public DateTime? ResolvedDate { get; set; }
        public bool? Balanced { get; set; }
        public bool? ActiveFlag { get; set; }
        public DateTime? insertDate { get; set; }
        public DateTime? updateDate { get; set; }
        public string DiscrepancyStatus { get; set; }
        // public string AssignedUserName { get; set; }
    }

    public class MonthlySummaryRecordMemberYearsForListDto
    {
        public int? MemberYear { get; set; }
        public int Gap { get; set; }
    }

    public class MonthlySummaryRecordMemberMonthsForListDto
    {
        public int MonthlySummaryRecordID { get; set; }
        public int MasterPatientID { get; set; }
        public string MMIS_ID { get; set; }
        public DateTime MemberMonth { get; set; }
        public decimal? Variance { get; set; }
        public decimal? PaymentError { get; set; }
        public decimal BaseCapitationAmount { get; set; }
        public decimal PatientPayAmountN { get; set; }
        public decimal PatientPayAmountSCO { get; set; }
        public decimal PaidCapitationAmount { get; set; }
        public int? CCARateCellID { get; set; }
        public int? CCARegionID { get; set; }
        public string CCARateCell { get; set; }
        public string CCARegion { get; set; }
        public decimal? CCAPatientPay { get; set; }
        public decimal? CCAPatientSpendDown { get; set; }
        public int? CCARateCardID { get; set; }
        public decimal? CCAAmount { get; set; }
        public decimal? CCANetAmount { get; set; }
        public int? MMISRateCellID { get; set; }
        public int? MMISRegionID { get; set; }
        public string MMISRateCell { get; set; }
        public string MMISRegion { get; set; }
        public decimal? MMISPatientPay { get; set; }
        public decimal? MMISPatientSpendDown { get; set; }
        public int? MMISRateCardID { get; set; }
        public decimal? MMISAmount { get; set; }
        public decimal? MMISNetAmount { get; set; }
    }

    public class DiscrepancyCommentsForListDto
    {
        public int DiscrepancyCommentID { get; set; }
        public int DiscrepancyID { get; set; }
        public int? ReplyCommentID { get; set; }
        public int Comment_UserID { get; set; }
        public string UserFirstName { get; set; }
        public string UserLastName { get; set; }
        public string DiscrepancyComment { get; set; }
        public bool? ActiveFlag { get; set; }
        public DateTime? insertDate { get; set; }
        public DateTime? updateDate { get; set; }
    }

    public class DiscrepancyCommentForCreateDto
    {
        public int DiscrepancyID { get; set; }
        public int? ReplyCommentID { get; set; }
        public string DiscrepancyComment { get; set; }
        public bool ActiveFlag { get; set; }
    }

    public class DiscrepancyCommentForCreatWrapperDto
    {
        public DiscrepancyCommentForCreateDto discrepancyCommentForCreateDto { get; set; }
        public List<int> anchoredUserIds { get; set; }
        public int masterPatientID { get; set; }
    }

    public class DiscrepancyCommentForUpdateDto
    {
        public int DiscrepancyCommentID { get; set; }
        public string DiscrepancyComment { get; set; }
        public bool ActiveFlag { get; set; }
    }

    public class DiscrepancyAssignmentUnreadCount
    {
        public int AssignedUserID { get; set; }
        public string ActionUserName { get; set; }
        public int UnreadCount { get; set; }
        public string EntryTime { get; set; }
    }

    public class CommentNotification
    {
        public int MasterPatientID { get; set; }
        public int DiscrepancyID { get; set; }
        public int DiscrepancyCommentID { get; set; }
    }

    public class NotificationDto
    {
        public int AnchoredUserID { get; set; }
        public string ActionUserName { get; set; }
        public string NotificationType { get; set; }
        public string EntryTime { get; set; }
        public string NotificationStr { get; set; }
    }
    public class ExplorerDetailsRequestDto
    {
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
    }

    public class ExplorerDetailsDto
    { 
        public long? CCAID { get; set; }
        public string MMIS_ID { get; set; }
        public DateTime memberMonth { get; set; }
        public string MP_RateCell { get; set; }
        public string CMP_Source { get; set; }
        public string CMP_RateCell { get; set; }
        public string MH834_RateCell { get; set; }
        public DateTime? MH834_LastAssessedDate { get; set; }
        public DateTime? CMP_LastAssessedDate { get; set; }

        public string Match_MPToCMP { get; set; }
        public string Match_MPToMH834 { get; set; }
        public string Match_MH834ToCMP { get; set; }
        public string Match_MH834ToMP { get; set; }
        public string Match_CMPToMP { get; set; }
        public string Match_CMPToMH834 { get; set; }
    }
}
