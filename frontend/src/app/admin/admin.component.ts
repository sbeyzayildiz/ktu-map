import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {

  constructor() { }
  unitSelected = false;
  ngOnInit() {
  }

  selectUnit() {
      console.log('seçmeye başla!')
  }
  editUnit() {

  }
  deleteUnit() {
    
  }
}
