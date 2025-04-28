import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { get as _get } from 'lodash-es';

@Component({
  selector: 'app-draft-advice',
  templateUrl: './draft-advice.component.html',
  styleUrl: './draft-advice.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DraftAdviceComponent {
  blueSideAdvice = input.required<string[]>();
  redSideAdvice = input.required<string[]>();

  constructor() {}
}
