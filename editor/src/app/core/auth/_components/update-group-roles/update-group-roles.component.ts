import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthenticationService } from '../../_services/authentication.service';

@Component({
  selector: 'app-update-group-roles',
  templateUrl: './update-group-roles.component.html',
  styleUrls: ['./update-group-roles.component.css']
})
export class UpdateGroupRolesComponent implements OnInit {
  role;
  constructor(private route: ActivatedRoute, private authenticationService: AuthenticationService) { }

  async ngOnInit() {
    const roleName = this.route.snapshot.paramMap.get('roleName');
    const groupId = this.route.snapshot.paramMap.get('groupId');
    this.role = await this.authenticationService.findRoleByName(groupId, roleName);
  }

}
