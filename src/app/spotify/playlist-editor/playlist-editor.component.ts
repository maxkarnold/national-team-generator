import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { SpotifyService } from '../spotify.service';

@Component({
  selector: 'app-playlist-editor',
  templateUrl: './playlist-editor.component.html',
  styleUrl: './playlist-editor.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlaylistEditorComponent {
  playlist: unknown;

  constructor(private apiService: SpotifyService) {
    apiService.initializeSpotifyWebApi();
  }

  @Input()
  set id(playlistId: string) {
    this.apiService.getPlaylist(playlistId).subscribe(playlist => {
      this.playlist = playlist;
    });
  }
}
