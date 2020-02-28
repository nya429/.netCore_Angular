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
    public class DiscrepancyAssignmentService
    {
        private SseService _sseService;
        private NotificationService _notificationService;

        public DiscrepancyAssignmentService(NotificationService notificationService,
            SseService sseService)
        {
            _notificationService = notificationService;
            _sseService = sseService;
        }

        public async void discrepancyAssignement(int userId, string actionUserName, List<KeyValuePair<int, int>> discrepancyIds)
        {
            NotificationDto notification = new NotificationDto()
            {
                AnchoredUserID = userId,
                ActionUserName = actionUserName,
                NotificationType = NotificationTypes.DISCREPANCY,
                EntryTime = DateTime.Now.ToString("yyyy-MM-ddTHH:mm:ss"),
                NotificationStr = JsonConvert.SerializeObject(discrepancyIds)
            };

            await Task.Run(() => _notificationService.AddNotificationByIdAsync(userId, notification));
            sendNotificationById(userId, notification);
        }

        public async void memberAssignment(int userId, string actionUserName, List<int> memberIds)
        {
            NotificationDto notification = new NotificationDto()
            {
                AnchoredUserID = userId,
                ActionUserName = actionUserName,
                NotificationType = NotificationTypes.MEMBER,
                EntryTime = DateTime.Now.ToString("yyyy-MM-ddTHH:mm:ss"),
                NotificationStr = JsonConvert.SerializeObject(memberIds)
            };

            await Task.Run(() => _notificationService.AddNotificationByIdAsync(userId, notification));
            _notificationService.sendNotification(userId, notification);
        }

        private void sendNotificationById(int userId, NotificationDto notification)
        {
            _notificationService.sendNotification(userId, notification);
        }

        /*
        public async void getCountByUserIdAsync(int userId)
        {
            ConcurrentDictionary<int, List<DiscrepancyAssignmentUnreadCount>> countDict = GetCountsAsync().Result;
            var notification = JsonConvert.SerializeObject(countDict.First(x => x.Key == userId));
            await _sseService.SendEventsAsync(notification, true, userId);
        }

        public async Task<bool> resetCountByUserIdAsync(int userId)
        {

        }*/

    }

}