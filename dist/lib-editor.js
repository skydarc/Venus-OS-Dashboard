/**********************************************/
/* "variable" permettant de lister les panels */
/* qui sont "expended"                        */
/**********************************************/
let expandedPanelsState = new Set();

/**********************************************/
/* "variable" permettant de lister les events */
/* sur les objets et eviter de les recrer     */
/**********************************************/
export const eventHandlers = new WeakMap();

/**************************************/
/* fonctions permettant la traduction */
/* de l'editeur graphique             */
/**************************************/
let translations = {}; // Stocke les traductions chargées

export async function loadTranslations(appendTo) {
    const lang = appendTo._hass?.language || "en"; // Langue HA, ou "en" par défaut
    try {
        const response = await import(`./lang-${lang}.js`);
        translations = response.default;
    } catch (error) {
        console.error("Erreur de chargement de la langue :", error);
        const response = await import(`./lang-en.js`);
        translations = {};
    }
}

export function t(func, key) {
    return translations?.[func]?.[key] || `⚠️ ${func}.${key} ⚠️`; // Si absent, affiche une alerte visuelle
}

/***************************************/
/* fonction de rendu du tab pricipal : */
/***************************************/
export function tab1Render(appendTo) {
    
    const tabContent = appendTo.shadowRoot.querySelector('#tab-content');
    tabContent.innerHTML = '';
    
    // Ajout du contenu à l'élément appendTo
    const editorDiv = document.createElement('div');
    editorDiv.classList.add('editor');
    
    // Choix du thème
    const themeRow = document.createElement('div');
    themeRow.classList.add('col');
    const themeLabel = document.createElement('div');
    themeLabel.classList.add('left');
    themeLabel.textContent = t("tab1Render", "theme_choice");//'Choix du theme de la carte :';
    const radioGroup = document.createElement('div');
    radioGroup.classList.add('radio-group', 'row');
    const themeOptions = [
      { label: t("tab1Render", "light"), value: 'light' }, // claire
      { label: t("tab1Render", "dark"), value: 'dark' }, // sombre
      { label: t("tab1Render", "auto"), value: 'auto' }, // auto
    ];
    
    // Vérifiez si aucune option n'est définie dans le YAML
    const defaultTheme = appendTo._config.theme || 'auto';
    
    themeOptions.forEach(option => {
      const formfield = document.createElement('ha-formfield');
      formfield.setAttribute('label', option.label);
      formfield.classList.add('cell');
      const radio = document.createElement('ha-radio');
      radio.setAttribute('name', 'themeSelect');
      radio.setAttribute('data-path', 'theme');
      radio.setAttribute('value', option.value);
      if (defaultTheme  === option.value) radio.setAttribute('checked', '');
      formfield.appendChild(radio);
      radioGroup.appendChild(formfield);
    });
    
    themeRow.appendChild(themeLabel);
    themeRow.appendChild(radioGroup);
    editorDiv.appendChild(themeRow);
    
    // Nombre de "Devices" pour chaque colonne
    const devicesRow = document.createElement('div');
    devicesRow.classList.add('col');
    const devicesLabel = document.createElement('div');
    devicesLabel.classList.add('left');
    devicesLabel.textContent = t("tab1Render", "devices_per_column"); //'Nombre de "Devices" pour chaque colonne :';
    
    const devicesInputs = [
      { id: 'boxCol1', label: 'col. 1', value: appendTo._config.param?.boxCol1 ?? 1, min: 1, max: 4, step: 1 },
      { id: 'boxCol2', label: 'col. 2', value: appendTo._config.param?.boxCol2 ?? 1, min: 1, max: 2, step: 1 },
      { id: 'boxCol3', label: 'col. 3', value: appendTo._config.param?.boxCol3 ?? 1, min: 1, max: 4, step: 1 },
    ];
    
    const devicesRowContainer = document.createElement('div');
    devicesRowContainer.classList.add('row');
    devicesInputs.forEach(input => {
      const textfield = document.createElement('ha-textfield');
      textfield.classList.add('cell');
      textfield.setAttribute('id', input.id);
      textfield.setAttribute('data-path', `param.${input.id}`);
      textfield.setAttribute('label', input.label);
      textfield.setAttribute('value', input.value);
      textfield.setAttribute('type', 'number');
      textfield.setAttribute('min', input.min);
      textfield.setAttribute('max', input.max);
      textfield.setAttribute('step', input.step);
      devicesRowContainer.appendChild(textfield);
    });
    devicesRow.appendChild(devicesLabel);
    devicesRow.appendChild(devicesRowContainer);
    editorDiv.appendChild(devicesRow);
    
    // Taille de la font dans les zones des "Devices"
    const fontSizeRow = document.createElement('div');
    fontSizeRow.classList.add('col');
    const fontSizeLabel = document.createElement('div');
    fontSizeLabel.classList.add('row');
    fontSizeLabel.textContent = t("tab1Render", "font_size_zones");// 'Taille de la font dans les zones des "Devices" :';
    fontSizeRow.appendChild(fontSizeLabel);
    
    // Définit les sections
    const fontSizeSections = [
      { label: t("tab1Render", "in_header"), path: 'header', id: 'header' }, // 'dans le header'
      { label: t("tab1Render", "in_devices"), path: 'sensor', id: 'sensor' }, // 'dans le Devices'
      { label: t("tab1Render", "in_footer"), path: 'footer', id: 'footer' }, // 'dans le footer'
    ];
    
    // Boucle sur chaque section
    fontSizeSections.forEach(section => {
      const sectionRow = document.createElement('div');
      sectionRow.classList.add('row');
    
      const labelCell = document.createElement('div');
      labelCell.classList.add('row', 'cellx1-5');
      const labelText = document.createElement('div');
      labelText.classList.add('cell', 'left');
      labelText.textContent = `- ${section.label}`;
      labelCell.appendChild(labelText);
      sectionRow.appendChild(labelCell);
    
      const inputCell = document.createElement('div');
      inputCell.classList.add('cell', 'right');
      const textfield = document.createElement('ha-textfield');
      textfield.setAttribute('id', section.id);
      textfield.setAttribute('data-path', `styles.${section.path}`);
      textfield.setAttribute('data-group', section.path);
      textfield.setAttribute('label', t("tab1Render", "font_size"));
      textfield.setAttribute('type', 'number');
      textfield.setAttribute('min', 1);
      textfield.setAttribute('step', 1);
    
      // Vérifie si la clé existe avant de définir sa valeur ou d'activer le champ
      if (appendTo._config.styles && appendTo._config.styles[section.path]) {
        if (appendTo._config.styles[section.path] === 'auto') {
          textfield.setAttribute('disabled', '');
        } else {
          textfield.setAttribute('value', appendTo._config.styles[section.path]);
        }
      }
      
      inputCell.appendChild(textfield);
      sectionRow.appendChild(inputCell);
    
      const switchCell = document.createElement('div');
      switchCell.classList.add('row', 'cell');
      const switchContainer = document.createElement('div');
      switchContainer.classList.add('cell', 'right');
      const fontSwitch = document.createElement('ha-switch');
      fontSwitch.setAttribute('data-path', `styles.${section.path}`);
      fontSwitch.setAttribute('data-group', section.path);
    
      // Activer le switch uniquement si la clé existe et que sa valeur est "auto"
      if (appendTo._config.styles && appendTo._config.styles[section.path] === 'auto') {
        fontSwitch.setAttribute('checked', '');
      }
    
      switchContainer.appendChild(fontSwitch);
      switchCell.appendChild(switchContainer);
      sectionRow.appendChild(switchCell);
    
      fontSizeRow.appendChild(sectionRow);
    });
    
    editorDiv.appendChild(fontSizeRow);
    
    // Ajouter le contenu au DOM
    tabContent.appendChild(editorDiv);

}

