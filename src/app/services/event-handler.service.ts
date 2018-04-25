import { Injectable } from '@angular/core';
import { Article } from '../models/article.model';

@Injectable()
export class EventHandlerService {

  constructor() { }
  articles: Article[];
  public rechercher(keyWords) {
    this.articles.push({
        name: 'CocaCola',
        nb: 500,
        prix: 100,
        poids: 500,
        icon: 'adresse d\'icon',
        denom: 'a carbonated soft drink produced by The Coca-Cola Company'
      },
      {
        name: 'Pepsi',
        nb: 300,
        prix: 200,
        poids: 500,
        icon: 'adresse d\'icon',
        denom: 'a carbonated soft drink produced'
      })
    return this.articles;
  }
}
