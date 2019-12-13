public static class Constants
{
    public static class ResponseCode
    {
        public const int Success = 0;
        public const int NoChange = 1;
        public const int SuccessfulChange = 2;
        public const int SuccessfulAdd = 3;
        public const int TimeSpanOverLapping = 4;
        public const int Fail = 5;
    }

    public static class PaginationParams
    {
        public const int PageIndex = 0;
        public const int PageSize = 25;
    }

    public static class InMemoryCacheKeys
    {
        public const string DISCREPANCY_UNREAD_COUNT_KEY = "_DicrepancyAssignmentCount";
        public const string COMMENT_UNREAD_COUNT_KEY = "_CommentCount";
        public const string NOTIFICATION_UNREAD_KEY = "_NotificationUnread";
    }

    public static class NotificationTypes
    {
        public const string COMMENT = "comment";
        public const string DISCREPANCY = "discrepancy";
        public const string MEMBER = "member";
    }
}
