import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-song-search',
  templateUrl: './song-search.component.html',
  styleUrl: './song-search.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SongSearchComponent {}
