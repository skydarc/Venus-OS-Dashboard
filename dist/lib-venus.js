export let pathControls = new Map();

export let directionControls = new Map();

export let intervals = new Map();

export let historicData = new Map();

export let updateGraphTriggers = new Map();

let dashboardOldWidth;

let mustRedrawLine = true;

let editorOpen = false;

/************************************************/
/* fonction de rendu du squelette de la carte : */
/* rend une image si dans le YAML, mode = DEMO  */
/************************************************/
export function baseRender(config, appendTo) {
    
    appendTo.innerHTML = `
	    <div id="dashboard" class="dashboard">
    		<svg id="svg_container" class="line" viewBox="0 0 1000 600" width="100%" height="100%">
    			<defs>
    				<filter id="blurEffect">
    					<feGaussianBlur in="SourceGraphic" stdDeviation="1"/> <!-- Ajuste stdDeviation pour plus ou moins de flou -->
    				</filter>
    				<radialGradient id="gradientDark" cx="50%" cy="50%" r="50%">
    					<stop offset="0%" stop-color="#ffffff" stop-opacity="1"></stop>
    					<stop offset="90%" stop-color="#ffffff" stop-opacity="0"></stop>
    				</radialGradient>
    				<radialGradient id="gradientLight" cx="50%" cy="50%" r="50%">
    					<stop offset="0%" stop-color="#000000" stop-opacity="1"></stop>
    					<stop offset="90%" stop-color="#000000" stop-opacity="0"></stop>
    				</radialGradient>
    			</defs>
        		<g id="path_container" class="lines"></g>
    			<g id="circ_container" class="balls"></g>
    		</svg>
            <div id="column-1" class="column column-1"></div>
            <div id="column-2" class="column column-2"></div>
            <div id="column-3" class="column column-3"></div>
        </div>
	`;

}

/**********************************/
/* fonction de creation des box : */
/* qty par col                    */
/**********************************/
export function addBox(col1, col2, col3, appendTo) {
    
    const boxCounts = [col1, col2, col3];
    
    boxCounts.forEach((count, columnIndex) => {
        const column = appendTo.querySelector(`#dashboard > #column-${columnIndex + 1}`); // Accède aux colonnes via querySelector

        if (column) {
            const gapPercentage = count === 3 ? '5%' : count === 2 ? '10%' : '0';
            column.style.gap = gapPercentage; // Applique le gap à la colonne

            for (let i = 1; i <= count; i++) {
                
                const content = document.createElement('div'); // Crée un nouvel élément div
                content.id = `content_${columnIndex + 1}-${i}`; // Définit l'id de la box
                content.className = 'content'; // Applique la classe 'content'
                
                const graph = document.createElement('div'); // Crée un nouvel élément div
                graph.id = `graph_${columnIndex + 1}-${i}`;
                graph.className = 'graph';
                
                const gauge = document.createElement('div'); // Crée un nouvel élément div
                gauge.id = `gauge_${columnIndex + 1}-${i}`;
                gauge.className = 'gauge';
                gauge.style.height = `0px`;
                
                const box = document.createElement('div'); // Crée un nouvel élément div
                box.id = `box_${columnIndex + 1}-${i}`; // Définit l'id de la box
                box.className = 'box'; // Applique la classe 'box'
                box.appendChild(graph);
                box.appendChild(gauge);
                box.appendChild(content);
                column.appendChild(box); // Ajoute la box à la colonne
            }
        } else {
            console.warn(`Colonne ${columnIndex + 1} introuvable.`);
        }
    });
}

/****************************************/
/* fonction d'ajout des ancres :        */
/* liste les ancres a créer das les box */
/* puis lance la fonction creatAnchors  */
/* en fonction des param du YAML        */
/****************************************/
export function addAnchors(config, appendTo) {
    
    // Parcourir tous les devices dans la configuration
    Object.entries(config.devices || {}).forEach(([boxKey, device]) => {
        if (device?.anchors) {
            // Extraire les ancres définies pour le device
            const anchors = device.anchors.split(', ').map((anchors) => {
                const [type, qtyStr] = anchors.split('-'); // Exemple : "R-1" devient ["R", "1"]
                const qty = parseInt(qtyStr, 10); // Quantité d'ancres à créer
                return { box: boxKey, type, qty };
            });

            // Traiter chaque ancre
            anchors.forEach(({ type, qty }) => {
                const col = parseInt(boxKey[0], 10); // Première partie du boxKey (colonne)
                const box = parseInt(boxKey[2], 10); // Troisième partie du boxKey (box)
                
                // Appeler la fonction creatAnchors
                creatAnchors(col, box, qty, type, appendTo);
            });
        }
    });
}

/****************************************/
/* fonction de creation des ancres :    */
/* recoit en param la colonne, la box,  */
/* le nombre à créer par coté, et       */
/* le coté(position)                    */
/****************************************/
function creatAnchors(colNbrs, boxNbrs, numAnchors, type, appendTo) {
	const box = appendTo.querySelector(`#dashboard > #column-${colNbrs} > #box_${colNbrs}-${boxNbrs}`); // Accède aux colonnes via querySelector
	
	if (!box) {
		console.error(`Boîte avec l'ID "box_${colNbrs}-${boxNbrs}" introuvable.`);
		return;
	}

	// Ajouter les nouveaux anchors
	for (let i = 0; i < numAnchors; i++) {
		const anchor = document.createElement('div');
		
		anchor.className = 'anchor anchor-'+type;
		anchor.id = `anchor_${colNbrs}-${boxNbrs}_${type}-${i+1}`;
		
		// Calculer la position de chaque anchor
		const positionPercent = ((i + 1) / (numAnchors + 1)) * 100; // Uniformément réparti
		
		if(type === "T" ||  type === "B")
			anchor.style.left = `${positionPercent}%`;
		else {
			anchor.style.top = `${positionPercent}%`;
		}
		
		// Ajouter l'anchor à la boîte
		box.appendChild(anchor);
	}
}

