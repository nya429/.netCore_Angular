export interface PagedList<T> {
    list: T[];
    count: number;
    pageSize: number;
    pageIndex: number;
    sortBy: string;
    orderBy: number;
  }
  
  export interface ReponseList<T> {
    list: T[];
  }
  
  
  export interface Reponse<T> {
    code: number;
    isSuccess: boolean;
    errorMessage: string;
    message: string;
    data?: T;
  }
  