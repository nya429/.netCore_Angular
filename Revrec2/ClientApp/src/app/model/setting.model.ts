import { DiscrepancyCategory } from 'src/app/model/setting.model';
  export interface CCARateCell {
    ccaRateCellID: number;
    ccaRateCell: string;
    product: string;
  }
  
  export interface CCARegion {
    ccaRegionID: number;
    ccaRegion: string;
    product: string;
  }
  
  
  
  export interface RateCard {
    rateCardId: number;
    ccaRateCellId: number;
    ccaRateCell: string;
    ccaRegionId: number;
    ccaRegion: string;
    startDate: Date;
    endDate: Date;
    amount: number;
    product: string;
    activeFlag: boolean;
    eligibility: string;
    rateCardLabel: string;
  }
  
  export interface RateCardCreateForm {
    ccarateCellId: number;
    ccaregionId: number;
    startDate: Date;
    endDate: Date;
    amount: number;
    product: string;
    activeFlag: boolean;
    rateCardLabel: string;
  }
  
  export interface RateCardCreateForm {
    ccarateCellId: number;
    ccaregionId: number;
    startDate: Date;
    endDate: Date;
    amount: number;
    product: string;
    activeFlag: boolean;
    rateCardLabel: string;
  }
  
  // export interface DiscrepancyStatusCreateForm {
  //   discrepancyStatus: string;
  //   discrepancyStatusDescription: string;
  //   discrepancyCategoryID: number;
  //   activeFlag: boolean;
  // }
  
  
  export interface DiscrepancyStatus {
    discrepancyStatusId: number;
    discrepancyStatus: string;
    discrepancyStatusDescription: string;
    discrepancyCategoryID: number;
    discrepancyCategory: string;
    discrepancyStatusType: number;
    discrepancyCategoryDescription: string;
    activeFlag: boolean;
  }
  
  export interface DiscrepancyCategory {
    discrepancyCategoryID: number;
    discrepancyCategory: string;
    discrepancyCategoryDescription: string;
    discrepancyCategoryDisplay: boolean;
    activeFlag: boolean;
  }
  
  export interface DiscrepancyStatusOption {
    discrepancyStatusID: number;
    discrepancyStatus: string;
    discrepancyCategory: number;
    discrepancyCategoryDisplay: boolean;
  }
  
  export interface DiscrepancyCategoryOption {
    discrepancyCategoryID: number;
    discrepancyCategory: string;
  }
  
  export interface RateCellMap {
    rateCellMapID: number;
    mmisProduct: string;
    ccaRateCell: string;
    ccaRateCellID: number;
    mmisRateCell: string;
    mmisRateCellID: number;
    activeFlag: boolean;
  }
  
  export interface RegionMap {
    regionMapID: number;
    mmisProduct: string;
    ccaRegion: string;
    ccaRegionID: number;
    mmisRegion: string;
    mmisRegionID: number;
    activeFlag: boolean;
  }
  
  export interface pageParamsLocalStorage {
    regionMapID: number;
    mmisProduct: string;
    ccaRegion: string;
    ccaRegionID: number;
    mmisRegion: string;
    mmisRegionID: number;
    activeFlag: boolean;
  }

  export interface pageParamsWorkList {

  }
  
  