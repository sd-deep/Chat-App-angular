import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cookie } from 'ng2-cookies/ng2-cookies';



@Injectable({
  providedIn: 'root'
})
export class AppService {

  private url = "https://chatapi.edwisor.com/api/v1/"

  constructor(private _http : HttpClient) { }
  
  public setUserInfoInLocalStorage = (data) => {
    localStorage.setItem('userInfo',JSON.stringify(data));
  } 

  public getUserInfoFromLocalStorage =() => {

    return JSON.parse(localStorage.getItem('userInfo'));
  }
  public signupFunction (data) : Observable<any> {

    const params = new HttpParams()
         .set('firstName', data.firstName)
         .set('lastName', data.lastName)
         .set('mobile', data.mobile)
         .set('email', data.email)
         .set('password', data.password)
         .set('apiKey', data.apiKey);

    return this._http.post(`${this.url}users/signup`,params);

  }

  public signinFunction (data) : Observable<any> {
    
    const params = new HttpParams()
       .set('email',data.email)
       .set('password',data.password);

       return this._http.post(`${this.url}users/login`,params);
  }

  public logout(): Observable<any> {

    const params = new HttpParams()
      .set('authToken', Cookie.get('authtoken'))

    return this._http.post(`${this.url}/api/v1/users/logout`, params);

  } // end logout function

  

  private handleError(err: HttpErrorResponse) {

    let errorMessage = '';

    if (err.error instanceof Error) {

      errorMessage = `An error occurred: ${err.error.message}`;

    } else {

      errorMessage = `Server returned code: ${err.status}, error message is: ${err.message}`;

    } // end condition *if

    console.error(errorMessage);

    return Observable.throw(errorMessage);

  }  // END handleError
}
