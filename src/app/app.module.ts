import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgPipesModule } from 'ngx-pipes';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { DragDropModule } from "@angular/cdk/drag-drop";
import { MatSortModule } from '@angular/material/sort';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { environment } from 'src/environments/environment';
import { HomeComponent } from './components/home/home.component';
import { FirestoreService } from './services/firestore.service';


@NgModule({
  declarations: [
    AppComponent,
    HomeComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule,
    AngularFirestoreModule,
    NgPipesModule,
    DragDropModule,
    MatSortModule,
    BrowserAnimationsModule
  ],
  providers: [FirestoreService],
  bootstrap: [AppComponent]
})
export class AppModule { }
