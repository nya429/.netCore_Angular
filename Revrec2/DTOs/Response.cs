using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Revrec2.DTOs
{
    public interface IResponse
    {
        string Message { get; set; }
        bool IsSuccess { get; set; }
        int? Code { get; set; }
        string ErrorMessage { get; set; }
    }

    public interface IResponseData<T> : IResponse
    {
        T Data { get; set; }
    }

    public interface IResponseDataList<T>
    {
        IEnumerable<T> List { get; set; }
    }

    public interface IResponseDataListPaged<T> : IResponseDataList<T>
    {
        int Count { get; set; }
        int PageIndex { get; set; }
        int PageSize { get; set; }
        string SortBy { get; set; }
        int OrderBy { get; set; }
    }

    public interface IResponseCount
    {
        int Count { get; set; }
    }


    public class Response : IResponse
    {
        public string Message { get; set; }
        public bool IsSuccess { get; set; }
        public int? Code { get; set; }
        public string ErrorMessage { get; set; }
        public int Count { get; set; }
    }

    public class ResponseData<T> : IResponseData<T>
    {
        public string Message { get; set; }
        public bool IsSuccess { get; set; }
        public int? Code { get; set; }
        public string ErrorMessage { get; set; }
        public T Data { get; set; }
    }

    public class ResponseDataList<T> : IResponseDataList<T>
    {
        public IEnumerable<T> List { get; set; }
    }

    public class ResponseDataListPaged<T> : IResponseDataListPaged<T>
    {
        public IEnumerable<T> List { get; set; }
        public int Count { get; set; }
        public int PageIndex { get; set; }
        public int PageSize { get; set; }
        public string SortBy { get; set; }
        public int OrderBy { get; set; }
    }

    public class ResponseCount : IResponseCount
    {
        public int Count { get; set; }
    }
}
