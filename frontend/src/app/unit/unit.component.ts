import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { AuthGuard } from '../services/AuthGuard/auth.guard';
import { MatSnackBar, MatDialogRef, MatDialog } from '@angular/material';
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
  environment = environment;
  @ViewChild('photo', { static: true, read: TemplateRef }) photoElementRef: TemplateRef<any>;
  dialogRef: MatDialogRef<any>;
 
  constructor(
    private activatedRoute: ActivatedRoute,
    private httpClient: HttpClient,
    private router: Router,
    private snackbar: MatSnackBar,
    private dialog: MatDialog,

  ) { } 
  unit: Unit;
  editMode: boolean;
  viewPhotoId: number;
  ngOnInit() {
    this.editMode = false;
    this.activatedRoute.queryParams.subscribe((para) => {
      if (para.unit_id) {
        const id = para.unit_id;
        this.infoUnit(id)
        if (window.localStorage.getItem('token') !== null) {
          this.editMode = true;
        } else {
          this.editMode = false;
        }
      } else {
        this.closeSidenav();
      }
    });
  }

  infoUnit(id: number) {
    this.httpClient.get(environment.apiUrl + 'unit/' + id).subscribe((response: Unit) => {
      this.unit = response;
    })
  }

  closeSidenav() {
    this.router.navigate([], {
      queryParams: {
        'sidebar': 'close',
      },
      queryParamsHandling: 'merge'
    })
  }

  editUnit() {
    this.router.navigate(['/admin/edit'], {
      queryParams: {
        unit_id: this.unit.id
      }
    });
  }

  selectFile(event) {
    console.log(event.target.files);
    const files = event.target.files
    const formData = new FormData();
    if (files.length !== 1) {
      this.snackbar.open('Geçerli bir fotoğraf seçiniz!')
      return;
    }
    formData.append('photo', files[0]);
    console.log(formData);
    this.httpClient.post(environment.apiUrl + 'photo/' + this.unit.id, formData).subscribe((response) => {
      this.snackbar.open('Fotoğraf yüklendi!');
      this.infoUnit(this.unit.id);
    }, (error) => {
      this.snackbar.open('Yükleme işlemi başarısız!!');
    })
  }

  getViewPhoto(photoId: number) {
    this.viewPhotoId = photoId;
    this.dialogRef = this.dialog.open(this.photoElementRef, {
      width: 'fit-content',
      disableClose: false,
    });
  }

  deletePhoto(id: number) {
    this.httpClient.delete(environment.apiUrl + 'photo/' + id).subscribe((response) => {
      this.snackbar.open('Fotoğraf silindi!');
      this.infoUnit(this.unit.id);
      this.dialogRef.close();
    }, (error) => {
      this.snackbar.open('Silme işlemi başarısız!')
    })
  }
}
