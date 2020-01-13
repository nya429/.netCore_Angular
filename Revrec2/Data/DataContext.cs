using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Revrec2.Models;
using Microsoft.EntityFrameworkCore;

namespace Revrec2.Data
{
    public class DataContext: DbContext
    {
        public DataContext(DbContextOptions<DataContext> options) : base(options) { }

        /** DbQuery => Maps to View | DbSet => Maps to Table */
        public DbQuery<RateCard> RateCards { get; set; }
        public DbQuery<DiscrepancyStatuses> DiscrepancyStatuses { get; set; }
        public DbQuery<DiscrepancyCategories> DiscrepancyCategories { get; set; }
        public DbQuery<CCARateCells> CcarateCells { get; set; }
        public DbQuery<CCARegions> Ccaregions { get; set; }
        public DbQuery<MemberMap> MemberMaps { get; set; }
        public DbQuery<MmismemberData> MmismemberData { get; set; }
        public DbQuery<MmismultiMap> MmismultiMaps { get; set; }
        public DbQuery<MmisrateCells> MmisrateCells { get; set; }
        public DbQuery<Mmisregions> Mmisregions { get; set; }
        public DbQuery<RateCellMap> RateCellMap { get; set; }
        public DbQuery<RegionMap> RegionMaps { get; set; }
        public DbQuery<DiscrepancyRecord> DiscrepancyRecords { get; set; }
        public DbQuery<Members> Members { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618

            // modelBuilder.Query<MODEL_NAME>().ToView("VIEW_NAME");

            modelBuilder.Query<RateCard>().ToView("vwRateCard");

            modelBuilder.Query<RateCardPaged>();

            modelBuilder.Query<DiscrepancyStatuses>().ToView("vwDiscrepancyStatuses");

            modelBuilder.Query<DiscrepancyStatusesPaged>();

            modelBuilder.Query<DiscrepancyStatusOption>();

            modelBuilder.Query<DiscrepancyCategories>().ToView("vwDiscrepancyCategories");

            modelBuilder.Query<DiscrepancyCategoriesPaged>();

            modelBuilder.Query<DiscrepancyCategoryOption>();

            modelBuilder.Query<CCARateCells>().ToView("vwCCARateCells");

            modelBuilder.Query<RateCellMap>().ToView("vwCCARateCells");

            modelBuilder.Query<RateCellMapPaged>();
           
            modelBuilder.Query<CCARegions>().ToView("vwCCARegions ");

            modelBuilder.Query<RegionMap>().ToView("vwRegionMap");

            modelBuilder.Query<RegionMapPaged>();

            modelBuilder.Query<UnmappedMMISRegions>().ToView("vwGetUnmappedMMISRegionCount");

            modelBuilder.Query<UnmappedMMISRateCells>().ToView("vwGetUnmappedMMISRateCellCount");

            modelBuilder.Query<DiscrepancyRecordPaged>();

            modelBuilder.Query<DiscrepancyRecordByIdPaged>().ToView("vwGetDiscrepancyRecord");

            modelBuilder.Query<MonthlySummaryRecordMemberYearsPaged>().ToView("vwGetMonthlySummaryRecordMemberYears");

            modelBuilder.Query<MonthlySummaryRecordMemberMonthsPaged>().ToView("vwGetMonthlySummaryRecordMemberMonths");

            modelBuilder.Query<DiscrepancyCommentsPaged>().ToView("vwGetDiscrepancyCommentList");

            modelBuilder.Query<Members>().ToView("vwMemberData");

            modelBuilder.Query<MembersPaged>();

            modelBuilder.Query<MembersByNamePaged>();

            modelBuilder.Query<UsersForDropDown>();

            modelBuilder.Query<UsersListPaged>();

            modelBuilder.Query<UserRecordPaged>();

            modelBuilder.Query<ExplorerDetails>().ToView("vwExplorerDetails");

#pragma warning restore 612, 618
        }
    }
}
