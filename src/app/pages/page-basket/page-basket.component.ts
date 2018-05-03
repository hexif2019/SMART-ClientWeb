import {AfterViewInit, Component, OnInit} from '@angular/core';
import {UserService} from "../../services/user.service";
import {Commande} from "../../models/commande";
import {PanierService} from "../../services/panier.service";
import {Magasin} from "../../models/magasin.model";
import {Article} from "../../models/article.model";
import * as _ from "lodash";
import {ScriptService} from "../../services/script.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-page-basket',
  templateUrl: './page-basket.component.html',
  styleUrls: ['./page-basket.component.scss']
})
export class PageBasketComponent implements OnInit, AfterViewInit {

  panier: Commande;
  infoArticles: { article: Article, magasin: Magasin }[];
  dateLivraison;

  private paypalCfg = {

    env: 'sandbox', // sandbox | production

    // Show the buyer a 'Pay Now' button in the checkout flow
    commit: true,

    // payment() is called when the button is clicked
    payment: () => this.payment(),

    // onAuthorize() is called when the buyer approves the payment
    onAuthorize: (data, actions) => this.onAuthorize(data, actions),

  };

  msgError(msg: string) {
    console.log(msg);
  }

  constructor(private panierService: PanierService,
              private userService: UserService,
              private scriptService: ScriptService,
              private router: Router) {
  }

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
      this.panierService.changeDate((new Date(date.year + '-' + date.month + '-' + date.day).toISOString()));
    } else {
      console.log('not a date:', date);
    }
  }
  changeQuantiteArticle(magasin: Magasin, article: Article, qte: number) {
    this.userService.requirLogin().then(user => {
      this.panierService.changeQteArticle(user.id, magasin, article, qte).subscribe(
        panier => {
          console.log('quantite change');
          this.panier = panier;
        },
        error => this.msgError('Erreur du MAJ du pagnier : ' + JSON.stringify(error))
      );
    });
  }
  private getPaypal(): any {
    return window['paypal'];
  }

  private payment() {
    console.log('payment');
    return this.panierService.getPayToken(this.panier)
        .then((res) => {
          console.log('payment res : ', res);
          return res.paymentID;
        });
  }

  private onAuthorize(data, actions) {

    // Set up the dat you need to pass to your server
    const dataSend = {
      paymentID: data.paymentID,
      payerID: data.payerID
    };

    this.panierService.sendPayConfimatrion(dataSend)
      .subscribe((res) => {
        if (res === "success") {
          this.router.navigateByUrl("/payment");
        } else {
          this.paymentFail();
        }
      });
  }

  private paymentFail(): any {
    console.log("TODO Payment fail"); //TODO
  }

  private checkLimit(): boolean {
    const prixTotal = this.panier.magasins.reduce((acc, magasin) => {
      return acc + magasin.produits.reduce((acc2, produit) => {
        return acc2 + produit.prix * produit.nb;
      }, 0);
    }, 0);
    const poidsTotal = this.panier.magasins.reduce((acc, magasin) => {
      return acc + magasin.produits.reduce((acc2, produit) => {
        return acc2 + produit.poids;
      }, 0);
    }, 0);
    const volumeTotal = this.panier.magasins.reduce((acc, magasin) => {
      return acc + magasin.produits.reduce((acc2, produit) => {
        return acc2 + produit.volume;
      }, 0);
    }, 0);
    if (prixTotal < 50000 && poidsTotal < 1000000 && volumeTotal < 1000000000){
      return true;
    } else {
      return false;
    }
  }

  ngAfterViewInit() {
    console.log("initPayBtn");
    this.scriptService.loadScript('paypal').then(() => {
      setTimeout(()=>this.getPaypal().Button.render(this.paypalCfg, "#paypal-button-container"),1000);
    });
  }
  initPayBtn() {
  }
}