/**********************************************/
/* fonction de remplissage des box :          */
/* recoit en param les diferents devices,     */
/* le style eventuel ou la taille des strings */
/* (defini ou auto),                          */
/**********************************************/
export function fillBox(config, styles, isDark, hass, appendTo) {
    
    const devices = config.devices || [];
    
    for (const boxId in devices) {
        
        const boxIdtest = parseInt(boxId[2], 10);
        const boxIdmax = parseInt(config.param[`boxCol${boxId[0]}`], 10);
        
        if(boxIdtest > boxIdmax )  {
    		console.error(`Boîte avec l'ID "${boxIdtest}" introuvable.`);
    		return;
    	}
            
        const device = devices[boxId];
            
        const divGraph = appendTo.querySelector(`#dashboard > #column-${boxId[0]} > #box_${boxId} > #graph_${boxId}`);
        const divGauge = appendTo.querySelector(`#dashboard > #column-${boxId[0]} > #box_${boxId} > #gauge_${boxId}`);
        const innerContent = appendTo.querySelector(`#dashboard > #column-${boxId[0]} > #box_${boxId} > #content_${boxId}`);
                
        let state = hass.states[device.entity];
        let value = state ? state.state : 'N/C';
        let unit = state && state.attributes.unit_of_measurement ? state.attributes.unit_of_measurement : '';
            
        let addGauge = "";
        let addHeaderEntity = "";
        let addEntity2 = "";
        let addFooter = "";
        let addHeaderStyle = "";
        let addSensorStyle = "";
        let addSensor2Style = "";
        let addFooterStyle = "";
        
        if(device.graph) creatGraph(boxId, device, isDark, appendTo);
        
        if(device.gauge) divGauge.style.height = value + `%`;
        else divGauge.style.height = `0px`;
            
        if(styles.header != "") {
            if(styles.header == "auto") {
                
                let dynSizeHeader = "";
                
                if(boxId[0] == "2") dynSizeHeader = Math.round(0.0693*innerContent.offsetWidth+1.9854);
                else dynSizeHeader = Math.round(0.0945*innerContent.offsetWidth+2.209);

                addHeaderStyle = ` style="font-size: ${dynSizeHeader}px;"`;
                
            } else {
                addHeaderStyle = ` style="font-size: ${styles.header}px;"`;
            }
        } 
        
        if(styles.sensor != "") {
            if(styles.sensor == "auto") {
                    
                let dynSizeSensor = "";
                    
                if(boxId[0] == "2") dynSizeSensor = Math.round(0.1065*innerContent.offsetWidth+8.7929);
                else dynSizeSensor = Math.round(0.1452*innerContent.offsetWidth+9.0806);
                    
                addSensorStyle = ` style="font-size: ${dynSizeSensor}px;"`;
                    
            } else {
                addSensorStyle = ` style="font-size: ${styles.sensor};"`;
            }
        }
        
        if(styles.sensor2 != "") {
            if(styles.sensor == "auto") {
                    
                let dynSizeSensor2 = "";
                    
                if(boxId[0] == "2") dynSizeSensor2 = Math.round(0.0693*innerContent.offsetWidth+1.9854);
                else dynSizeSensor2 = Math.round(0.0945*innerContent.offsetWidth+2.209);
                    
                addSensor2Style = ` style="font-size: ${dynSizeSensor2}px;"`;
                    
            } else {
                addSensor2Style = ` style="font-size: ${styles.sensor2}px;"`
            }
        }
            
        if(styles.footer != "") {
            if(styles.footer == "auto") {
                    
                let dynSizeFooter = "";
                    
                if(boxId[0] == "2") dynSizeFooter = Math.round(0.0803*innerContent.offsetWidth-2.438);
                else dynSizeFooter = Math.round(0.1095*innerContent.offsetWidth-2.1791);
                    
                addFooterStyle = ` style="font-size: ${dynSizeFooter}px;"`;
                    
            } else {
                addFooterStyle = ` style="font-size: ${styles.footer};"`;
            }
        }
            
        if(device.headerEntity) {
            const stateHeaderEnt = hass.states[device.headerEntity];
            const valueHeaderEnt = stateHeaderEnt ? stateHeaderEnt.state : '';
            const unitvalueHeaderEnt = stateHeaderEnt && stateHeaderEnt.attributes.unit_of_measurement ? stateHeaderEnt.attributes.unit_of_measurement : '';
                
            addHeaderEntity = `
                <div class="headerEntity">${valueHeaderEnt}<div class="boxUnit">${unitvalueHeaderEnt}</div></div>
            `;
        }
        
        if(device.entity2) {
            const stateEntity2 = hass.states[device.entity2];
            const valueEntity2 = stateEntity2 ? stateEntity2.state : '';
            const unitvalueEntity2 = stateEntity2 && stateEntity2.attributes.unit_of_measurement ? stateEntity2.attributes.unit_of_measurement : '';
                
            addEntity2 = `
                <div class="boxSensor2"${addSensor2Style}>${valueEntity2}<div class="boxUnit">${unitvalueEntity2}</div></div>
            `;
        }
            
        if(device.footerEntity1) {
                
            const stateFooterEnt1 = hass.states[device.footerEntity1];
            const valueFooterEnt1 = stateFooterEnt1 ? stateFooterEnt1.state : '';
            const unitvalueFooterEnt1 = stateFooterEnt1 && stateFooterEnt1.attributes.unit_of_measurement ? stateFooterEnt1.attributes.unit_of_measurement : '';
                
            const stateFooterEnt2 = hass.states[device.footerEntity2];
            const valueFooterEnt2 = stateFooterEnt2 ? stateFooterEnt2.state : '';
            const unitvalueFooterEnt2 = stateFooterEnt2 && stateFooterEnt2.attributes.unit_of_measurement ? stateFooterEnt2.attributes.unit_of_measurement : '';
                
            const stateFooterEnt3 = hass.states[device.footerEntity3];
            const valueFooterEnt3 = stateFooterEnt3 ? stateFooterEnt3.state : '';
            const unitvalueFooterEnt3 = stateFooterEnt3 && stateFooterEnt3.attributes.unit_of_measurement ? stateFooterEnt3.attributes.unit_of_measurement : '';
            
            addFooter = `
                <div class="boxFooter"${addFooterStyle}>
                    <div class="footerCell">${valueFooterEnt1}<div class="boxUnit">${unitvalueFooterEnt1}</div></div>
                    <div class="footerCell">${valueFooterEnt2}<div class="boxUnit">${unitvalueFooterEnt2}</div></div>
                    <div class="footerCell">${valueFooterEnt3}<div class="boxUnit">${unitvalueFooterEnt3}</div></div>
                </div>
            `;
        }
            
        innerContent.innerHTML = `
            <div class="boxHeader"${addHeaderStyle}>
                <ha-icon icon="${device.icon}" class="boxIcon"></ha-icon>
                <div class="boxTitle">${device.name}</div>
                ${addHeaderEntity}
            </div>
            <div class="boxSensor1"${addSensorStyle}>${value}<div class="boxUnit">${unit}</div></div>
            ${addEntity2}
            ${addFooter}
        `;
        
        if (!innerContent.dataset.listener) {
            innerContent.dataset.listener = "true"; // Marque comme ayant un listener
        
            innerContent.addEventListener('click', () => {
                const entityId = device.entity; // Remplace par l'entité associée à la div
        
                // Déclenche l'événement "more-info" de Home Assistant
                const event = new Event('hass-more-info', { bubbles: true, composed: true });
                event.detail = { entityId }; // Passer l'entité à afficher
                innerContent.dispatchEvent(event);
            });
        }
    }
}

