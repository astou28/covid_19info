
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { Donnee } from './donnee';

@Injectable({
  providedIn: 'root',
})
export class GetApiService {
  private url = 'http://api.coronastatistics.live';

  constructor(private HttpClient: HttpClient) {}
  // apiCall(): Observable<Donnee> {
  //   return this.HttpClient.get<Donnee>(`${this.url}/All`);
  // }
  apiCallBySort(type: string): Observable<Donnee> {
    return this.HttpClient.get<Donnee>(
      `${this.url}/countries?sort=${type}`
    );
  }


  apiCallCountrie() {
    return this.HttpClient.get(this.url + '/countries');
  }
}
