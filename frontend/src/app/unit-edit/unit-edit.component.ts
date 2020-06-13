import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { MatDialogRef, MatDialog, MatSnackBar } from '@angular/material';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { HomeComponent } from '../home/home.component';
import { AdminComponent } from '../admin/admin.component';
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
  selector: 'app-unit-edit',
  templateUrl: './unit-edit.component.html',
  styleUrls: ['./unit-edit.component.scss']
})
export class UnitEditComponent implements OnInit {
  @ViewChild('modal', { static: true, read: TemplateRef }) modalElementRef: TemplateRef<any>;
  @ViewChild('categoryAdd', { static: true, read: TemplateRef }) categoryElementRef: TemplateRef<any>;
  dialogRef: MatDialogRef<any>;
  unitEditForm: FormGroup;
  unitList = [];
  categories = [];
  unit: Unit;
  id:number;
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
    this.unitEditForm = formBuilder.group({
      id: new FormControl(''),
      createdAt: new FormControl(''),
      updatedAt: new FormControl(''),
      name: new FormControl('', Validators.required),
      parent_unit_id: new FormControl('', Validators.required),
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
    this.activatedRoute.queryParams.subscribe((params) => {
      if(params.unit_id) {
        this.id = parseInt(params.unit_id);
        console.log(params);
        
        this.getUnit();
      } else {
        this.snackbar.open('Birim bulunamadı');
        this.destroyMe();
      }
    })
    // this.unitAddForm.patchValue({
    //   geom: this.adminComponent.getDrawedGeometryAsGeojson()
    // });
  }

  getUnit() {
    this.httpClient.get<Unit>(environment.apiUrl + 'unit/' + this.id).subscribe((response) => {
      this.unit = response;
      this.unitEditForm.setValue(response);
    },(error) => {
      this.snackbar.open('Birim bulunamadı!');
      this.destroyMe();
    });
  }
  destroyMe() {
    this.router.navigate(['..'], { relativeTo: this.activatedRoute });
  }
  cancelAdd() {
    this.destroyMe();
  }

  editUnit() {
    this.httpClient.put(environment.apiUrl + 'unit/' + this.id, this.unitEditForm.value).subscribe((response) => {
      this.snackbar.open('Birim düzenlendi!');
      this.homeComponent.getViewUnit(this.unit.id)
      this.destroyMe();
    },(error) => {
      console.log(this.unitEditForm)
      console.log(error);
      this.snackbar.open('Birim düzenlenirken bir hata oluştu');
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
      this.categories.sort((a,b) => a.id-b.id);
    })
  }

  ngOnDestroy() {
    this.dialogRef.close();
  }

  addCategory() {
    this.dialogRef = this.dialog.open(this.categoryElementRef, {
      width: 'fit-content',
      disableClose: false,
    });
  }


  saveCompanyName(categoryName) {
    console.log('companyName: ', categoryName.value);
    
    if(!categoryName.value) {
      return;
    }
    const body = {
      name: categoryName.value
    }
    this.httpClient.post(environment.apiUrl + 'category', body).subscribe((response) => {
      this.snackbar.open('Kategori eklendi!');
      this.getCategories();
      this.dialogRef.close();
    }, (error) => {
      this.snackbar.open('Kategori ekleme işlemi başarısız :(')
    });
  }

  deleteCategory(id: number) {

  }
}