function creatGraph (boxId, device, isDark, appendTo) {
    
    if(!updateGraphTriggers.get(device.entity)) return;
    
    const divGraph = appendTo.querySelector(`#dashboard > #column-${boxId[0]} > #box_${boxId} > #graph_${boxId}`);
    const data = historicData.get(device.entity);
    
    if (!data || data.length === 0) {
        console.warn(`Aucune donnée pour l'entité ${device.entity}.`);
        return;
    }
    
    //console.log(data);
    if (!data || data.length === 0) {
        console.warn(`Données non disponibles pour ${device.entity}.`);
        updateGraphTriggers.set(device.entity, false); // Désactiver temporairement le trigger
        return;
    }
    
    // Générer le path SVG
    const pathD = generatePath(data, 500, 99); // Dimensions SVG fixées pour cet exemple

    let colorPath = "#00000077";
    if(isDark) {
        colorPath = "#ffffff77";
    } 
    
    divGraph.innerHTML = `
        <svg viewBox="0 0 500 100" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style="width: 100%; height: 100%;">
            <path fill="none" stroke="${colorPath}" stroke-width="3" d="${pathD}" />
        </svg>
    `;

    updateGraphTriggers.set(device.entity, false);
}

function generatePath(data, svgWidth = 500, svgHeight = 100) {
    if (!data || data.length === 0) return '';

    // Étape 1 : Calculer min/max pour normalisation
    const minY = Math.min(...data.map(d => d.value));
    const maxY = Math.max(...data.map(d => d.value));

    // Étape 2 : Normalisation des points
    const normalizedData = data.map((d, index) => ({
        x: (index / (data.length - 1)) * svgWidth, // Répartition uniforme des X
        y: svgHeight - ((d.value - minY) / (maxY - minY)) * svgHeight, // Normalisation Y inversée (SVG : 0 en haut)
    }));

    // Étape 3 (optionnel) : Simplification des points
    //const simplifiedData = simplifyPath(normalizedData, 3); // Tolérance à ajuster
    const simplifiedData = normalizedData;
    
    // Étape 4 : Construction du path
    let path = `M${simplifiedData[0].x},${simplifiedData[0].y}`; // Point de départ
    for (let i = 1; i < simplifiedData.length; i++) {
        const prev = simplifiedData[i - 1];
        const curr = simplifiedData[i];
        const midX = (prev.x + curr.x) / 2; // Point médian pour une courbe fluide
        path += ` Q${prev.x},${prev.y} ${midX},${curr.y}`;
    }
    path += ` T${simplifiedData[simplifiedData.length - 1].x},${simplifiedData[simplifiedData.length - 1].y}`; // Dernier point

    return path;
}

function simplifyPath(points, tolerance) {
    if (points.length <= 2) return points; // Pas besoin de simplification si 2 points ou moins

    const sqTolerance = tolerance * tolerance;

    // Fonction pour calculer la distance au carré d'un point à une ligne
    function getSqSegmentDistance(p, p1, p2) {
        let x = p1.x, y = p1.y;
        let dx = p2.x - x, dy = p2.y - y;

        if (dx !== 0 || dy !== 0) {
            const t = ((p.x - x) * dx + (p.y - y) * dy) / (dx * dx + dy * dy);
            if (t > 1) {
                x = p2.x;
                y = p2.y;
            } else if (t > 0) {
                x += dx * t;
                y += dy * t;
            }
        }

        dx = p.x - x;
        dy = p.y - y;

        return dx * dx + dy * dy;
    }

    // Fonction récursive principale
    function simplifyRecursive(start, end, sqTolerance, simplified) {
        let maxSqDist = sqTolerance;
        let index;

        for (let i = start + 1; i < end; i++) {
            const sqDist = getSqSegmentDistance(points[i], points[start], points[end]);
            if (sqDist > maxSqDist) {
                index = i;
                maxSqDist = sqDist;
            }
        }

        if (maxSqDist > sqTolerance) {
            if (index - start > 1) simplifyRecursive(start, index, sqTolerance, simplified);
            simplified.push(points[index]);
            if (end - index > 1) simplifyRecursive(index, end, sqTolerance, simplified);
        }
    }

    const simplified = [points[0]];
    simplifyRecursive(0, points.length - 1, sqTolerance, simplified);
    simplified.push(points[points.length - 1]);

    return simplified;
}

