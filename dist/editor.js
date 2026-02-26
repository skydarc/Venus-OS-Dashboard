
import {css} from './css-editor.js?v=0.1';

import * as libEditor from './lib-editor.js';

class venusOsDashBoardEditor extends HTMLElement {
    
    async setConfig(config) {
        this._config = { ...config, entities: { ...(config.entities || {}) } };
        
        await libEditor.loadTranslations(this);
    
        if (!this.shadowRoot) {
            
            this.attachShadow({ mode: 'open' });
            
            this.shadowRoot.innerHTML = `
              <style>
				ha-tab-group {
				  width: 100%;
				}
				ha-tab-group-panel {
				  padding: 1em;
				}
			  </style>
            
              <ha-tab-group id="tab-group">
				<ha-tab-group-tab slot="nav" panel="main" data-tab="0" active>Conf.</ha-tab-group-tab>
				<ha-tab-group-tab slot="nav" panel="main" data-tab="1">Col. 1</ha-tab-group-tab>
				<ha-tab-group-tab slot="nav" panel="main" data-tab="2">Col. 2</ha-tab-group-tab>
				<ha-tab-group-tab slot="nav" panel="main" data-tab="3">Col. 3</ha-tab-group-tab>

				<ha-tab-group-panel id="sl-tab-content" name="main">
				  <div id="tab-content" class="content"></div>
				</ha-tab-group-panel>
			  </ha-tab-group>
            `;
            
            const tabGroup = this.shadowRoot.querySelector('#tab-group');
            
            const style = document.createElement('style');
            style.textContent = css();
            tabGroup.appendChild(style);
            
            this._currentTab = 0;
            this._currentSubTab = 0;
            
            libEditor.attachLinkClick(this.renderTabContent.bind(this), this);

        }
        
        this.renderTabContent();
    }
    
    renderTabContent() {
        
        if (this._currentTab === 0) {
            
            libEditor.tab1Render(this);
            
            console.log("conf.");
            
        } else if (this._currentTab === 1) {
            
            libEditor.tabColRender(1, this);
            
            console.log("tab 1");
    
        } else if (this._currentTab === 2) {
            
            libEditor.tabColRender(2, this);
            
            console.log("tab 2");
            
        } else if (this._currentTab === 3) {
            
            libEditor.tabColRender(3, this);
            
            console.log("tab 3");
            
        }
    
        libEditor.attachInputs(this);
        
    }
  
    set hass(hass) {
        this._hass = hass;
    }
      
    get hass() {
        return this._hass;
    }
      
    get value() {
        return this._config;
    }
}

customElements.define('venus-os-editor', venusOsDashBoardEditor);