/**********************************************/
/* fonction de rendu du contenu de tabs col : */
/**********************************************/
export function tabColRender(col, appendTo) {
    
    const boxCol = appendTo._config.param[`boxCol${col}`] ?? 1;
    
    const tabContent = appendTo.shadowRoot.querySelector('#tab-content');
    tabContent.innerHTML = '';

    let tabsHTML = ''; // Initialise une variable pour stocker les onglets
    for (let i = 1; i <= boxCol; i++) {
      tabsHTML += `<ha-tab-group-tab slot="nav" panel="anchor" data-tab="${i - 1}">${col}-${i}</ha-tab-group-tab>`;
    }
            
    tabContent.innerHTML = `
	  <div class="devices-editor">
		<ha-tab-group id="subTab-group">
		  ${tabsHTML}
		  <ha-tab-group-panel id="sl-subTab-content" name="anchor">
			<div id="subTab-content" class="subTab-content"></div>
		  </ha-tab-group-panel>
		</ha-tab-group>
	  </div>
	`;
            
    const tabBar = tabContent.querySelector('#subLink-container');
    if (tabBar && typeof appendTo._currentSubTab === 'number') {
        tabBar.activeIndex = appendTo._currentSubTab; // Définit l'onglet actif
    }
    
    attachSubLinkClick(appendTo);
    renderSubTabContent(col, appendTo);
}

/************************************************/
/* fonction d'appel de la fonction de rendu des */
/* sous tabs                                    */
/* me demandez pas pourquoi j'ai fait deux      */
/* foncions, je ne saisplus                     */
/************************************************/
export function renderSubTabContent(col, appendTo) {
    const subTabContent = appendTo.shadowRoot.querySelector('#subTab-content');
    const boxId = `${col}-${appendTo._currentSubTab+1}`;
    subtabRender(boxId, appendTo._config, appendTo._hass, appendTo);
    attachInputs(appendTo); // Appeler la fonction attachInputs déjà présente
}