/******************************************************/
/* fonction d'ajout des liens entre les box :     */
/* compare les tailles d'une boucle "set hass" à      */
/* l'autre et si il y a changement lance la           */
/* fonction addLine (donc a la premiere boucle aussi) */
/******************************************************/
export function checkReSize(devices, isDarkTheme, appendTo) {
    
    // recuperation de la taille de la carte pour recalcul des path si necessaire
    const rect = appendTo.querySelector(`#dashboard`).getBoundingClientRect();
    
    // si largeur differente de precedemment : recalcul
    if(dashboardOldWidth != rect.width) {
        
        // conteneur des path et des circles
        const pathContainer = appendTo.querySelector(`#dashboard > #svg_container > #path_container`);
        const circContainer = appendTo.querySelector(`#dashboard > #svg_container > #circ_container`);
		
        // si le DOM est fini...
        const checkReady = () => {
            const dashboard = appendTo.querySelector("#dashboard");
        
            if (dashboard) {
                    
                // verification si la fenetre principale de home assistant est inerte (ou si le fenetre de conf card est ouverte)
                const homeAssistant = window.document.querySelector('home-assistant');
                const homeAssistantMain = homeAssistant.shadowRoot.querySelector('home-assistant-main');
                const hasInert = homeAssistantMain.hasAttribute('inert');
                    
                // different cas...
                if (mustRedrawLine) { // suite a une mise a jour du yaml
                        
                    pathContainer.innerHTML = "";
					if (circContainer) circContainer.innerHTML = "";
                    addLine(devices, isDarkTheme, appendTo);
                        
                } else if(hasInert && !editorOpen) { // premiere boucle a l'ouverture de l'editeur

                    editorOpen = true;
                        
                    pathContainer.innerHTML = "";
					if (circContainer) circContainer.innerHTML = "";
                    addLine(devices, isDarkTheme, appendTo);
                        
                } else if (hasInert && editorOpen) { // boucles suivantes apres premiere ouverture de l'editeur... plus de mise à jour
                        
                } else if (!hasInert && editorOpen) {
                        
                    editorOpen = false;

                    pathContainer.innerHTML = "";
					if (circContainer) circContainer.innerHTML = "";
                    addLine(devices, isDarkTheme, appendTo);
                        
                } else {

                    pathContainer.innerHTML = "";
					if (circContainer) circContainer.innerHTML = "";
                    addLine(devices, isDarkTheme, appendTo);
                        
                }
                
                mustRedrawLine = false;
                return; // Arrête la boucle
            }
        
            // Sinon, replanifie la vérification
            requestAnimationFrame(checkReady);
        };
        
        // Lancer la vérification initiale
        requestAnimationFrame(checkReady);
        
    }
        
    // mise à jour de la largeur de la carte dans la variable globale pour comparaison au tour suivant
    dashboardOldWidth = rect.width;
}

export function razDashboardOldWidth() {
    mustRedrawLine = true;
}

/********************************************************/
/* fonction de lancement de creation de liens entre     */
/* les box :                                            */
/* recupere les params de creation et lance la fonction */
/* creatLine en concequence                             */
/********************************************************/
function addLine(devices, isDarkTheme, appendTo) {
	for (const boxId in devices) {
        const device = devices[boxId];
        
        // Parcours des liens numérotés
        const links = device.link;
        
        if(links !== "nolink") {
            for (const linkId in links) {
                const link = links[linkId];
                
                if(link == "nolink") continue;
                
                const inv = link.inv === true ? -1 : 1;          // Par défaut, "inv" est 1 s'il n'est pas défini
                        
                // Affichage des informations du lien
                if (link.start && link.end) creatLine(`${boxId}_${link.start}`, link.end, inv, isDarkTheme, appendTo);
                                
            }
    	}
    }
}

function isHorizontalAnchor(anchorId) {
  // L/R => sortie horizontale, T/B => sortie verticale
  return anchorId.includes("_L-") || anchorId.includes("_R-");
}
function anchorOutDir(anchorId) {
  if (anchorId.includes("_L-")) return { dx: -1, dy: 0 };
  if (anchorId.includes("_R-")) return { dx:  1, dy: 0 };
  if (anchorId.includes("_T-")) return { dx: 0, dy: -1 };
  if (anchorId.includes("_B-")) return { dx: 0, dy:  1 };
  return { dx: 0, dy: 0 };
}
function roundedOrthogonalPath(points, r0 = 18) {
  if (!points || points.length < 2) return "";

  const segLen = (a, b) => Math.hypot(b.x - a.x, b.y - a.y);

  // Cas simple
  if (points.length === 2) {
    return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;
  }

  let d = `M ${points[0].x} ${points[0].y}`;

  for (let i = 1; i < points.length - 1; i++) {
    const p0 = points[i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];

    const v1x = p1.x - p0.x;
    const v1y = p1.y - p0.y;
    const v2x = p2.x - p1.x;
    const v2y = p2.y - p1.y;

    const len1 = segLen(p0, p1);
    const len2 = segLen(p1, p2);

    // Si pas un "coin" (colinéaire) ou segment trop court => line direct
    const isCorner = (v1x !== 0 || v1y !== 0) && (v2x !== 0 || v2y !== 0) && (v1x === 0) !== (v2x === 0);
    if (!isCorner || len1 < 0.001 || len2 < 0.001) {
      d += ` L ${p1.x} ${p1.y}`;
      continue;
    }

    // Rayon adaptatif : doit "rentrer" dans les 2 segments adjacents
    const r = Math.max(0, Math.min(r0, len1 / 2, len2 / 2));

    if (r <= 0.001) {
      d += ` L ${p1.x} ${p1.y}`;
      continue;
    }

    // point avant le coin (reculer de r sur le segment p0->p1)
    const pIn = {
      x: p1.x - (v1x !== 0 ? Math.sign(v1x) * r : 0),
      y: p1.y - (v1y !== 0 ? Math.sign(v1y) * r : 0),
    };
    // point après le coin (avancer de r sur le segment p1->p2)
    const pOut = {
      x: p1.x + (v2x !== 0 ? Math.sign(v2x) * r : 0),
      y: p1.y + (v2y !== 0 ? Math.sign(v2y) * r : 0),
    };

    // Sweep pour l’arc (sens horaire/anti-horaire) via produit vectoriel 2D
    // v1 (entrant) = (p1 - p0), v2 (sortant) = (p2 - p1)
    const cross = v1x * v2y - v1y * v2x;
	const sweep = cross < 0 ? 0 : 1;

    d += ` L ${pIn.x} ${pIn.y}`;
    d += ` A ${r} ${r} 0 0 ${sweep} ${pOut.x} ${pOut.y}`;
  }

  // dernier point
  const last = points[points.length - 1];
  d += ` L ${last.x} ${last.y}`;
  return d;
}

