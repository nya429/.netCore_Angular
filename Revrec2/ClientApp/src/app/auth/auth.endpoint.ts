type Link = {
    segment: string,
    description: string,
}

type EndpointSetting = {
    module: string,
    endpoint: string,
}

type LinkEndpointMap = {
    link: Link
    endpointSettings: EndpointSetting[]
}

const LinkSettings: LinkEndpointMap[] = [
    {
        link: { segment: 'ratecards', description: 'Rate Cards' },
        endpointSettings: [{ module: 'ratecard', endpoint: 'GetRateCardListByConAsync' }]
    },
    {
        link: { segment: 'ratecell-region-mappings', description: 'Rate Cell & Region Mappings' },
        endpointSettings: [{ module: 'ratecellmap', endpoint: 'GetRateCellMapListByConAsync' },
        { module: 'regionmap', endpoint: 'GetRegionMapListByConAsync' }]
    },
    {
        link: { segment: 'discrepancy-statuses', description: 'Discrepancy Statuses' },
        endpointSettings: [{ module: 'discrepancyStatues', endpoint: 'GetDiscrepancyStatusesListByConAsync' }]
    },
    {
        link: { segment: 'discrepancy-categories', description: 'Discrepancy Categories' },
        endpointSettings: [{ module: 'discrepancyCateogry', endpoint: 'GetDiscrepancyCategoryListByConAsync' }]
    },
    {
        link: { segment: 'users', description: 'Users' },
        endpointSettings: [{ module: 'user', endpoint: 'GetUsersListByConAsync' }]
    }];

const LinkReports: LinkEndpointMap[] = [
    {
        link: { segment: 'operational', description: 'Operational' },
        endpointSettings: [{ module: 'report', endpoint: 'GetReportOperationalList' }]
    },
    {
        link: { segment: 'financial', description: 'Financial' },
        endpointSettings: [{ module: 'report', endpoint: 'GetReportFinancialList' }]
    },
    {
        link: { segment: 'productivity', description: 'Productivity' },
        endpointSettings: []
    },
    {
        link: { segment: 'tableau', description: 'Revrec 1.0 Story' },
        endpointSettings: []
    }];


export { Link, EndpointSetting, LinkEndpointMap, LinkSettings, LinkReports };