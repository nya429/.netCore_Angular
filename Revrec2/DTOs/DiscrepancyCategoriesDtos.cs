﻿namespace Revrec2.DTOs
{
    public class DiscrepancyCategoriesListRequestDto
    {        
        public int? PageIndex { get; set; }
        public int? PageSize { get; set; }
        public string SortBy { get; set; }
        public int? OrderBy { get; set; }
    }
    public class DiscrepancyCategoriesForListDto
    {        
        public int? DiscrepancyCategoryID { get; private set; }        
        public string DiscrepancyCategory { get; private set; }
        public string DiscrepancyCategoryDescription { get; private set; }
        public bool? DiscrepancyCategoryDisplay { get; private set; }
        public bool? ActiveFlag { get; private set; }       
    }
    public class DiscrepancyCategoriesForCreateDto
    {        
        public string DiscrepancyCategory { get; set; }
        public string DiscrepancyCategoryDescription { get; set; }
        public bool DiscrepancyCategoryDisplay { get; set; }
        public bool ActiveFlag { get; set; }        
    }
}