/************************************************/
/* fonction de rendu du contenu des sous-tabs : */
/* toutes les zones de conf des box en somme    */
/************************************************/
export function subtabRender(box, config, hass, appendTo) {
    
    const subTabContent = appendTo.shadowRoot.querySelector('#subTab-content');
    
    let leftQty = 0, topQty = 0, bottomQty = 0, rightQty = 0;
    
    // Vérifier si les ancres existent dans la configuration
    const anchors = config?.devices?.[box]?.anchors ? config?.devices?.[box]?.anchors.split(', ') : [];
    
    let thisAllAnchors = [];

    // Parcourir les ancres pour extraire les quantités par côté
    anchors.forEach((anchor) => {
        const [side, qtyStr] = anchor.split('-'); // Exemple : "L-2" devient ["L", "2"]
        const qty = parseInt(qtyStr, 10); // Convertir la quantité en nombre
    
        if (side === 'L') leftQty += qty;
        else if (side === 'T') topQty += qty;
        else if (side === 'B') bottomQty += qty;
        else if (side === 'R') rightQty += qty;
        
        for (let i = 1; i <= qty; i++) {
            thisAllAnchors.push(`${side}-${i}`);
        }
    });
    
    thisAllAnchors.sort();
    
    const OtherAllAnchors = getAllAnchorsExceptCurrent(config, box);
    //console.log(box + " : " + OtherAllAnchors);
    
    subTabContent.innerHTML = `
        
        <!-- ICON ET NOM -->
        <ha-expansion-panel expanded outlined id="subPanel_header" header="${t("subtabRender", "header_title")}">
            <div class="col inner">
                <div class="row">
                    <ha-icon-picker
                        class="cell"
                        label="${t("subtabRender", "icon_choice")}"
                        id="device_icon"
                        data-path="devices.${box}.icon"
                    >
                    </ha-icon-picker>
                    <ha-textfield 
                        class="cell"
                        label="${t("subtabRender", "name_choice")}"
                        id="device_name"
                        data-path="devices.${box}.name"
                    ></ha-textfield>
                </div>
            </div>
        </ha-expansion-panel>
        
        <!-- ENTITE 1 et 2-->
        <ha-expansion-panel outlined id="subPanel_entities" header="${t("subtabRender", "sensor_title")}">
            <div class="col inner">
                <ha-entity-picker
                    label="${t("subtabRender", "entity_choice")}"
                    id="device_sensor"
                    data-path="devices.${box}.entity"
                >
                </ha-entity-picker>
                <ha-entity-picker
                    label="${t("subtabRender", "entity2_choice")}"
                    id="device_sensor2"
                    data-path="devices.${box}.entity2"
                >
                </ha-entity-picker>
    
                <!-- SWITCHS GRAPH ET GAUGE -->
                <div class="row">
                    <div class="row cell">
                        ${t("subtabRender", "enable_graph")} :
                        <ha-switch class="cell right" 
                            id="graph_switch"
                            data-path="devices.${box}.graph" 
                        ></ha-switch>
                    </div>
                    <div id="gauge_div" class="row cell">
                        ${t("subtabRender", "enable_gauge")} :
                        <ha-switch class="cell right"
                            id="gauge_switch"
                            data-path="devices.${box}.gauge" 
                        ></ha-switch>
                    </div>
                </div>
            </div>
        </ha-expansion-panel>
        
        <!-- HEADER ET FOOTER 1 -->
        <ha-expansion-panel outlined id="subPanel_entities2" header="${t("subtabRender", "header_footer_title")}">
            <div class="col inner">
                <div class="row">
                    <ha-entity-picker
                        label="${t("subtabRender", "entity_header")}"
                        id="header_sensor"
                        data-path="devices.${box}.headerEntity"
                    >
                    </ha-entity-picker>
                    <ha-entity-picker
                        label="${t("subtabRender", "entity_footer")}"
                        id="footer1_sensor"
                        data-path="devices.${box}.footerEntity1"
                    >
                    </ha-entity-picker>
                </div>
                
                <!-- FOOTER 2 ET 3 -->
                <div class="row">
                    <ha-entity-picker
                        label="${t("subtabRender", "entity2_footer")}"
                        id="footer2_sensor"
                        data-path="devices.${box}.footerEntity2"
                    >
                    </ha-entity-picker>
                    <ha-entity-picker
                        label="${t("subtabRender", "entity3_footer")}"
                        id="footer3_sensor"
                        data-path="devices.${box}.footerEntity3"
                    >
                    </ha-entity-picker>
                </div>
            </div>
        </ha-expansion-panel>
        
        <!-- ANCHORS -->
        <ha-expansion-panel outlined id="subPanel_anchors" header="${t("subtabRender", "anchor_title")}">
            <div class="col inner">
                <div class="row">
                    <div class="col cell">
                        <ha-textfield class="anchor cell"
                            id="anchor_left"
                            data-path="devices.${box}.anchors" 
                            label="${t("subtabRender", "left_qtyBox")}"
                            value=""
                            type="number"
                            min="0"
                            max="3"
                            step="1"
                        ></ha-textfield>
                    </div>
                    <div class="col cell">
                        <ha-textfield class="anchor cell"
                            id="anchor_top"
                            data-path="devices.${box}.anchors" 
                            label="${t("subtabRender", "top_qtyBox")}"
                            value=""
                            type="number"
                            min="0"
                            max="3"
                            step="1"
                        ></ha-textfield>
                        <ha-textfield class="anchor cell"
                            id="anchor_bottom"
                            data-path="devices.${box}.anchors" 
                            label="${t("subtabRender", "bottom_qtyBox")}"
                            value=""
                            type="number"
                            min="0"
                            max="3"
                            step="1"
                        ></ha-textfield>
                    </div>
                    <div class="col cell">
                        <ha-textfield class="anchor cell"
                            id="anchor_right"
                            data-path="devices.${box}.anchors" 
                            label="${t("subtabRender", "right_qtyBox")}"
                            value=""
                            type="number"
                            min="0"
                            max="3"
                            step="1"
                        ></ha-textfield>
                    </div>
                </div>
            </div>
        </ha-expansion-panel>
        
        <!-- LINKS -->
        <div class="contMenu">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div class="headerMenu">${t("subtabRender", "add_links")}</div>
                <ha-icon-button id="add-link-button" aria-label="${t("subtabRender", "add_link")}">
                    <ha-icon icon="mdi:plus" style="display: flex;"></ha-icon>
                </ha-icon-button>
            </div>
            <div id="link-container" class="col noGap"></div>
        </div>
    `;
    
    // Réappliquer l'attribut "expanded" aux panneaux qui l'avaient avant
    expandedPanelsState.forEach(id => {
        const panel = subTabContent.querySelector(`ha-expansion-panel#${id}`);
        if (panel) {
            panel.setAttribute("expanded", "");
        }
    });
            
    const iconPicker = subTabContent.querySelector('#device_icon');
    const nameField = subTabContent.querySelector('#device_name');
    const entityPicker = subTabContent.querySelector('#device_sensor');
    const entity2Picker = subTabContent.querySelector('#device_sensor2');
    const graphSwitch = subTabContent.querySelector('#graph_switch');
    const gaugeSwitch = subTabContent.querySelector('#gauge_switch');
    const headerEntity = subTabContent.querySelector('#header_sensor');
    const footerEntity1 = subTabContent.querySelector('#footer1_sensor');
    const footerEntity2 = subTabContent.querySelector('#footer2_sensor');
    const footerEntity3 = subTabContent.querySelector('#footer3_sensor');
    const anchorLeft = subTabContent.querySelector('#anchor_left');
	const anchorTop = subTabContent.querySelector('#anchor_top');
	const anchorbottom = subTabContent.querySelector('#anchor_bottom');
	const anchorRight = subTabContent.querySelector('#anchor_right');
	
	// code pour recuperer les valeurs pour chaque cote
	anchorLeft.value = leftQty;
    anchorTop.value = topQty;
    anchorbottom.value = bottomQty;
    anchorRight.value = rightQty;
    
    // Après avoir inséré le contenu, configure les valeurs pour ha-icon-picker et ha-entity-picker
    nameField.value = config?.devices?.[box]?.name ?? "";
    iconPicker.value = config?.devices?.[box]?.icon ?? ""; 
    entityPicker.value = config?.devices?.[box]?.entity ?? "";
    entity2Picker.value = config?.devices?.[box]?.entity2 ?? "";
    headerEntity.value = config?.devices?.[box]?.headerEntity ?? "";
    footerEntity1.value = config?.devices?.[box]?.footerEntity1 ?? "";
    footerEntity2.value = config?.devices?.[box]?.footerEntity2 ?? "";
    footerEntity3.value = config?.devices?.[box]?.footerEntity3 ?? "";
    
    iconPicker.hass = hass; // Passe l'objet directement ici
    entityPicker.hass = hass; // Passe l'objet directement ici
    entity2Picker.hass = hass; // Passe l'objet directement ici
    headerEntity.hass = hass; // Passe l'objet directement ici  
    footerEntity1.hass = hass; // Passe l'objet directement ici
    footerEntity2.hass = hass; // Passe l'objet directement ici
    footerEntity3.hass = hass; // Passe l'objet directement ici
           
    if (config?.devices?.[box]?.graph === true) graphSwitch.setAttribute('checked', '');
    
    const entity = hass.states?.[entityPicker.value];
    const unit = entity?.attributes?.unit_of_measurement;

    if(unit !== '%' ) {
        gaugeSwitch.setAttribute('disabled', '');
        gaugeSwitch.setAttribute("title", t("subtabRender", "warning_gauge"));
    } else if (config.devices?.[box]?.gauge === true) gaugeSwitch.setAttribute('checked', '');
    
    
    const linkContainer = subTabContent.querySelector('#link-container');
    const addLinkButton = subTabContent.querySelector('#add-link-button');
    
    Object.entries(config.devices?.[box]?.link || {}).forEach(([linkKey, link]) => {
        
        addLink(linkKey, box, hass, thisAllAnchors, OtherAllAnchors, appendTo);

    });
    
    addLinkButton.addEventListener('click', (e) => {
        addLink(linkContainer.children.length+1, box, hass, thisAllAnchors, OtherAllAnchors, appendTo);
    });
    
    function trackExpansionState() {
    subTabContent.querySelectorAll("ha-expansion-panel").forEach(panel => {
            panel.addEventListener("expanded-changed", (event) => {
                if (event.detail.expanded) {
                    expandedPanelsState.add(panel.id); // Ajoute l'ID du panel s'il est expandu
                } else {
                    expandedPanelsState.delete(panel.id); // Supprime s'il est refermé
                }
            });
        });
    }
    
    // Appelle cette fonction au chargement initial pour capturer les événements
    trackExpansionState();
}

