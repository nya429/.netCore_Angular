export interface ExploreRateCell {
    mmis_id: number,
    ccaid: number,
    memberMonth: string,
    mp_RateCell: string,
    mh834_RateCell: string,
    mh834_LastAssessedDate: string,
    cmp_RateCell: string,
    cmp_LastAssessDate: string
    cmp_Source: string
    match_CMPToMH834: string,
    match_CMPToMP: string,
    match_MH834ToCMP: string,
    match_MH834ToMP: string,
    match_MPToCMP: string,
    match_MPToMH834: string,
}