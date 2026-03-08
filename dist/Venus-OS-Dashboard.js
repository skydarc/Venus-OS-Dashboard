/*

 switch auto theme clair/sombre ou choix manuel
 
 donc onglet param en plus

*/

console.info(
  "%c 🗲 %c - %cVenus OS BD%c - %c 🗲 \n%c version 0.6.2 ",
  "color: white; font-weight: bold; background: black",
  "color: orange; font-weight: bold; background: blue; font-weight: bold;",
  "color: white; font-weight: bold; background: blue; text-decoration: underline; text-decoration-color: orange; text-decoration-thickness: 5px; text-underline-offset: 2px;",
  "color: orange; font-weight: bold; background: blue; font-weight: bold;",
  "color: white; font-weight: bold; background: black",
  "color: white; font-weight: bold; background: grey"
);

import './editor.js';
import * as libVenus from './lib-venus.js';

import { cssDataDark } from './css-dark.js?v=0.1';
import { cssDataLight } from './css-light.js?v=0.1';

class venusOsDashboardCard extends HTMLElement {

  static isDark = true;

  static periodicTaskStarted = false;

  static cycle = 0;

  constructor() {
    super();

    // Écouter l'événement personnalisé
    document.addEventListener('config-changed', (event) => {
      libVenus.razDashboardOldWidth(this.content);
    });

  }

  setConfig(config) {

    this.config = config;

    // Crée la structure statique après avoir reçu la configuration
    if (!this.content) {
      this._createCardStructure();
    }
  }

  _createCardStructure() {

    // Initialize the content if it's not there yet.
    if (!this.content) {

      const cardElem = document.createElement('ha-card');
      this.appendChild(cardElem);

      const contElem = document.createElement('div');
      contElem.setAttribute('id', 'db-container');
      contElem.setAttribute('class', 'db-container');
      cardElem.appendChild(contElem);

      this.content = this.querySelector("div");

      window.contElem = this.content;

    }

    // recuperation des parametres
    const param = this.config.param || [];

    // rendu de la structure de base de la carte (en mode normal ou demo "image")
    libVenus.baseRender(this.config, this.content);

    // recuperation des quantités de box a créer par colonne dans les parametres
    const boxCol1 = param.boxCol1 ? Math.min(Math.max(param.boxCol1, 1), 4) : 1;
    const boxCol2 = param.boxCol2 ? Math.min(Math.max(param.boxCol2, 1), 2) : 1;
    const boxCol3 = param.boxCol3 ? Math.min(Math.max(param.boxCol3, 1), 4) : 1;

    // ajout des box
    if (this.config.demo !== true) libVenus.addBox(boxCol1, boxCol2, boxCol3, this.config, this.content);

    // ajout des ancres d'attache des lignes
    if (this.config.demo !== true) libVenus.addAnchors(this.config, this.content);

  }

  set hass(hass) {

    this._hass = hass;

    if (this._hass) {

      // Check the selected theme
      const isDarkTheme = this._hass.themes.darkMode;

      // Create or update the style element based on the theme
      let style = this.querySelector('style');
      if (!style) {
        style = document.createElement('style');
        this.querySelector('ha-card').appendChild(style);
      }

      if ((isDarkTheme && this.config.theme === 'auto') || this.config.theme === 'dark') {
        style.textContent = cssDataDark();
        venusOsDashboardCard.isDark = true;
      } else {
        style.textContent = cssDataLight();
        venusOsDashboardCard.isDark = false;
      }
    }

    // mise en pause (ou ne pas aller plus loin) si mode demo
    if (this.config.demo === true) return;

    // mise en pause (ou ne pas aller plus loin) si debug
    if (venusOsDashboardCard.cycle >= 10) return;

    // recuperation des parametres de la carte
    const devices = this.config.devices || [];
    const styles = this.config.styles || "";

    // remplissage des box avec les parametres donnés
    libVenus.fillBox(this.config, styles, venusOsDashboardCard.isDark, hass, this.content);

    // verification de changement de taille... si oui re-creation des lignes
    libVenus.checkReSize(devices, venusOsDashboardCard.isDark, this.content);

    // verification des valeurs pour inversion de l'anim path
    libVenus.checkForReverse(this.config, hass, this.content);

    // Lancement initial de startPeriodicTask
    if (!this.periodicTaskStarted) {
      // console.log('Tentative de démarrage de startPeriodicTask...');
      const taskStarted = libVenus.startPeriodicTask(this.config, hass, this.content);

      if (taskStarted) {
        // console.log('startPeriodicTask démarré avec succès.');
        this.periodicTaskStarted = true; // Marquer comme démarrée
      } else {
        // console.warn('startPeriodicTask a échoué. Elle sera relancée lors de la prochaine itération.');
        this.periodicTaskStarted = false; // Rester sur false pour retenter
      }
    }

    // venusOsDashboardCard.cycle++;
  }

  // Méthode pour générer l'élément de configuration
  static getConfigElement(hass) {
    const editor = document.createElement('venus-os-editor');
    editor.hass = hass; // Passe explicitement l'instance de hass à l'éditeur
    return editor;
  }

  /*static getStubConfig() {
      return { 
          demo: true,
      };
  }*/

  static getStubConfig(hass) {
    // get available power entities
    return libVenus.getDefaultConfig(hass);
  }

  // Méthode pour récupérer la taille de la carte
  getCardSize() {
    return 1;
  }

  // Fonction de nettoyage si la carte est retirée
  disconnectedCallback() {
    libVenus.clearAllIntervals(this.content); // Arrêter toutes les tâches
  }

}
customElements.define('venus-os-dashboard', venusOsDashboardCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'venus-os-dashboard',
  name: 'Venus OS Dashboard',
  preview: true,
  description: 'A DashBoard that looklike Venos OS gui-v2 from Victron.',
});
