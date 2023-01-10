import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';

import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faBars, faXmark } from '@fortawesome/free-solid-svg-icons';

import * as fromComponents from './components';
import { ClickStopPropagationDirective } from './directives/click-stop-propagation.directive';
import { MemoizerPipe } from './pipes/memoizer.pipe';

@NgModule({
  declarations: [...fromComponents.components, ClickStopPropagationDirective, MemoizerPipe],
  imports: [RouterModule, ReactiveFormsModule, BrowserAnimationsModule, FontAwesomeModule, NgSelectModule],
  exports: [NgSelectModule, ReactiveFormsModule, ...fromComponents.components],
})
export class SharedModule {
  constructor(library: FaIconLibrary) {
    library.addIcons(faBars, faXmark);
  }
}
