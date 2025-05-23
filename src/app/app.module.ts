import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';

import { SharedModule } from '@shared/shared.module';
import { CoreModule } from '@core/core.module';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { HomeComponent } from './pages/home/home.component';
import { LeaderboardComponent } from './pages/leaderboard/leaderboard.component';
import { LineupComponent } from './pages/lineup/lineup.component';
import { RosterComponent } from './pages/roster/roster.component';
import { LoginComponent } from './pages/login/login.component';
import { BuildRosterComponent } from './pages/build-roster/build-roster.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
  declarations: [AppComponent, HomeComponent, LeaderboardComponent, LineupComponent, RosterComponent, LoginComponent, BuildRosterComponent],
  imports: [BrowserModule, AppRoutingModule, SharedModule, CoreModule, CommonModule, BrowserAnimationsModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
