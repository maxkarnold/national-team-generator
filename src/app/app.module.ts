import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatSortModule } from '@angular/material/sort';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTooltipModule } from '@angular/material/tooltip';
import { OverlayModule } from '@angular/cdk/overlay';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { environment } from 'src/environments/environment';
import { HomeComponent } from './pages/home/home.component';
import { FirestoreService } from './services/firestore.service';
import { AuthService } from './services/auth.service';
import { LeaderboardComponent } from './pages/leaderboard/leaderboard.component';
import { LineupComponent } from './pages/lineup/lineup.component';
import { RosterComponent } from './pages/roster/roster.component';
import { PitchViewComponent } from './shared/components/pitch-view/pitch-view.component';
import { LineupAccordionComponent } from './shared/components/lineup-accordion/lineup-accordion.component';
import { PositionBreakdownComponent } from './shared/components/position-breakdown/position-breakdown.component';
import { NavBarComponent } from './shared/components/nav-bar/nav-bar.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    LeaderboardComponent,
    LineupComponent,
    RosterComponent,
    PitchViewComponent,
    LineupAccordionComponent,
    PositionBreakdownComponent,
    NavBarComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule,
    AngularFirestoreModule,
    DragDropModule,
    OverlayModule,
    MatSortModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    MatToolbarModule,
    MatSelectModule,
    MatExpansionModule,
    MatTooltipModule,
    FormsModule,
    BrowserAnimationsModule,
  ],
  providers: [FirestoreService, AuthService],
  bootstrap: [AppComponent],
})
export class AppModule {}
