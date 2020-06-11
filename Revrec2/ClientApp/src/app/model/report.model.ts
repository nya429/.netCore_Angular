export interface Report {
  month: number;
  column: string;
  value: string;
}

export interface ReportOperational {
  month: string;
  total_Member_Resolved: number;
  total_Member_Unresolved: number;
  total_Nonmember_Resolved: number;
  total_Nonmember_Unresolved: number;
}

export interface ReportOperationalDetail {
  discrepancyStatusID: number;
  discrepancyStatus: string;
  varianceCount: number;
  varianceSum: number;
}

export interface ReportFinancial {
  month: string;
  Underpay_Member_Unresolved: number;
  Overpay_Member_Unresolved: number;
  Underpay_Member_Resolved: number;
  Overpay_Member_Resolved: number;
  Underpay_Nonmember_Unresolved: number;
  Overpay_Nonmember_Unresolved: number;
  Underpay_Nonmember_Resolved: number;
  Overpay_Nonmember_Resolved: number;
  Underpay_Member_Unresolved_Count: number;
  Overpay_Member_Unresolved_Count: number;
  Underpay_Member_Resolved_Count: number;
  Overpay_Member_Resolved_Count: number;
  Underpay_Nonmember_Unresolved_Count: number;
  Overpay_Nonmember_Unresolved_Count: number;
  Underpay_Nonmember_Resolved_Count: number;
  Overpay_Nonmember_Resolved_Count: number;
}


export interface ReportProductivity {
  userID: number;
  dateTime: string;
  endDate: string;
  countDiscrepancy: number;
  countInFlow: number;
  countOutFlow: number;
  countOutStanding: number;
  countTriage: number;
}

export interface ReportProductivityGroup {
  userID: number;
  dateTime: string;
  endDate: string;
  countDiscrepancy: number;
  countInFlow: number;
  countOutFlow: number;
  countOutStanding: number;
  countTriage: number;
  detail: ReportProductivityDetailGroup
}


export interface ReportProductivityDetailGroup {
  list: ReportProductivity[], 
  timeSpan: { startDate: string, endDate: string },
  checkPointType: string
}