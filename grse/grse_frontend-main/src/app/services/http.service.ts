import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as Global from 'src/app/globals';

@Injectable({
  providedIn: 'root'
})
export class HttpService {
  readonly BASE_URL;
  readonly FAKEAPI_URL;
  readonly BATCHPROCESSAPI_URL;

  constructor(
    private http: HttpClient,
  ) {
    this.BASE_URL = Global.BACKEND_URL;
    this.FAKEAPI_URL = Global.FAKEAPI_URL;
    this.BATCHPROCESSAPI_URL = Global.BATCHPROCESSAPI_URL;
  }

  get(uri: string, baseurl: string = "main") {
    switch (baseurl) {
      case "fakeapi":
        return this.http.get<any>(`${this.FAKEAPI_URL}/${uri}`);

      case "batchprocessapi":
        return this.http.get<any>(`${this.BATCHPROCESSAPI_URL}/${uri}`);

      default:
        return this.http.get<any>(`${this.BASE_URL}/${uri}`);
    }
  }

  post(uri: string, payload: any, baseurl: string = "main") {
    switch (baseurl) {
      case "fakeapi":
        return this.http.post<any>(`${this.FAKEAPI_URL}/${uri}`, payload);

      case "batchprocessapi":
        return this.http.post<any>(`${this.BATCHPROCESSAPI_URL}/${uri}`, payload);

      default:
        return this.http.post<any>(`${this.BASE_URL}/${uri}`, payload);
    }
  }

  postFormData(uri: string, payload: any, baseurl: string = "main") {
    switch (uri) {
      case 'cr_form_initiate':
        var formData = new FormData();
        for (var key in payload) {
          if (key == 'file') {
            const filesuploaded = payload[key] ?? [];
            if (filesuploaded.length > 0) {
              let i = 0;
              filesuploaded.forEach((file: any) => {
                console.log(file);
                formData.append('file[]', file);
              });
            }
          } else {
            formData.append(key, payload[key]);
          }
        }
        break;

      default:
        var formData = new FormData();
        for (var key in payload) {
          formData.append(key, payload[key]);
        }
        break;
    }

    switch (baseurl) {
      case "fakeapi":
        return this.http.post<any>(`${this.FAKEAPI_URL}/${uri}`, formData);

      case "batchprocessapi":
        return this.http.post<any>(`${this.BATCHPROCESSAPI_URL}/${uri}`, formData);

      default:
        return this.http.post<any>(`${this.BASE_URL}/${uri}`, formData);
    }
  }
}
