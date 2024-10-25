import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';

import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faBars, faStar, faXmark, faStarHalf } from '@fortawesome/free-solid-svg-icons';

import * as fromComponents from './components';
import { ClickStopPropagationDirective } from './directives/click-stop-propagation.directive';
import { MemoizerPipe } from './pipes/memoizer.pipe';
import { StarRatingComponent } from './components/star-rating/star-rating.component';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [...fromComponents.components, ClickStopPropagationDirective, MemoizerPipe, StarRatingComponent],
  imports: [RouterModule, ReactiveFormsModule, FormsModule, FontAwesomeModule, NgSelectModule, CommonModule],
  exports: [NgSelectModule, ReactiveFormsModule, FormsModule, MemoizerPipe, ...fromComponents.components],
})
export class SharedModule {
  constructor(library: FaIconLibrary) {
    library.addIcons(faBars, faXmark, faStar, faStarHalf);
  }
}
