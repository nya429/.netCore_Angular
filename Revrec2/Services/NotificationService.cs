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
    public class NotificationService
    {
        private IMemoryCache _memoryCache;
        private SseService _sseService;

        public NotificationService(IMemoryCache memoryCache,
            SseService sseService)
        {
            _memoryCache = memoryCache;
            _sseService = sseService;
        }

        public async Task<ConcurrentDictionary<int, List<NotificationDto>>> GetorCreateAsync()
        {
            try
            {
                var notificationDict = await _memoryCache.GetOrCreateAsync(String.Format(InMemoryCacheKeys.NOTIFICATION_UNREAD_KEY), entry =>
                        {
                            entry.SlidingExpiration = TimeSpan.FromSeconds(5);
                            return Task.FromResult(new ConcurrentDictionary<int, List<NotificationDto>>());
                        });
                return notificationDict;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public async void AddNotificationByIdAsync(int userId, NotificationDto newEntry)
        {
            ConcurrentDictionary<int, List<NotificationDto>> notificationDict = await GetorCreateAsync();

            List<NotificationDto> newEntrys = new List<NotificationDto>
            {
                newEntry
            };

            notificationDict.AddOrUpdate(userId, newEntrys, (key, prevEntry) =>
            {
                prevEntry.Add(newEntry);
                return prevEntry;
            });

            _memoryCache.Set(InMemoryCacheKeys.NOTIFICATION_UNREAD_KEY, notificationDict);

        }

        public async void AddNotificationIdsAsync(List<int> userIds, NotificationDto newEntry)
        {
            foreach (int userId in userIds)
            {
                await Task.Run(() => AddNotificationByIdAsync(userId, newEntry));
            }
        }

        public async void getNotification(int userId, string stringGuid)
        {
            ConcurrentDictionary<int, List<NotificationDto>> notificationDict = await GetorCreateAsync();
            string notificationStr = JsonConvert.SerializeObject(notificationDict.FirstOrDefault(x => x.Key == userId).Value);
            await _sseService.SendEventsAsync(notificationStr, true, stringGuid);
        }

        public async void sendNotification(int userId, NotificationDto nofitification)
        {
            var notifications = new List<NotificationDto>()
            {
                nofitification
            };
            string notificationStr = JsonConvert.SerializeObject(notifications);
            await _sseService.SendEventsAsync(notificationStr, true, userId);
        }

        public async void resetNotificationByUserIdAsync(int userId)
        {
            ConcurrentDictionary<int, List<NotificationDto>> notificationDict = await GetorCreateAsync();

            List<NotificationDto> newEntrys = new List<NotificationDto>();

            notificationDict.AddOrUpdate(userId, newEntrys, (key, prevEntry) =>
            {
                return newEntrys;
            });

            _memoryCache.Set(InMemoryCacheKeys.NOTIFICATION_UNREAD_KEY, notificationDict);
        }
    }

}