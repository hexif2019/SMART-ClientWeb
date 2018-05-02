import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {UserService} from "../services/user.service";
import {User} from "../models/user";
import {FormControl} from "@angular/forms";
import {ResidenceService} from "../services/residence.service";
import {Residence} from "../models/residence";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  residances: Residence[] = [];

  recherche: string;

  nom: string;
  prenom: string;
  email: string;
  password: string;
  residance: Residence;

  loadLogin = false;
  msgLoginError: string;
  msgRegisterError: string;
  @Input() showRegister: boolean;

  codepostal = new FormControl();
  valideCp = false;
  loadResidance = false;

  @Output() onLogin = new EventEmitter<User>();

  constructor(private userService: UserService,
              private residanceService: ResidenceService) {

    this.codepostal.valueChanges.subscribe((value) => {
      this.valideCp = /^[0-9]{5}$/.test(value);
      if(this.valideCp){
        this.loadResidance = true;
        this.residanceService.findResidanceFormCodePostal(value).subscribe(residances => {
            this.residances = residances;
        });
      }else{
        this.residances = [];
      }
    });
  }
  login(){
    this.loadLogin = true;
    this.userService.login(this.email,this.password)

      .subscribe(
        user =>{
          console.log("LOGIN SUCCESS", user);
          this.onLogin.emit(user);
        },
        fail =>{
          this.msgLoginError = JSON.stringify(fail);
        },
        ()=>{
          this.loadLogin = false;
        }
      );
  }
  submit(){
    this.showRegister ? this.register() : this.login();
  }

  register(){
    this.loadLogin = true;
    let newUser: User = {
      nom: this.nom,
      prenom: this.prenom,
      residence: this.residance,
      email: this.email
    }
    this.userService.register(newUser,this.password)

      .subscribe(
        user =>{
          console.log("REGISTER SUCCESS", user);
          this.onLogin.emit(user);
        },
        fail =>{
          this.msgRegisterError = (fail.msg) || JSON.stringify(fail);
        },
        ()=>{
          this.loadLogin = false;
        }
      );
  }
}