/*********************************************************/
/* fonction de creation des liens entre les box :        */
/* recoit en param l'ancre de depart, l'ancre d'arrivée, */
/* le sens initial de deplacement de l'animation         */
/*********************************************************/
function creatLine(anchorId1, anchorId2, direction_init, isDarkTheme, appendTo) {
    
    const pathContainer = appendTo.querySelector(`#dashboard > #svg_container > #path_container`);
	const circContainer = appendTo.querySelector(`#dashboard > #svg_container > #circ_container`);
	
	if (!circContainer) {
	  console.error("circContainer introuvable.");
	  return;
	}

	if (!pathContainer) {
		console.error("pathContainer container introuvable.");
		return;
	}
	
	var coords1 = getAnchorCoordinates(anchorId1, appendTo);
	var coords2 = getAnchorCoordinates(anchorId2, appendTo);
	
	if (!coords1 || !coords2) {
		console.error("Impossible de calculer les coordonnées.");
		return;
	}
	
	let pathData = "";

	// petite "sortie" depuis l’ancre (comme Victron, mais paramétrable)
	const stub = 5;     // longueur sortie/entrée
	const r0   = 40;     // rayon "idéal" (sera réduit si pas la place)

	// Point de départ / arrivée
	const pStart = { x: coords1.x, y: coords1.y };
	const pEnd   = { x: coords2.x, y: coords2.y };

	// Sortie depuis l’ancre 1
	const d1 = anchorOutDir(anchorId1);
	const p1 = { x: pStart.x + d1.dx * stub, y: pStart.y + d1.dy * stub };

	// Entrée vers l’ancre 2 (on arrive depuis l’extérieur)
	const d2 = anchorOutDir(anchorId2);
	const p2 = { x: pEnd.x + d2.dx * stub, y: pEnd.y + d2.dy * stub };

	// On relie p1 -> p2 en orthogonal (H puis V ou V puis H)
	const dx = p2.x - p1.x;
	const dy = p2.y - p1.y;

	const startH = isHorizontalAnchor(anchorId1);
	const endH   = isHorizontalAnchor(anchorId2);

	let points = null;

	if (startH && endH) {
	  const xMid = Math.round((p1.x + p2.x) / 2);

	  const dx1 = Math.abs(xMid - p1.x);
	  const dy1 = Math.abs(p2.y - p1.y);

	  // Rayon global : peut aller jusqu’à dx/2, réduit si dy trop petit
	  const r = Math.max(0, Math.min(r0, dx1, dy1 / 2));

	  const sx = xMid >= p1.x ? 1 : -1;
	  const sy = p2.y >= p1.y ? 1 : -1;

	  // Si r==0 => L sec
	  if (r < 0.001) {
		pathData = `M ${pStart.x} ${pStart.y}
					L ${p1.x} ${p1.y}
					L ${xMid} ${p1.y}
					L ${xMid} ${p2.y}
					L ${p2.x} ${p2.y}
					L ${pEnd.x} ${pEnd.y}`;
	  } else {
		// 2 coins (haut et bas) avec même rayon r
		// coin 1 à (xMid, y1), coin 2 à (xMid, y2)
		const y1 = p1.y;
		const y2 = p2.y;

		const sweepTop = (sx === 1 && sy === 1) || (sx === -1 && sy === -1) ? 1 : 0;
		const sweepBot = 1 - sweepTop; // même orientation

		pathData = [
		  `M ${pStart.x} ${pStart.y}`,
		  `L ${p1.x} ${p1.y}`,
		  `L ${xMid - sx * r} ${y1}`,
		  `A ${r} ${r} 0 0 ${sweepTop} ${xMid} ${y1 + sy * r}`,
		  `L ${xMid} ${y2 - sy * r}`,
		  `A ${r} ${r} 0 0 ${sweepBot} ${xMid + sx * r} ${y2}`,
		  `L ${p2.x} ${p2.y}`,
		  `L ${pEnd.x} ${pEnd.y}`,
		].join(" ");
	  }
	}
	else {
	  // Cas simple : un seul virage (mix d’ancres ou TB/TB par défaut)
	  // On choisit une stratégie qui évite les segments nuls
	  const r0simple = r0;

	  // Choix du coin: H puis V (corner à x2,y1) ou V puis H (corner à x1,y2)
	  const preferH = startH || (!endH && Math.abs(dx) >= Math.abs(dy));

	  if (preferH) {
		// H -> V, coin en (p2.x, p1.y)
		const xC = p2.x;
		const yC = p1.y;

		const adx = Math.abs(xC - p1.x);
		const ady = Math.abs(p2.y - yC);
		const r = Math.max(0, Math.min(r0simple, adx, ady));

		const sx = xC >= p1.x ? 1 : -1;
		const sy = p2.y >= yC ? 1 : -1;

		if (r < 0.001) {
		  pathData = `M ${pStart.x} ${pStart.y}
					  L ${p1.x} ${p1.y}
					  L ${xC} ${yC}
					  L ${p2.x} ${p2.y}
					  L ${pEnd.x} ${pEnd.y}`;
		} else {
		  const sweep = (sx === 1 && sy === 1) || (sx === -1 && sy === -1) ? 1 : 0;
		  pathData = [
			`M ${pStart.x} ${pStart.y}`,
			`L ${p1.x} ${p1.y}`,
			`L ${xC - sx * r} ${yC}`,
			`A ${r} ${r} 0 0 ${sweep} ${xC} ${yC + sy * r}`,
			`L ${p2.x} ${p2.y}`,
			`L ${pEnd.x} ${pEnd.y}`,
		  ].join(" ");
		}
	  } else {
		// V -> H, coin en (p1.x, p2.y)
		const xC = p1.x;
		const yC = p2.y;

		const adx = Math.abs(p2.x - xC);
		const ady = Math.abs(yC - p1.y);
		const r = Math.max(0, Math.min(r0simple, adx, ady));

		const sx = p2.x >= xC ? 1 : -1;
		const sy = yC >= p1.y ? 1 : -1;

		if (r < 0.001) {
		  pathData = `M ${pStart.x} ${pStart.y}
					  L ${p1.x} ${p1.y}
					  L ${xC} ${yC}
					  L ${p2.x} ${p2.y}
					  L ${pEnd.x} ${pEnd.y}`;
		} else {
		  // Pour V->H le sweep est inversé par rapport au cas H->V
		  const sweep = (sx === 1 && sy === 1) || (sx === -1 && sy === -1) ? 0 : 1;
		  pathData = [
			`M ${pStart.x} ${pStart.y}`,
			`L ${p1.x} ${p1.y}`,
			`L ${xC} ${yC - sy * r}`,
			`A ${r} ${r} 0 0 ${sweep} ${xC + sx * r} ${yC}`,
			`L ${p2.x} ${p2.y}`,
			`L ${pEnd.x} ${pEnd.y}`,
		  ].join(" ");
		}
	  }
	}

	//points = points.filter((pt, i) => i === 0 || pt.x !== points[i - 1].x || pt.y !== points[i - 1].y);
	//pathData = roundedOrthogonalPath(points, r0);
    
	// Création de l'élément SVG <path>
	const path = document.createElementNS("http://www.w3.org/2000/svg", "path");

	if (!pathData.includes("NaN")) {
        path.setAttribute("d", pathData);
    } else {
        console.warn("Chemin SVG ignoré car pathData contient NaN");
        return;
    }
    
    path.setAttribute("fill", "none");
	path.setAttribute("stroke-width", "2");

	// Ligne principale
	path.classList.add("link-path");

	// Ajout au SVG
	pathContainer.appendChild(path);

	// ---- Multi balls ----
	const pathLength = path.getTotalLength();

	// Ajuste ces 2 valeurs à ton goût
	const spacingPx = 45;                    // distance entre balles
	const ballCount = Math.max(1, Math.floor(pathLength / spacingPx));

	// Rayon des balles
	const ballRadius = 4;

	// Créer les cercles
	const circles = [];
	for (let i = 0; i < ballCount; i++) {
	  const c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
	  c.setAttribute("r", String(ballRadius));
	  c.setAttribute("class", "ball");
	  c.setAttribute("fill", isDarkTheme ? "url(#gradientDark)" : "url(#gradientLight)");
	  circContainer.appendChild(c);
	  circles.push(c);
	}

	// Stocker direction + lancer animation
	directionControls.set(anchorId1, direction_init);

	const controls = animateBallsAlongPath(anchorId1, path, circles, appendTo);
	pathControls.set(anchorId1, controls);
}

