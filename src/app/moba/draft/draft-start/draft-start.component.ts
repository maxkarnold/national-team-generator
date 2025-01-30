import { Component, output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { PatchData, latestPatch, patches } from '../draft.model';

@Component({
  selector: 'app-draft-start',
  templateUrl: './draft-start.component.html',
  styleUrl: './draft-start.component.scss',
  host: {
    '(window:resize)': 'getScreenSize($event)',
  },
})
export class DraftStartComponent {
  draftStarted = output<void>();

  screenWidth = window.innerWidth;
  patches = patches;

  draftForm: FormGroup = new FormGroup({
    patchData: new FormControl<PatchData>(latestPatch),
    userIsRedSide: new FormControl<boolean>(false),
    useAiOpponent: new FormControl<boolean>(false),
    difficulty: new FormControl<'easy' | 'medium' | 'hard'>('medium'),
    useRandomTeam: new FormControl<boolean>({ value: true, disabled: true }),
  });
  constructor() {}

  get userIsRedSide(): boolean {
    return this.draftForm.get('userIsRedSide')?.value;
  }

  get patchData(): PatchData {
    return this.draftForm.get('patchData')?.value;
  }

  get useAiOpponent(): boolean {
    return this.draftForm.get('useAiOpponent')?.value;
  }

  get useRandomTeam(): boolean {
    return this.draftForm.get('useRandomTeam')?.value;
  }

  get difficulty(): 'easy' | 'medium' | 'hard' {
    return this.draftForm.get('difficulty')?.value;
  }

  getScreenWidth(_event: unknown) {
    this.screenWidth = window.innerWidth;
  }

  startDraft() {
    this.draftStarted.emit();
  }
}
