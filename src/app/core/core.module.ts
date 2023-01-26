import { NgModule } from '@angular/core';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { environment } from '@env';

@NgModule({
  imports: [AngularFireModule.initializeApp(environment.firebase), AngularFireAuthModule, AngularFirestoreModule.enablePersistence()],
})
export class CoreModule {}
