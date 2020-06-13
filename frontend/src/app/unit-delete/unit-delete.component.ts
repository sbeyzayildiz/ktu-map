import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { MatDialog, MatDialogRef, MatSnackBar } from '@angular/material';
import { AdminComponent } from '../admin/admin.component';
import { HomeComponent } from '../home/home.component';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-unit-delete',
  templateUrl: './unit-delete.component.html',
  styleUrls: ['./unit-delete.component.scss']
})
export class UnitDeleteComponent implements OnInit {
  @ViewChild('modal', { static: true, read: TemplateRef }) modalElementRef: TemplateRef<any>;
  dialogRef: MatDialogRef<any>;
  unit;
  id;
  constructor(
   private dialog: MatDialog,
   private adminComponent: AdminComponent,
   private homeComponent: HomeComponent,
   private router: Router,
   private activatedRoute: ActivatedRoute,
   private httpClient: HttpClient,
 private snackbar: MatSnackBar
  ) { }

  ngOnInit() {
    // this.unit = this.adminComponent.selectedFeature;
   this.activatedRoute.queryParams.subscribe((params) => {
     this.id = params.unit_id
     console.log(this.id);
     this.getUnit();
   })
    this.dialogRef = this.dialog.open(this.modalElementRef, {
      width: 'fit-content',
      disableClose: true,
    });

  }

  getUnit() {
    this.httpClient.get(environment.apiUrl + 'unit/' + this.id).subscribe((response) => {
      this.unit = response;
      console.log('unşşşşttt', response);
      
    })
  }

  destroyMe() {
    this.router.navigate(['..'], { relativeTo: this.activatedRoute });
  }
  cancelDelete() {
    this.destroyMe();
  }
  ngOnDestroy() {
    this.dialogRef.close();
  }
  deleteUnit() {
    this.httpClient.delete(environment.apiUrl + 'unit/' + this.unit.id).subscribe((response) => {
      this.snackbar.open(`${this.unit.name} Birim silindi!`);
      this.homeComponent.vectorLayer.getSource().removeFeature(this.homeComponent.selectedFeature)
      this.homeComponent.getUnits();
      this.destroyMe();
    }, (error) => {
      this.snackbar.open('Silme işlemi başarısız!');
    });
  }

}
