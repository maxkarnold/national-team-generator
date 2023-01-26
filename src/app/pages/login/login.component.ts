import { Component } from '@angular/core';
import { AuthService } from '@core/services/auth.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { User } from '@core/services/firestore.model';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@UntilDestroy()
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  email = '';
  password = '';
  user$;
  user: User | null = null;

  constructor(public auth: AuthService, private router: Router) {
    this.user$ = auth.user$;
    this.user$.pipe(untilDestroyed(this)).subscribe(u => {
      console.log(u?.uid);
      this.user = u;
      if (this.user !== null) {
        router.navigate(['/simulation']);
      }
    });
  }

  loginWithPassword(email: string, password: string) {
    this.auth.login(email, password);
  }

  loginWithGoogle() {
    this.auth.googleSignin();
  }

  logout() {
    this.auth.signOut();
  }
}
