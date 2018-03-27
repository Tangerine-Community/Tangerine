import { Component, OnInit } from '@angular/core';
import { UserService } from '../../auth/_services/user.service';
import { SyncingService } from '../../sync-records/_services/syncing.service';
@Component({
  selector: 'app-export-data',
  templateUrl: './export-data.component.html',
  styleUrls: ['./export-data.component.css']
})
export class ExportDataComponent implements OnInit {

  constructor(private userService: UserService, private syncingService: SyncingService) { }

  ngOnInit() {
  }
  async exportAllRecords() {
    const usernames = await this.userService.getUsernames();
    const data = await Promise.all(usernames.map(async databaseName => {
      const docs = await this.syncingService.getAllUsersDocs(databaseName);
      return {
        databaseName,
        docs
      };
    }));
    downloadData(data, 'download.json', 'application/json')
  }
}

function downloadData(content, fileName, type) {
  var a = document.createElement("a");
  var file = new Blob([JSON.stringify(content)], { type });
  a.href = URL.createObjectURL(file);
  a.download = fileName;
  a.click();
}
