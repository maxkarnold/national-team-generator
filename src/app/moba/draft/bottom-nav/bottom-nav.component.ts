import { ChangeDetectionStrategy, Component, output } from '@angular/core';

@Component({
  selector: 'app-draft-bottom-nav',
  templateUrl: './bottom-nav.component.html',
  styleUrl: './bottom-nav.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BottomNavComponent {
  selectedTab = output<string>();
  currentTab = 'blue';
}
