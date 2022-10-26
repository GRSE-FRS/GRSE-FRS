import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-admin-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class AdminSidebarComponent implements OnInit {

  constructor(
    public AuthService: AuthService
  ) { }

  ngOnInit(): void {
  }

  logout() {
    this.AuthService.adminLogout()
  }

}
