export interface Discrepancy {
    discrepancyID: number,
    monthlySummaryRecordID: number,
    masterPatientID: number,
    memberFirstName: string,
    memberLastName: string,
    product: string,
    memberMonth: string,
    variance: number,
    paymentError: number,
    baseCapitationAmount: number,
    patientPayAmountN: number
    patientPayAmountSCO: number,
    paidCapitationAmount: number,
    ccaRateCellID: number,
    ccaRegionID: number,
    ccaRateCell: string,
    ccaRegion: string,
    ccaPatientPay: number,
    ccaPatientSpendDown: number,
    ccaRateCardID: number,
    ccaAmount: number,
    ccaNetAmount: number,
    mmisRateCellID: number,
    mmisRegionID: number,
    mmisRateCell: string,
    mmisRegion: string,
    mmisPatientPay: number,
    mmisPatientSpendDown: number,
    mmisRateCardID: number,
    mmisAmount: number,
    mmisNetAmount: number,
    typeRateCell: boolean,
    typeRegion: boolean,
    typePatientPay: boolean,
    typePatientSpendDown: boolean,
    typePaymentError: boolean,
    assigned_UserID: number,
    action_UserID: number,
    discrepancyStatusID: number,
    assigned_UserName: string,
    action_UserName: string,
    discrepancyStatus: string,
    dueDate: string,
    discoverDate: string,
    resolvedDate: string,
    balanced: boolean,
    activeFlag: boolean,
    insertDate: string,
    updateDate: string,
    mmiS_MMIS_ID: string,
    ccaid: number,
    hasDiscrepancyComment: number,
    countDiscrepancyComments: number,
}

export interface DiscrepancyListRequest {
    name: string,
    CCAID: number,
    MMIS_ID: string,
    MasterPatientID: number,
    hasComment: number,
    discoverDateStart: string,
    discoverDateEnd: string,
    resolutionDateStart: string,
    resolutionDateEnd: string,
    includeResolved: number,
    months: {
        BulkDate: { UpdateDate: string }[]
    },
    programs: {
        BulkText: { UpdateText: string }[]
    },
    ccaRateCellIds: {
        BulkID: { UpdateID: number }[]
    },
    discrepancyStatusIDs: {
        BulkID: { UpdateID: number }[]
    },
    assigneeIDs: {
        BulkID: { UpdateID: number }[]
    }
}


