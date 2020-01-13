import { AuthService } from './auth/auth.service';
import { Injectable, Inject } from '@angular/core';
import { SettingService } from './setting/setting.service';
import { Subject, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Notification } from './model/notification.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  baseUrl: string;
  notificatonAlerted = new Subject<Notification[]>();
  notificationClicked = new Subject<Notification>();
  notifications: Notification[];
  clickednotification: Notification;
  sseGUID: string;

  SSECheck;

  constructor(
    private http: HttpClient,
    @Inject('BASE_URL') baseUrl: string) {
    this.baseUrl = baseUrl + 'api/';
    this.notifications = [];
  }

  subscribeNotification(userID: number) {
    const url = this.baseUrl + 'sse/subscribe/' + userID;

    console.log("SSE Subscribe", url)
    const eventSource = new EventSource(url);

    this.SSECheck = setInterval(() => {
      console.log('SSE Check...')
      if (eventSource.readyState == 1) {
        console.log('SSE Connecting, get Notification', eventSource)
        this.getNotification();
        clearInterval(this.SSECheck);
      }
    }, 1000);

    return Observable.create(observer => {
      eventSource.addEventListener('alert', (evt: MessageEvent) => {
        observer.next(evt.data);
      });

      const FnGetGUID = (evt: MessageEvent) => {
        this.sseGUID = evt.data.substring(6, 42)
        console.log(this.sseGUID)
        eventSource.removeEventListener("ping", FnGetGUID);
      }
      eventSource.addEventListener("ping", FnGetGUID);
    }).subscribe(data => {
      let newNotifications = JSON.parse(data) as Notification[];
      if (!newNotifications)
        return;

      newNotifications.forEach((n: Notification) => n.NotificationObject = JSON.parse(n.NotificationStr));
      this.notifications.concat(newNotifications)
      this.notificatonAlerted.next(newNotifications);
    });
  }

  resetNotification() {
    const url = this.baseUrl + 'sse/reset';
    console.log("GET => RESET notification", url)
    return this.http.get(url).subscribe(() => {
      this.notifications = [];
      console.log('notification reset')
    });
  }

  getNotification() {
    const url = this.baseUrl + 'sse/discrepancyAssignmentUnread/' + this.sseGUID;
    console.log("GET => getNotification", url)
    return this.http.get(url).subscribe(() => {
      console.log("GET => Notification Get sent")
    });
  }

  onNotificationClick(notification: Notification) {
    this.clickednotification = notification;
    this.notificationClicked.next(notification);
  }

  getAndResetNotification(): Notification {
    const notificationData = { ...this.clickednotification };
    this.clickednotification = null;
    console.log('getAndResetNotification', notificationData)
    return notificationData;
  }

  hasNotification() {
    return !!this.clickednotification;
  }

  /** Generate GUID */
  S4() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  }
}
