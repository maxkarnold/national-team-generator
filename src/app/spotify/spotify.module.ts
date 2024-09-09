import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@shared/shared.module';
import { Routes, RouterModule } from '@angular/router';
import { PlaylistCreatorComponent } from './playlist-creator/playlist-creator.component';
import { PlaylistEditorComponent } from './playlist-editor/playlist-editor.component';
import { SongSearchComponent } from './song-search/song-search.component';
import { SpotifyService } from './spotify.service';

const routes: Routes = [
  {
    path: '',
    component: PlaylistCreatorComponent,
  },
  {
    path: 'edit',
    component: PlaylistEditorComponent,
  },
  {
    path: 'search',
    component: SongSearchComponent,
  },
];

@NgModule({
  declarations: [PlaylistCreatorComponent, PlaylistEditorComponent, SongSearchComponent],
  providers: [SpotifyService],
  imports: [CommonModule, SharedModule, RouterModule.forChild(routes)],
})
export class SpotifyModule {}