/*********************************************************/
/* fonction de recuperation des coordonnées des ancres : */
/* recoit en param l'ancre recherché                     */
/*********************************************************/
function getAnchorCoordinates(anchorId, appendTo) {
	
	const columnIndex = anchorId[0];
	const boxIndex = anchorId.substring(0, 3);
	
	const anchor = appendTo.querySelector(`#dashboard > #column-${columnIndex} > #box_${boxIndex} > #anchor_${anchorId}`);
	const container = appendTo.querySelector(`#dashboard`);
	
	if (!anchor || !container) {
		console.error("Anchor ou container introuvable : " + anchorId);
		return null;
	}
	
	// Position de l'anchor dans le document
	const anchorRect = anchor.getBoundingClientRect();
	
	// Position du container dans le document
	const containerRect = container.getBoundingClientRect();
	
	// Calcul des coordonnées relatives
	const relativeX = (anchorRect.left - containerRect.left + anchorRect.width / 2)*1000/containerRect.width;
	const relativeY = (anchorRect.top - containerRect.top + anchorRect.height / 2)*600/containerRect.height;
	
	//const relativeX = anchorRect.left - containerRect.left + anchorRect.width / 2;
	//const relativeY = anchorRect.top - containerRect.top + anchorRect.height / 2;
	
	return { x: parseFloat(relativeX.toFixed(2)), y: parseFloat(relativeY.toFixed(2)) };
}

/******************************************************************/
/* fonction de lancement de l'animation sur les liens :           */
/* recoit en param l'id du lien dans le map (son ancre d'origine) */
/* necessaire pour recuperer le sens de base de circulation du    */
/* circle, le path pour le deplacement du circle, et le circle à  */
/* deplacer                                                       */
/******************************************************************/
function animateBallsAlongPath(anchorId1, path, circles, appendTo) {
  let direction = directionControls.get(anchorId1) ?? 1;

  const pathLength = path.getTotalLength();

  // vitesse : adapte à la largeur comme l’ancien fork (simple)
  const dashboard = appendTo.querySelector("#dashboard");
  const w = dashboard?.getBoundingClientRect().width ?? 1000;

  // plus w est grand, plus ça va vite (à ajuster)
  const speed = (w / 1000) * 0.8; // facteur
  const duration = Math.max(900, (pathLength / speed) * 16); // ms

  let start = performance.now();
  let rafId = null;

  function frame(now) {
    const elapsed = now - start;
    let base = (elapsed % duration) / duration; // 0..1

    // direction
    const dir = direction;
    const n = circles.length;

    for (let i = 0; i < n; i++) {
      let p = base + i / n;   // déphasage => plusieurs balles
      p = p % 1;

      if (dir === -1) p = 1 - p;
      if (dir === 0) {
        circles[i].style.display = "none";
        continue;
      } else {
        circles[i].style.display = "";
      }

      const pt = path.getPointAtLength(p * pathLength);
      circles[i].setAttribute("cx", pt.x);
      circles[i].setAttribute("cy", pt.y);
    }

    rafId = requestAnimationFrame(frame);
  }

  rafId = requestAnimationFrame(frame);

  function reverse(cmd) {
    const init = directionControls.get(anchorId1) ?? 1;
    direction = init * cmd; // -1,0,+1
  }

  return {
    reverse,
    stop: () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = null;
    },
  };
}