export function getAllAnchorsExceptCurrent(config, currentBox) {
    let allAnchors = [];

    Object.entries(config.devices || {}).forEach(([boxKey, device]) => {
        if (boxKey === currentBox || !device.anchors) return; // On saute le device en cours

        const anchors = device.anchors.split(', ');

        anchors.forEach((anchor) => {
            const [side, qtyStr] = anchor.split('-'); // Exemple : "L-2" → ["L", "2"]
            const qty = parseInt(qtyStr, 10);

            for (let i = 1; i <= qty; i++) {
                allAnchors.push(`${boxKey}_${side}-${i}`); // Associer l'ancre au device
            }
        });
    });

    allAnchors.sort();
    return allAnchors;
}

export function addLink(index, box, hass, thisAllAnchors, OtherAllAnchors, appendTo) {
    
    const subTabContent = appendTo.shadowRoot.querySelector('#subTab-content');
    const linkContainer = subTabContent.querySelector('#link-container');
    const addLinkButton = subTabContent.querySelector('#add-link-button');
    
    const panel = document.createElement('ha-expansion-panel');
    panel.setAttribute('outlined', '');
    panel.setAttribute('expanded', '');
    panel.setAttribute('style', 'margin: 0px 0px 8px 0px');
        
    panel.innerHTML = `
        <div slot="header" style="display: flex; justify-content: space-between; align-items: center;">
            <span>Lien ${index}</span>
            <ha-icon-button id="add-link-button" aria-label="Ajouter un lien">
                <ha-icon icon="mdi:trash-can" style="display: flex;"></ha-icon>
            </ha-icon-button>
        </div>
        <div id="link-container" class="inner">
            <div class="col">
                <div class="row">
                    <ha-combo-box class="cell" 
                        label="${t("addLink", "start")}" 
                        id="start_link_${index}"
                        data-path="devices.${box}.link.${index}.start" 
                    ></ha-combo-box>
                    
                    <ha-combo-box class="cell" 
                        label="${t("addLink", "end")}" 
                        id="end_link_${index}"
                        data-path="devices.${box}.link.${index}.end" 
                    ></ha-combo-box>
                </div>
                
                <div class="row">
                    <ha-entity-picker class="cell"
                        label="${t("addLink", "entity_picker")}"
                        id="entity_link_${index}"
                        data-path="devices.${box}.link.${index}.entity" 
                    >
                    </ha-entity-picker>
                    
                    <div class="row cell">
                        ${t("addLink", "reverse")} :
                        <ha-switch class="cell right" 
                            id="inv_link_${index}"
                            data-path="devices.${box}.link.${index}.inv" 
                        ></ha-switch>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    const startLink = panel.querySelector(`#start_link_${index}`);
    startLink.items = thisAllAnchors.map(anchor => ({ label: anchor, value: anchor })); // Convertit en objets
    startLink.value = appendTo._config.devices?.[box]?.link?.[index]?.start ?? "";
    
    const endLink = panel.querySelector(`#end_link_${index}`);
    endLink.items = OtherAllAnchors.map(anchor => ({ label: anchor, value: anchor }));
    endLink.value = appendTo._config.devices?.[box]?.link?.[index]?.end ?? "";
    
    const entityLink = panel.querySelector(`#entity_link_${index}`);
    entityLink.hass = hass;
    entityLink.value = appendTo._config.devices[box]?.link?.[index]?.entity ?? "";
    
    const invLink = panel.querySelector(`#inv_link_${index}`);
    if (appendTo._config.devices[box]?.link?.[index]?.inv === true) invLink.setAttribute('checked', '');
    
    const path = `devices.${box}.link.${index}`;
        
    const deleteButton = panel.querySelector('ha-icon-button');
    deleteButton.addEventListener('click', () => {
        appendTo._config = updateConfigRecursively(appendTo._config, path, null, true);
        notifyConfigChange(appendTo);
        
        panel.remove();
    });
    
    // Ajouter le panel au conteneur
    linkContainer.appendChild(panel);
    
    attachLinkInputs(appendTo)
        
}

