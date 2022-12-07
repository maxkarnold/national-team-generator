import { Component } from '@angular/core';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  email = '';
  password = '';
  user$;

  constructor(public auth: AuthService) {
    this.user$ = auth.user$;
    console.log(this.user$);
  }
}
