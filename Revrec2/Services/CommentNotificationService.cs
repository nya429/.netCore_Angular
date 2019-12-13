using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using Newtonsoft.Json;
using Revrec2.DTOs;
using Revrec2.Models;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using static Constants;

namespace Revrec2.Services
{
    public class CommentNotificationService
    {
        private IMemoryCache _memoryCache;
        private NotificationService _notificationService;

        public CommentNotificationService(IMemoryCache memoryCache,
            NotificationService notificationService)
        {
            _memoryCache = memoryCache;
            _notificationService = notificationService;
        }

        public async void commentByAnchoredUserIdAsync(int userId, string actionUserName, CommentNotification commentNotification)
        {
            NotificationDto notification = new NotificationDto()
            {
                AnchoredUserID = userId,
                ActionUserName = actionUserName,
                NotificationType = NotificationTypes.COMMENT,
                EntryTime = DateTime.Now.ToString("yyyy-MM-ddTHH:mm:ss"),
                NotificationStr = JsonConvert.SerializeObject(commentNotification)
            };

            await Task.Run(() => _notificationService.AddNotificationByIdAsync(userId, notification));
            sendNotificationById(userId, notification);
        }


        public async void commentByAnchoredUserIdsAsync(List<int> userIds, string actionUserName, int masterPatientID, int discrepancyID, int discrepancyCommentID)
        {
            foreach (int userId in userIds)
            {
                var commentNotification = new CommentNotification()
                {
                    MasterPatientID = masterPatientID,
                    DiscrepancyID = discrepancyID,
                    DiscrepancyCommentID = discrepancyCommentID
                };
                await Task.Run(() => commentByAnchoredUserIdAsync(userId, actionUserName, commentNotification));
            }
        }

        private void sendNotificationById(int userId, NotificationDto notification)
        {
            _notificationService.sendNotification(userId, notification);
        }

    }

}