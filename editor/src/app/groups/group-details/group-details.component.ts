import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GroupsService } from '../services/groups.service';
@Component({
  selector: 'app-group-details',
  templateUrl: './group-details.component.html',
  styleUrls: ['./group-details.component.css']
})
export class GroupDetailsComponent implements OnInit {
  forms;
  groupName;
  constructor(private route: ActivatedRoute, private groupsService: GroupsService) { }

  async ngOnInit() {
    this.route.params.subscribe(params => {
      this.groupName = params.groupName;
    });
    try {
      this.forms = await this.groupsService.getFormsList(this.groupName);
    } catch (error) {
      console.log(error);
    }
  }

}
