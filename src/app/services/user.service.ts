import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import 'rxjs/add/operator/map';
import {User} from '../models/user';
import {Observable} from 'rxjs/Observable';
import {Observer} from 'rxjs/Observer';
import {fakeapi} from "./fakeapi";
import {ActivatedRoute, Router} from "@angular/router";
import {Subject} from "rxjs/Subject";

@Injectable()
export class UserService {

  private user: User;

  private loginSubject: Subject<User>;
  private logoutSubject: Subject<User>;
  private tokenObservable: Observable<User>;

  private tokenLoading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
  ) {
    window['wUserService'] = this;
    let token = localStorage.getItem('token');
    let userEmail = localStorage.getItem('userEmail');
    this.loginSubject = new Subject<User>();
    this.logoutSubject = new Subject<User>();
    if (token && userEmail) {
      this.tokenObservable = this.loadToken(token, userEmail);
    }
  }

  private forceLogin() {
    this.router.navigateByUrl('/login');
  }

  getUser(): User {
    return this.user;
  }

  requirLogin(): Promise<User> {
    return new Promise<User>(executor => {
      if (this.user) {
        executor(this.user);
      } else if (this.tokenLoading) {
        this.tokenObservable.subscribe(
          user => {
            executor(user);
          },
          error => this.forceLogin()
        )
      } else {
        this.forceLogin();
      }
    })
  }

  loadToken(token: string, email: string): Observable<User> {
    this.tokenLoading = true;
    let ret = fakeapi(
      this.http.get<User>("/api/authenticate.json"),
      this.http.post<User>('/api/authenticateToken', {email: email, token: token})
    ).map(
      user => {
        this.user = user;

        this.tokenLoading = false;

        this.loginSubject.next(user);
        return user;
      });
    ret.subscribe(_ => this.tokenLoading = false);
    return ret;
  }

  login(email: string, password: string): Observable<User> {
    let ret = fakeapi(
      this.http.get<any>("/api/authenticate.json"),
      this.http.post<any>('/api/authenticate', {email: email, password: password})
    )
      .map(data => {

        if (data && data.token) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('userEmail', data.user.email);
        }

        this.user = data.user;

        return this.user;
      });
    ret.subscribe(user => {
      console.log("ret.subscribe");
      this.loginSubject.next(user);
    });
    return ret;
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    this.logoutSubject.next(this.user);
    delete this.user;
    this.router.navigateByUrl('/login');
  }

  register(user: User, password: string): Observable<User> {
    let ret = fakeapi(
      this.http.get<any>("/api/authenticate.json"),
      this.http.post<any>('/api/register', {user: user, password: password})
        .map(data => {

          if (data && data.token) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('userEmail', data.user.email);
          }

          this.user = data.user;

          return this.user;
        })
    );
    ret.subscribe(user => {
      this.loginSubject.next(user);

    });
    return ret;
  }

  onLogin(): Observable<User> {
    return this.loginSubject;
  }

  onLogout(): Observable<User> {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    return this.logoutSubject;
  }

}
