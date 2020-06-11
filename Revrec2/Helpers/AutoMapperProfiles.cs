using System;
using System.Collections.Generic;
using AutoMapper;
using System.Linq;
using System.Threading.Tasks;
using Revrec2.Models;
using Revrec2.DTOs;
using static Revrec2.Models.Report;

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
            CreateMap<ReportOperational, ReportOperationlDto>()
                .ForMember(dest => dest.Total_Member_Resolved, opt => opt.MapFrom(src => src.MR_total.GetValueOrDefault(0)))
                .ForMember(dest => dest.Total_Member_Unresolved, opt => opt.MapFrom(src => src.MU_total.GetValueOrDefault(0)))
                .ForMember(dest => dest.Total_Nonmember_Resolved, opt => opt.MapFrom(src => src.NR_total.GetValueOrDefault(0)))
                .ForMember(dest => dest.Total_Nonmember_Unresolved, opt => opt.MapFrom(src => src.NU_total.GetValueOrDefault(0)));
            CreateMap<ReportFinancial, ReportFinancialDto>()
                .ForMember(dest => dest.Overpay_Member_Resolved, opt => opt.MapFrom(src => src.MR_overpay_sum.GetValueOrDefault(0)))
                .ForMember(dest => dest.Overpay_Member_Unresolved, opt => opt.MapFrom(src => src.MU_overpay_sum.GetValueOrDefault(0)))
                .ForMember(dest => dest.Overpay_Nonmember_Resolved, opt => opt.MapFrom(src => src.NR_overpay_sum.GetValueOrDefault(0)))
                .ForMember(dest => dest.Overpay_Nonmember_Unresolved, opt => opt.MapFrom(src => src.NU_overpay_sum.GetValueOrDefault(0)))
                .ForMember(dest => dest.Underpay_Member_Resolved, opt => opt.MapFrom(src => src.MR_underpay_sum.GetValueOrDefault(0)))
                .ForMember(dest => dest.Underpay_Member_Unresolved, opt => opt.MapFrom(src => src.MU_underpay_sum.GetValueOrDefault(0)))
                .ForMember(dest => dest.Underpay_Nonmember_Resolved, opt => opt.MapFrom(src => src.NR_underpay_sum.GetValueOrDefault(0)))
                .ForMember(dest => dest.Underpay_Nonmember_Unresolved, opt => opt.MapFrom(src => src.NU_underpay_sum.GetValueOrDefault(0)))
                .ForMember(dest => dest.Overpay_Member_Resolved_Count, opt => opt.MapFrom(src => src.MR_overpay_count.GetValueOrDefault(0)))
                .ForMember(dest => dest.Overpay_Member_Unresolved_Count, opt => opt.MapFrom(src => src.MU_overpay_count.GetValueOrDefault(0)))
                .ForMember(dest => dest.Overpay_Nonmember_Resolved_Count, opt => opt.MapFrom(src => src.NR_overpay_count.GetValueOrDefault(0)))
                .ForMember(dest => dest.Overpay_Nonmember_Unresolved_Count, opt => opt.MapFrom(src => src.NU_overpay_count.GetValueOrDefault(0)))
                .ForMember(dest => dest.Underpay_Member_Resolved_Count, opt => opt.MapFrom(src => src.MR_underpay_count.GetValueOrDefault(0)))
                .ForMember(dest => dest.Underpay_Member_Unresolved_Count, opt => opt.MapFrom(src => src.MU_underpay_count.GetValueOrDefault(0)))
                .ForMember(dest => dest.Underpay_Nonmember_Resolved_Count, opt => opt.MapFrom(src => src.NR_underpay_count.GetValueOrDefault(0)))
                .ForMember(dest => dest.Underpay_Nonmember_Unresolved_Count, opt => opt.MapFrom(src => src.NU_underpay_count.GetValueOrDefault(0))
                );
            CreateMap<ReportProductivityPaged, ReportProductivityDto>();
        }
    }
}
