import { Injectable } from '@angular/core';
import { TitleStrategy, RouterStateSnapshot } from '@angular/router';
import { Title } from '@angular/platform-browser';

const APP_NAME = 'KonakryServices';

/**
 * Met à jour le <title> de la page à chaque navigation.
 * Format : "Titre de la route — KonakryServices"
 * Fallback : "KonakryServices" si aucun titre défini.
 */
@Injectable({ providedIn: 'root' })
export class AppTitleStrategy extends TitleStrategy {
  constructor(private title: Title) {
    super();
  }

  override updateTitle(snapshot: RouterStateSnapshot): void {
    const pageTitle = this.buildTitle(snapshot);
    this.title.setTitle(
      pageTitle ? `${pageTitle} — ${APP_NAME}` : APP_NAME
    );
  }
}
