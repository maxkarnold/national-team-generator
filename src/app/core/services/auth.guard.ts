import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AuthService } from './auth.service';
import { User } from './firestore.model';

@UntilDestroy()
@Injectable({
  providedIn: 'root',
})
export class AuthGuard {
  user: User | null = null;
  constructor(private auth: AuthService, private router: Router) {
    this.auth.user$.pipe(untilDestroyed(this)).subscribe(user => {
      if (user) {
        this.user = user;
      } else {
        this.user = null;
      }
    });
  }

  canActivate() {
    if (!this.user) {
      return true;
    }
    this.router.navigate(['/simulation']);
    return false;
  }
}
