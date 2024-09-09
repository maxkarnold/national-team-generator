import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-playlist-creator',
  templateUrl: './playlist-creator.component.html',
  styleUrl: './playlist-creator.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlaylistCreatorComponent {}
