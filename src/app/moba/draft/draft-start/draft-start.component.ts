import { Component, OnInit, output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { DraftMetaData, PatchData, latestPatch, patches } from '../draft.model';
import { DraftService } from '../services/draft.service';

@Component({
  selector: 'app-draft-start',
  templateUrl: './draft-start.component.html',
  styleUrl: './draft-start.component.scss',
  host: {
    '(window:resize)': 'getScreenSize($event)',
  },
})
export class DraftStartComponent implements OnInit {
  draftStarted = output<void>();
  draftDataSet = output<DraftMetaData>();

  screenWidth = window.innerWidth;
  patches = patches;

  draftForm: FormGroup = new FormGroup({
    patchData: new FormControl<PatchData>(latestPatch),
    userIsRedSide: new FormControl<boolean>(false),
    useAiOpponent: new FormControl<boolean>(false),
    difficulty: new FormControl<'easy' | 'medium' | 'hard'>('medium'),
    useRandomTeam: new FormControl<boolean>({ value: true, disabled: true }),
  });
  constructor(private service: DraftService) {
    this.service.initiateMasteries(this.draftForm.getRawValue());
  }

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

  ngOnInit(): void {
    // for skipping draft start NOT FOR PROD USE
    console.log('test');
    this.startDraft();
  }

  getScreenSize(_event: unknown) {
    this.screenWidth = window.innerWidth;
  }

  startDraft() {
    const data: DraftMetaData = this.draftForm.getRawValue();
    this.service.initiateMasteries(data);
    this.draftDataSet.emit(data);
    this.draftStarted.emit();
  }
}
