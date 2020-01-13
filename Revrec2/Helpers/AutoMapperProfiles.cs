using System;
using System.Collections.Generic;
using AutoMapper;
using System.Linq;
using System.Threading.Tasks;
using Revrec2.Models;
using Revrec2.DTOs;

namespace Revrec2.Helpers
{
    public class AutoMapperProfiles : Profile
    {
        public AutoMapperProfiles()
        {
            CreateMap<RateCardPaged, RateCardForListDto>();
            CreateMap<DiscrepancyCategoriesPaged, DiscrepancyCategoriesForListDto>();
            CreateMap<DiscrepancyStatusesPaged, DiscrepancyStatusesForListDto>();
            CreateMap<RateCellMapPaged, RateCellMapForListDto>();
            CreateMap<RegionMapPaged, RegionMapForListDto>();
            CreateMap<DiscrepancyRecordPaged, DiscrepancyRecordForListDto>();
            CreateMap<DiscrepancyRecordByIdPaged, DiscrepancyRecordByIdForListDto>();
            CreateMap<MonthlySummaryRecordMemberYearsPaged, MonthlySummaryRecordMemberYearsForListDto>();
            CreateMap<MonthlySummaryRecordMemberMonthsPaged, MonthlySummaryRecordMemberMonthsForListDto>();
            CreateMap<DiscrepancyCommentsPaged, DiscrepancyCommentsForListDto>();
            CreateMap<MembersPaged, MemberForListDto>();
            CreateMap<MembersByNamePaged, MemberByNameListDto>();
            CreateMap<UsersListPaged, UsersListDto>();
            CreateMap<ExplorerDetails, ExplorerDetailsDto>();
        }
    }
}
