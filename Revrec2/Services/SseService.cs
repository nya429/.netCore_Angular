using Microsoft.Extensions.Hosting;
using Revrec2.DTOs;
using Revrec2.Models;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Revrec2.Services
{
    public interface ISseService
    {

        void RemoveClient(Guid clientId);
        Guid AddClient(SseClient client);
        Task SendEventsAsync(string notification, bool alert);
        Task ExecuteAsync(CancellationToken stoppingToken);

    }

    public class SseService
    {
        private readonly ConcurrentDictionary<Guid, SseClient> _clients = new ConcurrentDictionary<Guid, SseClient>();

        #region ClientsManagement
        internal Guid AddClient(SseClient client)
        {
            Guid clientId = Guid.NewGuid();
            _clients.TryAdd(clientId, client);

            return clientId;
        }

        internal void RemoveClient(Guid clientId)
        {
            SseClient client;
            _clients.TryRemove(clientId, out client);
        }
        #endregion

        // SSE Broadcast
        public Task SendEventsAsync(string notification, bool alert)
        {
            List<Task> clientsTasks = new List<Task>();

            foreach (SseClient client in _clients.Values)
            {
                clientsTasks.Add(client.SendSseEventAsync(notification, alert));
            }

            return Task.WhenAll(clientsTasks);
        }

        // SSE Uni
        public Task SendEventsAsync(string notification, bool alert, int userId)
        {
            List<Task> clientsTasks = new List<Task>();

            var clients = _clients.Where(client => client.Value.isUser(userId));

            if (!clients.Any())
                return Task.CompletedTask;

            foreach (var clientPair in clients)
            {
                SseClient client = clientPair.Value;
                clientsTasks.Add(client.SendSseEventAsync(notification, alert));
            }

            return Task.WhenAll(clientsTasks);
        }
    }
}