export function attachLinkInputs(appendTo) {
        
    // Listener pour les `ha-textfield` sauf les champs "anchor"
    appendTo.shadowRoot.querySelectorAll('ha-combo-box').forEach((comboBox) => {
        
        if (eventHandlers.has(comboBox)) {
            //console.log("Événement déjà attaché à cet élément ha-combo-box :", comboBox);
            return; // Ne rien faire si l'événement est déjà attaché
        }
        
        // Créer un nouveau gestionnaire d'événements
        const handleChange = (e) => {
            const key = comboBox.dataset.path;
            let value = e.detail.value;
            
            if (!value) {
                value = null; // Déclenche la suppression de la clé dans le YAML
            }
            
            // Mise à jour de la config si une clé est définie
            if (key) {
                appendTo._config = updateConfigRecursively(appendTo._config, key, value, true);
                notifyConfigChange(appendTo);
            }
            
            // Émettre un événement personnalisé pour signaler que la configuration a changé
            const event = new CustomEvent('config-changed', {
                detail: { redrawRequired: true }
            });
            document.dispatchEvent(event);

        };
        
        // Ajouter l'événement
        comboBox.addEventListener("value-changed", handleChange);
        
        // Enregistrer le gestionnaire dans le WeakMap
        eventHandlers.set(comboBox, handleChange);
        
    });
    
    // Listener pour les `ha-textfield` sauf les champs "anchor"
    appendTo.shadowRoot.querySelectorAll('ha-textfield').forEach((textField) => {
        
        if (eventHandlers.has(textField)) {
            //console.log("Événement déjà attaché à cet élément ha-textfield :", textField);
            return; // Ne rien faire si l'événement est déjà attaché
        }
        
        // Créer un nouveau gestionnaire d'événements
        const handleChange = (e) => {
            const key = textField.dataset.path;
            let value = e.target.value;
    
            // Gestion des valeurs en fonction du type de champ
            if (e.target.type === 'number') {
                // Si c'est un champ numérique
                if (!value || isNaN(parseInt(value, 10))) {
                    value = null; // Déclenche la suppression de la clé dans le YAML
                } else {
                    value = parseInt(value, 10); // Convertir en entier si valide
                }
            } else {
                // Si c'est un champ texte, on garde la valeur telle quelle
                value = value.trim(); // Supprime les espaces inutiles
                if (value === "") {
                    value = null; // Si le champ est vide, suppression dans YAML
                }
            }
        
            // Mise à jour de la config si une clé est définie
            if (key) {
                appendTo._config = updateConfigRecursively(appendTo._config, key, value, true);
                notifyConfigChange(appendTo);
            }
            
            // Émettre un événement personnalisé pour signaler que la configuration a changé
            const event = new CustomEvent('config-changed', {
                detail: { redrawRequired: true }
            });
            document.dispatchEvent(event);
        };
        
        // Ajouter l'événement
        textField.addEventListener("change", handleChange);
        
        // Enregistrer le gestionnaire dans le WeakMap
        eventHandlers.set(textField, handleChange);
        
    });
    
    // Listener pour les `ha-switch`
    appendTo.shadowRoot.querySelectorAll('ha-switch').forEach((toggle) => {
        
        if (eventHandlers.has(toggle)) {
            //console.log("Événement déjà attaché à cet élément ha-switch :", toggle);
            return; // Ne rien faire si l'événement est déjà attaché
        }
        
        // Créer un nouveau gestionnaire d'événements
        const handleChange = (e) => {
            const key = toggle.dataset.path;
            const value = e.target.checked ? true : null; // `true` si activé, `null` pour suppression
            
            if (key) {
                appendTo._config = updateConfigRecursively(appendTo._config, key, value, true); // Suppression si désactivé
                notifyConfigChange(appendTo);
            }
            
            // Émettre un événement personnalisé pour signaler que la configuration a changé
            const event = new CustomEvent('config-changed', {
                detail: { redrawRequired: true }
            });
            document.dispatchEvent(event);
        };
        
        // Ajouter l'événement
        toggle.addEventListener("change", handleChange);
        
        // Enregistrer le gestionnaire dans le WeakMap
        eventHandlers.set(toggle, handleChange);
        
    });
}

