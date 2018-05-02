import { Component, OnInit } from '@angular/core';
import {UserService} from "../../services/user.service";
import {Commande} from "../../models/commande";
import {PanierService} from "../../services/panier.service";
import {Magasin} from "../../models/magasin.model";
import {Article} from "../../models/article.model";
import * as _ from "lodash";
import {ScriptService} from "../../services/script.service";

@Component({
  selector: 'app-page-basket',
  templateUrl: './page-basket.component.html',
  styleUrls: ['./page-basket.component.scss']
})
export class PageBasketComponent implements OnInit {

  panier: Commande;
  infoArticles: { article: Article, magasin: Magasin }[];
  dateLivraison;

  private paypalCfg = {

    env: 'sandbox', // sandbox | production

    // Show the buyer a 'Pay Now' button in the checkout flow
    commit: true,

    // payment() is called when the button is clicked
    payment: () => {

      // Set up a url on your server to create the payment
      var CREATE_URL = '/api/pay';

      // Make a call to your server to set up the payment
      return this.getPaypal().request.post(CREATE_URL)
        .then(function(res) {
          return res.paymentID;
        });
    },

    // onAuthorize() is called when the buyer approves the payment
    onAuthorize: (data, actions) => {

      // Set up a url on your server to execute the payment
      const EXECUTE_URL = '/api/pay/success';

      // Set up the dat you need to pass to your server
      const dataSend = {
        paymentID: data.paymentID,
        payerID: data.payerID
      };

      // Make a call to your server to execute the payment
      return this.getPaypal().request.post(EXECUTE_URL, dataSend)
        .then(function (res) {
          window.alert('Payment Complete!');
        });
    }

  };

  msgError(msg: string){
    console.log(msg);
  }

  constructor(private panierService: PanierService,
              private userService: UserService,
              private scriptService: ScriptService) { }

  ngOnInit() {
    this.userService.requirLogin().then(user => {
      this.panierService.getPagner(user.id).subscribe(
        panier => {
          this.panier = panier;
          this.infoArticles = [];
          panier.magasins.forEach(magasin => {
            this.infoArticles = _.union(
              this.infoArticles,
              magasin.produits.map(article => {
                return {
                  article: article,
                  magasin: magasin
                };
              })
            );
          });
        },
        error => this.msgError('Erreur du chargement du pagnier : ' + JSON.stringify(error))
      );
    });
    this.scriptService.loadScript('paypal').then(_=>{
      this.getPaypal().Button.render(this.paypalCfg, "#paypal-button-container")
    })
  }

  remove(article: Article, magasin: Magasin) {
    console.log('in func remove');
    this.userService.requirLogin().then(user => {
      this.panierService.removeArticle(user.id, magasin, article).subscribe(
        panier => {
          this.panier = panier;
        },
        error => this.msgError('Erreur du MAJ du pagnier : ' + JSON.stringify(error))
      );
    });
  }

  changeDate(date: any) {
    if (date && date.day) {
      console.log(date);
      this.panierService.changeDate(date.year + '-' + date.month + '-' + date.day);
    } else {
      console.log('not a date:', date);
    }
  }
  private getPaypal(): any {
    return window['paypal'];

  }

}
