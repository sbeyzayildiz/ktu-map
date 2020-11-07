import { Component, OnInit, ViewChild, TemplateRef, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatDialog, MatSnackBar, MatDialogRef } from '@angular/material';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { AdminComponent } from '../admin/admin.component';
import { environment } from 'src/environments/environment';
import { HomeComponent } from '../home/home.component';

@Component({
  selector: 'app-unit-add',
  templateUrl: './unit-add.component.html',
  styleUrls: ['./unit-add.component.scss']
})
export class UnitAddComponent implements OnInit, OnDestroy {
  @ViewChild('modal', { static: true, read: TemplateRef }) modalElementRef: TemplateRef<any>;
  dialogRef: MatDialogRef<any>;
  unitAddForm: FormGroup;
  unitList = [];
  categories = [];
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private httpClient: HttpClient,
    private homeComponent: HomeComponent,
    private adminComponent: AdminComponent,
    private dialog: MatDialog,
    formBuilder: FormBuilder,
    private snackbar: MatSnackBar,
  ) { 
    this.unitAddForm = formBuilder.group({
      name: new FormControl('', Validators.required),
      parent_id: new FormControl(0, Validators.required),
      category_id: new FormControl('', Validators.required),
      description:new FormControl(''),
      telephone: new FormControl(''),
      website: new FormControl(''),
      address: new FormControl(''),
      geom: new FormControl({}, Validators.required)
    })
  }

  ngOnInit() {
    this.dialogRef = this.dialog.open(this.modalElementRef, {
      width: 'fit-content',
      disableClose: true,
    });
    this.getUnits();
    this.getCategories();
    this.unitAddForm.patchValue({
      geom: this.adminComponent.getDrawedGeometryAsGeojson()
    });
    
  }

  destroyMe() {
    this.router.navigate(['..'], { relativeTo: this.activatedRoute });
  }
  cancelAdd() {
    this.destroyMe();
  }

  addUnit() {
    this.httpClient.post(environment.apiUrl + 'unit', this.unitAddForm.value).subscribe((response) => {
      this.snackbar.open('Birim eklendi!');
      this.homeComponent.getUnits(false);
      this.destroyMe();
    },(error) => {
      console.log(this.unitAddForm)
      console.log(error);
      this.snackbar.open('Birim eklenirken bir hata oluştu');
    });
  }

  getUnits() {
    this.httpClient.get(environment.apiUrl + 'unit').subscribe((response: Array<any>) => {
      this.unitList = response;
    });
  }

  getCategories() {
    this.httpClient.get(environment.apiUrl + 'category').subscribe((response: Array<any>) => {
      this.categories = response;
    })
  }

  ngOnDestroy() {
    this.dialogRef.close();
  }
  
}
