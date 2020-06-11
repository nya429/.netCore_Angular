export interface PagedList<T> {
    list: T[];
    count: number;
    pageSize: number;
    pageIndex: number;
    sortBy: string;
    orderBy: number;
  }
  
  export interface ResponseList<T> {
    list: T[];
  }
  
  
  export interface Response<T> {
    code: number;
    isSuccess: boolean;
    errorMessage: string;
    message: string;
    data?: T;
    extra: any;
  }
  