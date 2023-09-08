import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';

import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faBars, faStar, faXmark, faStarHalf } from '@fortawesome/free-solid-svg-icons';

import * as fromComponents from './components';
import { ClickStopPropagationDirective } from './directives/click-stop-propagation.directive';
import { MemoizerPipe } from './pipes/memoizer.pipe';

import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { StarRatingComponent } from './components/star-rating/star-rating.component';

@NgModule({
  declarations: [...fromComponents.components, ClickStopPropagationDirective, MemoizerPipe, StarRatingComponent],
  imports: [
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    BrowserAnimationsModule,
    FontAwesomeModule,
    NgSelectModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
  ],
  exports: [
    NgSelectModule,
    ReactiveFormsModule,
    FormsModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MemoizerPipe,
    ...fromComponents.components,
  ],
})
export class SharedModule {
  constructor(library: FaIconLibrary) {
    library.addIcons(faBars, faXmark, faStar, faStarHalf);
  }
}
