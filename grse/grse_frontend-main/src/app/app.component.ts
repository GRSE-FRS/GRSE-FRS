import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, NavigationStart, Router } from '@angular/router';
import * as Global from 'src/app/globals';
import { AlpetasocketService } from './services/alpetasocket.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [AlpetasocketService]
})
export class AppComponent implements OnInit {
  PageMainTitle = Global.AppName;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private titleService: Title,
  ) {}

  ngOnInit() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        $('[data-bs-dismiss="modal"]')?.click()
      }

      if (event instanceof NavigationEnd) {
        $('html,body').animate({ scrollTop: 0 }, 'slow');

        Global.loadCustomScripts()
        const rt = this.getActivatedRouteChild(this.activatedRoute);
        rt.data.subscribe((data: any) => {
          if (data.pageTitle) {
            this.titleService.setTitle(data.pageTitle + ' - ' + this.PageMainTitle)
          } else {
            this.titleService.setTitle(this.PageMainTitle)
          }
        });
      }
    });
  }

  getActivatedRouteChild(activatedRoute: ActivatedRoute): ActivatedRoute {
    if (activatedRoute.firstChild) {
      return this.getActivatedRouteChild(activatedRoute.firstChild);
    } else {
      return activatedRoute;
    }
  }
}
