import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs/Observable";
import {Residence} from "../models/residence";
import {fakeapi} from "./fakeapi";

@Injectable()
export class ResidenceService {
  constructor(private http: HttpClient) {}

  findResidanceFormCodePostal(codePostal: string): Observable<Residence[]>{
    //TODO ONAPI return this.http.post<Residence[]>('/api/findResidanceFormCodePostal',{codePostal: codePostal});
    return fakeapi(
      this.http.get<Residence[]>('/api/findResidenceFormCodePostal.json'),
      this.http.get<Residence[]>('/api/findResidenceFormCodePostal/${codePostal}')
  );
  }
}
