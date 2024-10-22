import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { SpotifyApiService } from './spotify-api.service';

@Injectable({
  providedIn: 'root',
})
export class SpotifyService {
  clientId = '';
  params = new URLSearchParams(window.location.search);
  code = this.params.get('code');
  constructor(private apiService: SpotifyApiService) {}

  initializeSpotifyWebApi() {
    console.log(this.code);
    if (!this.code) {
      this.apiService.redirectToAuthCodeFlow(this.clientId);
      return null;
    } else {
      const accessToken = this.apiService.getAccessToken(this.clientId, this.code);
      // const profile = await this.fetchProfile(accessToken);
      // return this.populateUI(profile);
    }
  }

  getPlaylist(playlistId: string): Observable<unknown> {
    return of(playlistId);
  }

  getUserPlaylists() {

  }
}
