import {Magasin} from "./magasin.model";
import {User} from "./user";
import {Residence} from "./residence";

export class Commande {
  id?: string;
  etat?: string;
  prix?: number;
  magasins?: Magasin[];
  userid: string;
  user?: User;
  residence?: Residence;
  display?: any;
  heureLivraison?: Date|string;

  codeClient?: string;
}

