import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {fakeapi} from "./fakeapi";
import {Commande} from "../models/commande";

@Injectable()
export class CommandeService {

  constructor(private http: HttpClient) {

  }

  private getStatusDisplayCommande(statut: string): any{
    switch (statut){
      case 'EDITION': return {etat: "danger", title: "Panier!"}; // (nomrmalement imposible)
      case 'PAYEMENT_EFFECTUE':
      case 'ATTENTE_CONFIRMATION_MAGASIN': return {etat: "success", title: "En attente de la confirmation des magasins", titleOne : "En attente de la confirmation du magasin"};
      case 'ANNULATION_CLIENT': return {etat: "danger", title: "Vous avez annulé la commande", titleOne : "Vous avez annulé la commande" };
      case 'ANNULATION_SYSTEM': return {etat: "danger", title: "Votre commande ne peut pas être livrée à l'heure voulu", titleOne : "Votre commande ne peut pas être livrée à l'heure voulu" };
      case 'ANNULATION_MAGASIN': return {etat: "danger", title: "Les magasins n'ont pas pus fournir les articles voulus", titleOne: "Le magasin n'a pas pus fournir les articles voulus" };
      case 'VALIDE_MAGASINS_MAIS_MODIF': return {etat: "warning", title: "Certains aticles de votre commande on était modifié par un magasin", titleOne: "Certains aticles de votre commande on était modifié par le magasin" };
      case 'ATTRIBUE_A_COURSIER': return {etat: "success", title: "Votre commande va bientôt arrivée"};
      case 'EN_COURS_DE_LIVRAISON': return {etat: "success", title: "Votre commande est en chemin"};
      case 'DANS_CASIER': return {etat: "success", title: "Votre commande vous attend"};
      case 'RECUPERE_CLIENT': return {etat: "success", title: "Terminée"};
      case 'CASIER_TIMEOUT': return {etat: "danger", title: "Vous n'avais pas récuperé votre commande!"};
      default: return {etat: "danger", title: "Unknowd! : " + (statut || "undefined")}
    }
  }

  private getStatusDisplayCommandeMagasin(statut: string): any{
    switch (statut){
      case 'EDITION': return {etat: "danger", title: "Panier!"}; // (nomrmalement imposible)
      case 'PAYEMENT_EFFECTUE':
      case 'ATTENTE_CONFIRMATION_MAGASIN': return {etat: "warning", title: "Attente de confirmation"};
      case 'ANNULATION_CLIENT': return {etat: "danger", title: "Annulée" };
      case 'ANNULATION_SYSTEM': return {etat: "danger", title: "Annulée"};
      case 'ANNULATION_MAGASIN': return {etat: "danger", title: "Annulée par le magasin"};
      case 'VALIDE_MAGASINS_MAIS_MODIF': return {etat: "warning", title: "Modifier"};
      case 'ATTRIBUE_A_COURSIER': return {etat: "success", title: "en attente du livreur"};
      case 'EN_COURS_DE_LIVRAISON': return {etat: "success", title: "en livraison"};
      case 'DANS_CASIER': return {etat: "success", title: "Livrée"};
      case 'RECUPERE_CLIENT': return {etat: "success", title: "Livrée"};
      case 'CASIER_TIMEOUT': return {etat: "success", title: "Livrée"};
      default: return {etat: "danger", title: "Unknowd! : " + (statut || "undefined")}
    }
  }

  private addCommandesDiplayData(commandes: Commande[]): Commande[]{
    commandes.forEach(commande => this.addCommandeDiplayData(commande));
    return commandes;
  }

  private addCommandeDiplayData(commande: Commande): Commande{
    commande.magasins.forEach(magasin => {
      magasin.display = {
        status: this.getStatusDisplayCommandeMagasin(magasin.etat)
      }
    });
    commande.display={
      status: this.getStatusDisplayCommande(commande.etat)
    }
    return commande;
  }

  getCommandesEnCour(userid: string){
    return fakeapi(
      this.http.get<Commande[]>('/api/commandes.json'),
      this.http.get<Commande[]>('/api/getCommandesEnCour/' + userid)
    ).map(commandes => { // Add code command in the commend
      commandes.forEach(commande => {
        this.http.get<any>('api/backdoor/getmdp/' + commande.id).subscribe( data => commande.codeClient = data.mdpClient );
      });
      return commandes;
    }).map(commandes => this.addCommandesDiplayData(commandes))
  }

  getCommandesArchiver(userid: string) {
    return fakeapi(
      this.http.get<Commande[]>('/api/commandes.json'),
      this.http.get<Commande[]>('/api/getCommandesArchiver/' + userid)
    ).map(commandes => this.addCommandesDiplayData(commandes))
  }

  getLastCommandes(userid: string) {
    return fakeapi(
      this.http.get<Commande[]>('/api/commandes.json'),
      this.http.get<Commande[]>('/api/getLastCommandes/' + userid)
    ).map(commandes => this.addCommandesDiplayData(commandes))
  }
}