/************************************************/
/* fonction de creation des events attachés aux */
/* differents inputs de l'interface puis tri et */
/* envoi pour mise a jour du yaml               */
/************************************************/
export function attachInputs(appendTo) {
        
    // Listener pour les `ha-textfield` sauf les champs "anchor"
    appendTo.shadowRoot.querySelectorAll('ha-textfield:not(.anchor)').forEach((textField) => {
        
        if (eventHandlers.has(textField)) {
            //console.log("Événement déjà attaché à cet élément ha-textfield :", textField);
            return; // Ne rien faire si l'événement est déjà attaché
        }
        
        // Créer un nouveau gestionnaire d'événements
        const handleChange = (e) => {
            const key = textField.dataset.path;
            let value = e.target.value;
    
            // Gestion des valeurs en fonction du type de champ
            if (e.target.type === 'number') {
                // Si c'est un champ numérique
                if (!value || isNaN(parseInt(value, 10))) {
                    value = null; // Déclenche la suppression de la clé dans le YAML
                } else {
                    value = parseInt(value, 10); // Convertir en entier si valide
                }
            } else {
                // Si c'est un champ texte, on garde la valeur telle quelle
                value = value.trim(); // Supprime les espaces inutiles
                if (value === "") {
                    value = null; // Si le champ est vide, suppression dans YAML
                }
            }
        
            // Mise à jour de la config si une clé est définie
            if (key) {
                appendTo._config = updateConfigRecursively(appendTo._config, key, value, true);
                notifyConfigChange(appendTo);
            }
        };
        
        // Ajouter l'événement
        textField.addEventListener("change", handleChange);
        
        // Enregistrer le gestionnaire dans le WeakMap
        eventHandlers.set(textField, handleChange);
        
    });

    // Listener pour les champs "anchor"
    appendTo.shadowRoot.querySelectorAll('ha-textfield.anchor').forEach((textField) => {
        
        if (eventHandlers.has(textField)) {
            return; // Ne rien faire si l'événement est déjà attaché
        }
        
        // Créer un nouveau gestionnaire d'événements
        const handleChange = (e) => {
            const key = textField.dataset.path;
    
            // Récupérer les valeurs des champs "left", "top", "bottom", "right"
            const anchorLeft = appendTo.shadowRoot.querySelector('#anchor_left').value;
            const anchorTop = appendTo.shadowRoot.querySelector('#anchor_top').value;
            const anchorBottom = appendTo.shadowRoot.querySelector('#anchor_bottom').value;
            const anchorRight = appendTo.shadowRoot.querySelector('#anchor_right').value;
            
            // Créer un tableau pour stocker les ancres
            let anchors = [];
            
            // Ajouter les ancres si elles sont valides (non nulles et non égales à zéro)
            if (anchorLeft && anchorLeft !== "0") {
                anchors.push(`L-${anchorLeft}`);
            }
            if (anchorTop && anchorTop !== "0") {
                anchors.push(`T-${anchorTop}`);
            }
            if (anchorBottom && anchorBottom !== "0") {
                anchors.push(`B-${anchorBottom}`);
            }
            if (anchorRight && anchorRight !== "0") {
                anchors.push(`R-${anchorRight}`);
            }
        
            // Vérifier si des ancres ont été ajoutées
            if (anchors.length > 0) {

                const strAnchors = anchors.join(', ');
        
                // Enregistrer la mise à jour dans le YAML (ou structure de config)
                appendTo._config = updateConfigRecursively(appendTo._config, key, strAnchors, true);
                notifyConfigChange(appendTo);
            } else {
                appendTo._config = updateConfigRecursively(appendTo._config, key, null, true);
                notifyConfigChange(appendTo);
            }
        };
        
        // Ajouter l'événement
        textField.addEventListener("change", handleChange);
        
        // Enregistrer le gestionnaire dans le WeakMap
        eventHandlers.set(textField, handleChange);
        
    });
 
    // Listener pour les `ha-switch`
    appendTo.shadowRoot.querySelectorAll('ha-switch').forEach((toggle) => {
        
        if (eventHandlers.has(toggle)) {
            //console.log("Événement déjà attaché à cet élément ha-switch :", toggle);
            return; // Ne rien faire si l'événement est déjà attaché
        }
        
        // Créer un nouveau gestionnaire d'événements
        const handleChange = (e) => {
            const key = toggle.dataset.path;
            const value = e.target.checked ? true : null; // `true` si activé, `null` pour suppression
            const group = toggle.dataset.group;
            const isChecked = e.target.checked;
            
            if (group) {
                // Trouver le champ texte associé au switch
                const textField = appendTo.shadowRoot.querySelector(`ha-textfield[data-group="${group}"]`);
                const key2 = textField.dataset.path;
        
                if (isChecked) {
                  appendTo._config = updateConfigRecursively(appendTo._config, key2, "auto"); // Définir sur "auto"
                } else {

                    const value = textField.value && !isNaN(parseInt(textField.value, 10)) 
                    ? parseInt(textField.value, 10) 
                    : null;
                    
                    appendTo._config = updateConfigRecursively(appendTo._config, key2, value, true);

                }
                notifyConfigChange(appendTo);
                
            } else {
                if (key) {
                    appendTo._config = updateConfigRecursively(appendTo._config, key, value, true); // Suppression si désactivé
                    notifyConfigChange(appendTo);
                }
            }
        };
        
        // Ajouter l'événement
        toggle.addEventListener("change", handleChange);
        
        // Enregistrer le gestionnaire dans le WeakMap
        eventHandlers.set(toggle, handleChange);
        
    });
    
    // Listener pour les `ha-radio`
    appendTo.shadowRoot.querySelectorAll('ha-radio').forEach((radio) => {
        
        if (eventHandlers.has(radio)) {
            //console.log("Événement déjà attaché à cet élément ha-radio :", radio);
            return; // Ne rien faire si l'événement est déjà attaché
        }
        
        // Créer un nouveau gestionnaire d'événements
        const handleChange = (e) => {
            const key = radio.dataset.path; // Assurez-vous que le `name` correspond à la clé dans la config
            const value = e.target.value; // 'light', 'dark', 'auto'
    
            if (key) {
                appendTo._config = updateConfigRecursively(appendTo._config, key, value, true);
                notifyConfigChange(appendTo);
            }
        };
        
        // Ajouter l'événement
        radio.addEventListener("change", handleChange);
        
        // Enregistrer le gestionnaire dans le WeakMap
        eventHandlers.set(radio, handleChange);
        
    });
          
    // Listener pour les `ha-icon-picker`
    appendTo.shadowRoot.querySelectorAll('ha-icon-picker').forEach((iconPicker) => {
        
        if (eventHandlers.has(iconPicker)) {
            //console.log("Événement déjà attaché à cet élément ha-icon-picker :", iconPicker);
            return; // Ne rien faire si l'événement est déjà attaché
        }
        
        // Créer un nouveau gestionnaire d'événements
        const handleChange = (e) => {
            const key = iconPicker.dataset.path; // Assurez-vous que le `name` correspond à la clé dans la config
            let value = e.detail.value;
            
            // Si la valeur est une chaîne vide, traiter comme suppression de l'icône
            if (value === "") {
                value = null; // Marquer pour suppression dans le YAML
            }
            
            if (key) {
                appendTo._config = updateConfigRecursively(appendTo._config, key, value, true);
                notifyConfigChange(appendTo);
            }
        }
            
        // Ajouter l'événement
        iconPicker.addEventListener("value-changed", handleChange);
        
        // Enregistrer le gestionnaire dans le WeakMap
        eventHandlers.set(iconPicker, handleChange);
        
    });
    
    // Listener pour les `ha-entity-picker`
    appendTo.shadowRoot.querySelectorAll('ha-entity-picker').forEach((entityPicker) => {
        
        if (eventHandlers.has(entityPicker)) {
            //console.log("Événement déjà attaché à cet élément ha-entity-picker :", entityPicker);
            return; // Ne rien faire si l'événement est déjà attaché
        }
            
        // Créer un nouveau gestionnaire d'événements
        const handleChange = (e) => {
            const key = entityPicker.dataset.path; // Assurez-vous que le `name` correspond à la clé dans la config
            let value = e.detail.value;
            
            // Si la valeur est une chaîne vide, traiter comme suppression de l'icône
            if (!value || value.trim() === "") {
                value = null; // Marquer pour suppression dans le YAML
            }
            
            if (key) {
                appendTo._config = updateConfigRecursively(appendTo._config, key, value, true);
                notifyConfigChange(appendTo);
            }
        }
        
        // Ajouter l'événement
        entityPicker.addEventListener("value-changed", handleChange);
        
        // Enregistrer le gestionnaire dans le WeakMap
        eventHandlers.set(entityPicker, handleChange);
        
    });
    
}

