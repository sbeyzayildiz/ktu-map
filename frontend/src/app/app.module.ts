import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { AuthGuard } from './services/AuthGuard/auth.guard';
import { RouterModule, Routes } from '@angular/router';
import { MatSidenavModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatDialogModule } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { UnitComponent } from './unit/unit.component';
import { AdminComponent } from './admin/admin.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { UnitEditComponent } from './unit-edit/unit-edit.component';
import { UnitDeleteComponent } from './unit-delete/unit-delete.component';
import { TokenIntercepterService } from './services/TokenInterceptor/token-interceptor.service';

const routes: Routes = [
  {
    path: '', component: HomeComponent, children: [
      { path: 'admin', component: AdminComponent, canActivate: [AuthGuard], children: [
        { path: 'edit', component: UnitEditComponent},
        { path: 'delete', component: UnitDeleteComponent},
      ]},
      { path: 'login', component: LoginComponent },
    ]
  }

];

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    LoginComponent,
    UnitComponent,
    AdminComponent,
    UnitEditComponent,
    UnitDeleteComponent
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(routes),
    MatSidenavModule,
    BrowserAnimationsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
    FormsModule,
    MatDialogModule,
    HttpClientModule
  ],
  providers: [
    AuthGuard,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenIntercepterService,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
