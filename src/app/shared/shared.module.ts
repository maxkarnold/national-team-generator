import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';

import {
  FontAwesomeModule,
  FaIconLibrary,
} from '@fortawesome/angular-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';

import * as fromComponents from './components';
import { ClickStopPropagationDirective } from './directives/click-stop-propagation.directive';

@NgModule({
  declarations: [...fromComponents.components, ClickStopPropagationDirective],
  imports: [
    RouterModule,
    FormsModule,
    BrowserAnimationsModule,
    FontAwesomeModule,
  ],
  exports: [FormsModule, ...fromComponents.components],
})
export class SharedModule {
  constructor(library: FaIconLibrary) {
    library.addIcons(faBars);
  }
}