/**********************************************/
/* fonction de modification de la config yaml */
/* en local (en fait l'array local)           */
/* renvoi la nouvelle confif pour mod du yaml */
/* via la fonction notifyConfigChange         */
/**********************************************/
export function updateConfigRecursively(obj, path, value, removeIfNull = false) {
    const cloneObject = (o) => {
        return Array.isArray(o)
            ? o.map(cloneObject)
            : o && typeof o === "object"
            ? { ...o }
            : o;
    };

    const keys = path.split('.');
    let clonedObj = cloneObject(obj);
    let current = clonedObj;

    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];

        if (i === keys.length - 1) {
            if (value === null && removeIfNull) {
                delete current[key]; // Supprime la clé si `null` et `removeIfNull` est vrai
            } else {
                current[key] = value; // Définit la nouvelle valeur
            }
            break;
        }

        if (!current[key]) {
            current[key] = {};
        }

        current[key] = cloneObject(current[key]);
        current = current[key];
    }

    // Suppression des clés vides (supprime les objets vides récursivement)
    const removeEmptyKeys = (obj) => {
        for (const key in obj) {
            if (obj[key] && typeof obj[key] === 'object') {
                if (Object.keys(obj[key]).length === 0) {
                    delete obj[key];
                } else {
                    removeEmptyKeys(obj[key]);
                }
            }
        }
    };

    removeEmptyKeys(clonedObj);
    return clonedObj;
}

