using System;

namespace Revrec2.Models
{
    public partial class DiscrepancyCategories
    {
        public int DiscrepancyCategoryID { get; private set; }
        public string DiscrepancyCategory { get; private set; }
        public string DiscrepancyCategoryDescription { get; private set; }
        public bool? DiscrepancyCategoryDisplay { get; private set; }
        public bool? ActiveFlag { get; private set; }
        public DateTime? InsertDate { get; private set; }
        public DateTime? UpdateDate { get; private set; }
    }
    public partial class DiscrepancyCategoriesPaged
    {
        public int DiscrepancyCategoryID { get; private set; }
        public string DiscrepancyCategory { get; private set; }
        public string DiscrepancyCategoryDescription { get; private set; }        
        public bool? DiscrepancyCategoryDisplay { get; private set; }
        public bool? ActiveFlag { get; private set; }
        public DateTime? InsertDate { get; private set; }
        public DateTime? UpdateDate { get; private set; }
        public int ResultCount { get; private set; }
    }

    public class DiscrepancyCategoryOption
    {
        public int? DiscrepancyCategoryID { get; private set; }
        public string DiscrepancyCategory { get; private set; }
    }
}
