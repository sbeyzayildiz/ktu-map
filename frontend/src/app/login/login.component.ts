import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  @ViewChild('modal', { static: true, read: TemplateRef }) modalElementRef: TemplateRef<any>;
  loginForm: FormGroup;

  constructor(
    private _formBuilder: FormBuilder,
    private dialog: MatDialog,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private httpClient: HttpClient
  ) {
    this.loginForm = this._formBuilder.group({
      username: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required)
    })
  }
  dialogRef: MatDialogRef<any>;

  ngOnInit() {
    this.dialogRef = this.dialog.open(this.modalElementRef, {
      width: 'fit-content',
      disableClose: false,
    });
    this.dialogRef.afterClosed().subscribe(result => {
      this.router.navigate(['..'], { relativeTo: this.activatedRoute })

    });
  }

  login() {
    console.log('THIS', this)
    this.httpClient.post(environment.apiUrl + 'login', this.loginForm.value).subscribe((response: any) => {
      console.log('login response', response);
      window.localStorage.setItem('token', response.token);
      this.router.navigate(['/admin'], {relativeTo: this.activatedRoute})
      this.dialogRef.close();
    }, (err) => {
      console.warn('login err ', err);
    })
  }

}