/***********************************/
/* fonction de mise à jour du yaml */
/***********************************/
export function notifyConfigChange(appendTo) {
    const event = new Event('config-changed', {
        bubbles: true,
        composed: true,
    });
    
    //console.log(appendTo._config);
    
    event.detail = { config: appendTo._config };
    appendTo.dispatchEvent(event);
}

/********************************/
/* fonction de gestion du click */
/* dans les onglets principaux  */
/********************************/
export function attachLinkClick(renderTabContent, appendTo) {
    appendTo.shadowRoot.querySelectorAll('#tab-group ha-tab-group-tab').forEach((link) => {
        if (eventHandlers.has(link)) {
            console.log("Événement déjà attaché à cet élément #link-container mwc-tab :", link);
            return;
        }

        const handleClick = (e) => {
            const tab = parseInt(e.currentTarget.getAttribute('data-tab'), 10);
            appendTo._currentTab = tab;
            appendTo._currentSubTab = 0;
            renderTabContent(appendTo); // Appelle la fonction passée en paramètre
        };

        link.addEventListener("click", handleClick);
        eventHandlers.set(link, handleClick);
    });
}

/********************************/
/* fonction de gestion du click */
/* dans les onglets secondaires */
/********************************/
export function attachSubLinkClick(appendTo) {
    appendTo.shadowRoot.querySelectorAll('#subTab-group ha-tab-group-tab').forEach((sublink) => {
        if (eventHandlers.has(sublink)) {
            console.log("Événement déjà attaché à cet élément #sublink-container mwc-tab :", sublink);
            return;
        }

        const handleClick = (e) => {
            const tab = parseInt(e.currentTarget.getAttribute('data-tab'), 10);
            appendTo._currentSubTab = tab;
            renderSubTabContent(appendTo._currentTab, appendTo);
        };

        sublink.addEventListener("click", handleClick);
        eventHandlers.set(sublink, handleClick);
    });
}
    
