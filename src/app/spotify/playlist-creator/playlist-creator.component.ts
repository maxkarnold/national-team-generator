import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-playlist-creator',
  templateUrl: './playlist-creator.component.html',
  styleUrl: './playlist-creator.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlaylistCreatorComponent {
  createPlaylistForm = new FormGroup({});
}
