import { NotificationType, Notification, NotificationStatus } from './../../classes/notification.class';
import { CaseService } from 'src/app/case/services/case.service';
import { Component, OnInit } from '@angular/core';

interface NotificationInfo {
  id:string
  label: string
  description:string
  icon:string
  caseId:string
  eventId:string
  eventFormId:string
}

const NotificationTypeIconMap = {
  [NotificationType.Critical]: 'error',
  [NotificationType.Info]: 'warning'
}

@Component({
  selector: 'app-case-notifications',
  templateUrl: './case-notifications.component.html',
  styleUrls: ['./case-notifications.component.css']
})
export class CaseNotificationsComponent implements OnInit {

  ready = false
  notificationInfos:Array<NotificationInfo> = []
  notifications:Array<Notification> = []

  constructor(
    private caseService:CaseService
  ) { }

  async ngOnInit() {
    this.notifications = [...this.caseService.case.notifications.filter(notification => notification.status === NotificationStatus.Open)]
    this.ready = true
    for (let notification of this.caseService.case.notifications) {
      if (!notification.persist && notification.status !== NotificationStatus.Closed) {
        this.caseService.closeNotification(notification.id)
        await this.caseService.save()
      }
    }
  }

}
