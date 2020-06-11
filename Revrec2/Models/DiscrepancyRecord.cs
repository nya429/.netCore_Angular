using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Revrec2.Models
{
    public partial class DiscrepancyRecord
    {
        public int DiscrepancyID { get; set; }
        public int MonthlySummaryRecordID { get; set; }
        public int MasterPatientID { get; set; }
        public string MemberFirstName { get; set; }
        public string MemberLastName { get; set; }
        public string Product { get; set; }
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
        public int? DiscrepancyCommentID { get; set; }
        public int? ReplyDiscrepancyCommentID { get; set; }
        public int? Comment_UserID { get; set; }
        public string DiscrepancyComment { get; set; }
        public bool? DiscrepancyComment_ActiveFlag { get; set; }
        public DateTime? DiscrepancyComment_insertDate { get; set; }
        public DateTime? DiscrepancyComment_updateDate { get; set; }
        public string MMIS_MMIS_ID { get; set; }
        public long? CCAID { get; set; }
    }

    public partial class DiscrepancyRecordPaged
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
        public int ResultCount { get; set; }
        public bool HasDiscrepancyComment { get; set; }
        public int CountDiscrepancyComments { get; set; }
    }

    public partial class DiscrepancyRecordByIdPaged
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
        public string DiscrepancyCategory { get; set; }
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

    public partial class MonthlySummaryRecordMemberYearsPaged
    {
        public int? MemberYear { get; set; }
        public int Gap { get; set; }
    }

    public partial class MonthlySummaryRecordMemberMonthsPaged
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
        public string CCARateCell { get; set; }
        public int? CCARegionID { get; set; }
        public string CCARegion { get; set; }
        public decimal? CCAPatientPay { get; set; }
        public decimal? CCAPatientSpendDown { get; set; }
        public int? CCARateCardID { get; set; }
        public decimal? CCAAmount { get; set; }
        public decimal? CCANetAmount { get; set; }
        public int? MMISRateCellID { get; set; }
        public string MMISRateCell { get; set; }
        public int? MMISRegionID { get; set; }
        public string MMISRegion { get; set; }
        public decimal? MMISPatientPay { get; set; }
        public decimal? MMISPatientSpendDown { get; set; }
        public int? MMISRateCardID { get; set; }
        public decimal? MMISAmount { get; set; }
        public decimal? MMISNetAmount { get; set; }
    }
    public partial class DiscrepancyCommentsPaged
    {
        public int DiscrepancyCommentID { get; set; }
        public int DiscrepancyID { get; set; }
        public int? ReplyCommentID { get; set; }
        public int Comment_UserID { get; set; }
        public string DiscrepancyComment { get; set; }
        public string UserNameAD { get; set; }
        public string UserFirstName { get; set; }
        public string UserLastName { get; set; }
        public bool? ActiveFlag { get; set; }
        public DateTime? insertDate { get; set; }
        public DateTime? updateDate { get; set; }
    }

    public class ExplorerDetails
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

    public class TestReport {
        public DateTime memberMonth { get; set; }

        public int? Resolved { get; set; }

        public int? Unresolved { get; set; }
    }
}
