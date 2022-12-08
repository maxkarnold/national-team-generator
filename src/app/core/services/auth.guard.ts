import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Observable } from 'rxjs';
import { map, take, tap } from 'rxjs/operators';
import { AuthService } from './auth.service';

@UntilDestroy()
@Injectable({
  providedIn: 'root',
})
export class AuthGuard {
  constructor(private auth: AuthService, private router: Router) {}

  // canActivate(): Observable<boolean> {
  //   return this.auth.user$.pipe(
  //     untilDestroyed(this),
  //     map((user) => !!user),
  //     tap((loggedIn) => {
  //       this.router.navigate(['/simulation']);
  //       if (!loggedIn) {
  //         console.log('access denied');
  //         this.router.navigate(['/simulation']);
  //       }
  //       console.log(loggedIn);
  //     })
  //   );
  // }
}