/******************************************************/
/* fonction de d'invertion de l'animation :           */
/* verifie la valeur de l'entité et change le sens si */
/* necessaire                                         */
/******************************************************/
export function checkForReverse(config, hass) {
	
  const devices = config?.devices || {};

  for (const boxId in devices) {
    const device = devices[boxId];
    const links = device.link;

    if (!links || links === "nolink") continue;

    for (const linkId in links) {
      const link = links[linkId];
      if (!link || link === "nolink") continue;

      const key = `${boxId}_${link.start}`;
      const pathControl = pathControls.get(key);
      if (!pathControl || typeof pathControl.reverse !== "function") continue;

      const stateObj = hass.states?.[link.entity];
      const raw = stateObj ? stateObj.state : "";
      const v = Number.parseFloat(raw);

      if (!Number.isFinite(v)) {
        pathControl.reverse(0);
        continue;
      }

      // ---- THRESHOLD LOGIC ----

      // 1️⃣ threshold spécifique lien
      const thresholdRaw = link.animationThreshold;
	  const threshold = Number(thresholdRaw);
	  
      // Si aucun threshold défini → comportement ancien
      if (threshold === null || !Number.isFinite(threshold)) {
        if (v < 0) pathControl.reverse(-1);
        else if (v > 0) pathControl.reverse(1);
        else pathControl.reverse(0);
        continue;
      }

      // ---- Si threshold défini ----

      if (Math.abs(v) < threshold) {
        pathControl.reverse(0);
      } else if (v < 0) {
        pathControl.reverse(-1);
      } else {
        pathControl.reverse(1);
      }
	  
	  
    }
  }
}

/******************************************************/
/* groupe de fonctions permettant de lancer la recup  */
/* de l'historique a interval regulier                */
/******************************************************/
export async function startPeriodicTask(config, hass) {
    
    clearAllIntervals();
    
    const devices = config.devices || [];
    
    for (const boxId in devices) {
        
        const device = devices[boxId];
            
        if(device.graph) {
            
            const intervalMinutes = 15;
            
            //console.log(`Tentative de démarrage de la tâche périodique pour ${device.entity}. Intervalle : ${intervalMinutes} minutes.`);
            
            // Vérifie si la première exécution réussit
            const firstExecutionSuccessful = await performTask(device.entity, hass);
            
            if (!firstExecutionSuccessful) {
                console.warn(`La première exécution a échoué pour ${device.entity}. Tâche périodique annulée.`);
                clearAllIntervals();
                return false; // Ne démarre pas la tâche périodique si la première exécution échoue
            }
            
            //console.log(`Première exécution réussie pour ${device.entity}. Mise en place de la tâche périodique.`);

            
            // Planifier la tâche périodique pour cette entité
            const intervalId = setInterval(() => {
                performTask(device.entity, hass);
            }, intervalMinutes * 60 * 1000);
    
            // Stocker l'intervalle dans la Map
            intervals.set(device.entity, intervalId);
        }
    }
    return true;
}

export function clearAllIntervals(appendTo) {
    // Arrêter toutes les tâches en cours
    intervals.forEach((intervalId, id) => {
        clearInterval(intervalId);
        //console.log(`Tâche pour l'entité "${id}" arrêtée.`);
    });
    intervals.clear();
}

function performTask(entityId, hass) {
    // Fonction à exécuter périodiquement pour chaque entité
    //console.log(`Tâche périodique en cours pour l'entité "${entityId}"...`);
    // Ici tu pourras ajouter la logique de récupération des données
    
    const historicalData = fetchHistoricalData(entityId, 24, hass); // recup sur 24h
    
    if (historicalData === "false") {
        console.warn(`Impossible de récupérer l'historique pour ${entityId}.`);
        return false; // Retourne "false" si l'historique n'a pas pu être récupéré
    }

    //console.log(`Tâche périodique réussie pour ${entityId}.`);
    return true; // Retourne "true" si tout s'est bien passé
}

