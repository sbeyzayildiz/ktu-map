import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
interface Unit {
  id: number;
  name: string;
  category_id: number;
  geom;
  parent_unit_id: number;
  description: string;
  telephone: string;
  website: string;
}
@Component({
  selector: 'app-unit',
  templateUrl: './unit.component.html',
  styleUrls: ['./unit.component.scss']
})
export class UnitComponent implements OnInit {

  constructor(
    private activatedRoute: ActivatedRoute,
    private httpClient: HttpClient,
    private router: Router
  ) { }
  unit: Unit;
  ngOnInit() { 
    this.activatedRoute.queryParams.subscribe((para) => {
      if(para.unit_id) {
        const id = para.unit_id;
        this.infoUnit(id)
      }
    });
  }

  infoUnit(id: number) {
    this.httpClient.get(environment.apiUrl + 'unit/' + id ).subscribe((response: Unit) => {
       this.unit = response;
    })
  }

  closeSidenav() {
    this.router.navigate([], {
      queryParams: {
        'sidebar' : 'close',
      },
      queryParamsHandling: 'merge'
    })
  }
}