async function fetchHistoricalData(entityId, periodInHours = 24, hass, numSegments = 6) {
    const now = new Date();
    const startTime = new Date(now.getTime() - periodInHours * 60 * 60 * 1000); // Période spécifiée

    if (!hass || !hass.states || !hass.states[entityId]) {
        console.error(`hass ou l'entité ${entityId} n'est pas encore disponible.`);
        return false;
    }

    // URL pour l'API Home Assistant
    const url = `history/period/${startTime.toISOString()}?filter_entity_id=${entityId}&minimal_response=true&significant_changes_only=true`;

    try {
        const response = await hass.callApi('GET', url);

        if (response.length === 0 || response[0].length === 0) {
            console.log(`Aucune donnée disponible pour "${entityId}" dans la période de ${periodInHours} heure(s).`);
            return false;
        }

        const rawData = response[0];

        // Étape 1 : Transformer les données en un format exploitable
        const formattedData = rawData
            .map((item) => ({
                time: new Date(item.last_changed),
                state: parseFloat(item.state), // Conversion en nombre
            }))
            .filter((item) => !isNaN(item.state)); // Filtrer les données invalides

        if (formattedData.length === 0) {
            console.log(`Aucune donnée valide formatée pour "${entityId}".`);
            return false;
        }

        // Étape 2 : Réduire les données en segments tout en maintenant l'échelle Y constante
        const interval = 30 * 60 * 1000; // 15 minutes en millisecondes
                const totalIntervals = (periodInHours * 60 * 60 * 1000) / interval; // Calcul du nombre d'intervalles pour la période donnée
                const startTimestamp = Math.floor(startTime.getTime() / interval) * interval;
            
                const reducedData = [];
                for (let i = 0; i < totalIntervals; i++) {
                    const targetTime = new Date(startTimestamp + i * interval);
                    const closest = formattedData.reduce((prev, curr) => {
                        return Math.abs(curr.time - targetTime) < Math.abs(prev.time - targetTime) ? curr : prev;
                    });
                    reducedData.push({ time: targetTime, value: closest.state });
                }
        
        // Étape 2bis : Ajouter les points min et max dans le tableau reducedData
        const segmentSize = Math.ceil(formattedData.length / numSegments);
        for (let i = 0; i < formattedData.length; i += segmentSize) {
            const segment = formattedData.slice(i, i + segmentSize);
        
            let minPoint = { value: Infinity, time: null };
            let maxPoint = { value: -Infinity, time: null };
        
            segment.forEach((point) => {
                if (point.state < minPoint.value) minPoint = { value: point.state, time: point.time };
                if (point.state > maxPoint.value) maxPoint = { value: point.state, time: point.time };
            });
        
            // Ajouter les min et max au tableau réduit
            reducedData.push({ time: minPoint.time, value: minPoint.value });
            reducedData.push({ time: maxPoint.time, value: maxPoint.value });
        }

        // Étape 3 : Trier par ordre chronologique
        reducedData.sort((a, b) => a.time - b.time);
        
        //console.log(reducedData);

        // Étape 4 : Stocker les données réduites
        historicData.set(
            entityId,
            reducedData.map((point) => ({
                time: point.time,
                value: point.value,
            }))
        );
        
        updateGraphTriggers.set(entityId, true);

        return true;
    } catch (error) {
        console.error('Erreur lors de la récupération de l’historique :', error);
        return false;
    }
}

export const getEntityNames = (entities) => {
  return entities?.split("|").map((p) => p.trim());
};

export const getFirstEntityName = (entities) => {
  const names = getEntityNames(entities);
  return names.length > 0 ? names[0] : "";
};


export function getDefaultConfig(hass) {
      
    const powerEntities = Object.keys(hass.states).filter((entityId) => {
        const stateObj = hass.states[getFirstEntityName(entityId)];
        const isAvailable =
          (stateObj.state && stateObj.attributes && stateObj.attributes.device_class === "power") || stateObj.entity_id.includes("power");
        return isAvailable;
    });
  
    function checkStrings(entiyId, testStrings) {
        const firstId = getFirstEntityName(entiyId);
        const friendlyName = hass.states[firstId].attributes.friendly_name;
        return testStrings.some((str) => firstId.includes(str) || friendlyName?.includes(str));
    }
  
    const gridPowerTestString = ["grid", "utility", "net", "meter"];
    const solarTests = ["solar", "pv", "photovoltaic", "inverter"];
    const batteryTests = ["battery"];
    const batteryPercentTests = ["battery_percent", "battery_level", "state_of_charge", "soc", "percentage"];
    const firstGridPowerEntity = powerEntities.filter((entityId) => checkStrings(entityId, gridPowerTestString))[0];
    const firstSolarPowerEntity = powerEntities.filter((entityId) => checkStrings(entityId, solarTests))[0];
    
    const currentEntities = Object.keys(hass.states).filter((entityId) => {
        const stateObj = hass.states[entityId];
        const isAvailable = stateObj && stateObj.state && stateObj.attributes && stateObj.attributes.unit_of_measurement === "A";
        return isAvailable;
    });
    const percentageEntities = Object.keys(hass.states).filter((entityId) => {
        const stateObj = hass.states[entityId];
        const isAvailable = stateObj && stateObj.state && stateObj.attributes && stateObj.attributes.unit_of_measurement === "%";
        return isAvailable;
    });
    const firstBatteryPercentageEntity = percentageEntities.filter((entityId) => checkStrings(entityId, batteryPercentTests))[0];
    
    const firstCurrentEntity = currentEntities.filter((entityId) => checkStrings(entityId, batteryTests))[0];
  
    return {
        param: {
            boxCol1: 2,
            boxCol3: 2,
        },
        theme: "dark",
        styles: {
            header: 10,
            sensor: 16,
        },
        devices: {
            "1-1": {
                icon: "mdi:transmission-tower",
                name: "Grid",
                entity: firstGridPowerEntity ?? "",
                anchors: "R-1",
                link: {
                    "1":{
                        start: "R-1",
                        end: "2-1_L-1",
                    },
                },
            },
            "1-2": {
                icon: "mdi:battery-charging",
                name: "Battery",
                entity: firstBatteryPercentageEntity ?? "",
                anchors: "R-1",
                gauge: "true",
                link: {
                    "1":{
                        start: "R-1",
                        end: "2-1_B-1",
                        entity: firstCurrentEntity ?? "",
                    },
                },
            },
            "2-1": {
                icon: "mdi:cellphone-charging",
                name: "Multiplus",
                anchors: "L-1, B-2, R-1",
            },
            "3-1": {
                icon: "mdi:home-lightning-bolt",
                name: "Home",
                entity: firstGridPowerEntity ?? "",
                anchors: "L-1",
                link: {
                    "1":{
                        start: "L-1",
                        end: "2-1_R-1",
                    },
                },
            },
            "3-2": {
                icon: "mdi:weather-sunny",
                name: "Solar",
                entity: firstSolarPowerEntity ?? "",
                anchors: "L-1",
                link: {
                    "1":{
                        start: "L-1",
                        end: "2-1_B-2",
                        entity: firstSolarPowerEntity ?? "",
                        inv: "true",
                    },
                },
            },
        },
    }
}

