export let pathControls = new Map();

export let directionControls = new Map();

export let intervals = new Map();

export let historicData = new Map();

export let updateGraphTriggers = new Map();

let dashboardOldWidth;

let mustRedrawLine = true;

let editorOpen = false;

/********************************************************/
/* Helper function to format entity state with separate */
/* unit styling using CSS class `boxUnit`.              */
/********************************************************/
function formatEntityWithUnit(hass) {
    return (entityId) => {
        // Look up entity state from hass.states using the entity ID
        const stateObj = hass.states[entityId];

        // Handle null/undefined state - return empty string for display
        if (!stateObj) {
            return '';
        }

        const formattedValue = hass.formatEntityState(stateObj);
        const unit = stateObj.attributes?.unit_of_measurement;

        // If formatted value ends with the unit, ensure it is styled correctly.
        if (unit && formattedValue.endsWith(unit)) {
          // Extract value with locale-specific spacing preserved
          const valueWithSpace = formattedValue.slice(0, -unit.length);
          return `${valueWithSpace}<div class="boxUnit">${unit}</div>`;
        }

        // Return formatted value as-is
        return formattedValue;
    };
}

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
        		<g id="path_container" class="balls"></g>
    			<g id="circ_container" class="lines"></g>
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
    const formatEntity = formatEntityWithUnit(hass);
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
        const rawValue = state ? state.state : 'N/C';
            
        let addGauge = "";
        let addHeaderEntity = "";
        let addEntity2 = "";
        let addFooter = "";
        let addHeaderStyle = "";
        let addSensorStyle = "";
        let addSensor2Style = "";
        let addFooterStyle = "";
        
        if(device.graph) creatGraph(boxId, device, isDark, appendTo);
        
        if(device.gauge) divGauge.style.height = rawValue + `%`;
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
            addHeaderEntity = `
                <div class="headerEntity">${formatEntity(device.headerEntity)}</div>
            `;
        }
        
        if(device.entity2) {
            addEntity2 = `
                <div class="boxSensor2"${addSensor2Style}>${formatEntity(device.entity2)}</div>
            `;
        }
            
        if(device.footerEntity1) {
            addFooter = `
                <div class="boxFooter"${addFooterStyle}>
                    <div class="footerCell">${formatEntity(device.footerEntity1)}</div>
                    <div class="footerCell">${formatEntity(device.footerEntity2)}</div>
                    <div class="footerCell">${formatEntity(device.footerEntity3)}</div>
                </div>
            `;
        }
            
        innerContent.innerHTML = `
            <div class="boxHeader"${addHeaderStyle}>
                <ha-icon icon="${device.icon}" class="boxIcon"></ha-icon>
                <div class="boxTitle">${device.name}</div>
                ${addHeaderEntity}
            </div>
            <div class="boxSensor1"${addSensorStyle}>${formatEntity(device.entity) || 'N/C'}</div>
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
        const circContainer = appendTo.querySelector(`#dashboard > #svg_container > #circ_container`);
        const pathContainer = appendTo.querySelector(`#dashboard > #svg_container > #path_container`);
            
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
                        
                    circContainer.innerHTML = "";
                    pathContainer.innerHTML = "";
                    addLine(devices, isDarkTheme, appendTo);
                        
                } else if(hasInert && !editorOpen) { // premiere boucle a l'ouverture de l'editeur

                    editorOpen = true;
                        
                    circContainer.innerHTML = "";
                    pathContainer.innerHTML = "";
                    addLine(devices, isDarkTheme, appendTo);
                        
                } else if (hasInert && editorOpen) { // boucles suivantes apres premiere ouverture de l'editeur... plus de mise à jour
                        
                } else if (!hasInert && editorOpen) {
                        
                    editorOpen = false;

                    circContainer.innerHTML = "";
                    pathContainer.innerHTML = "";
                    addLine(devices, isDarkTheme, appendTo);
                        
                } else {

                    circContainer.innerHTML = "";
                    pathContainer.innerHTML = "";
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

/*********************************************************/
/* fonction de creation des liens entre les box :        */
/* recoit en param l'ancre de depart, l'ancre d'arrivée, */
/* le sens initial de deplacement de l'animation         */
/*********************************************************/
function creatLine(anchorId1, anchorId2, direction_init, isDarkTheme, appendTo) {
    
    const circContainer = appendTo.querySelector(`#dashboard > #svg_container > #circ_container`);
    const pathContainer = appendTo.querySelector(`#dashboard > #svg_container > #path_container`);

    if (!circContainer) {
		console.error("circContainer container introuvable.");
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
	
	if (coords1.x === coords2.x || coords1.y === coords2.y) {
        pathData = `M ${coords1.x} ${coords1.y} L ${coords2.x} ${coords2.y}`;
    } else {
	
    	const anchor1isH = anchorId1.includes("L") || anchorId1.includes("R");
    	const anchor2isH = anchorId2.includes("L") || anchorId2.includes("R");

    	if (anchor1isH && anchor2isH) {
    		const midX = (coords1.x + coords2.x) / 2;
    		// Définition du chemin avec deux courbes symétriques
    		pathData = `
    			M ${coords1.x} ${coords1.y}
    			C ${midX} ${coords1.y}, ${midX} ${coords1.y}, ${midX} ${(coords1.y + coords2.y) / 2}
    			C ${midX} ${coords2.y}, ${midX} ${coords2.y}, ${coords2.x} ${coords2.y}
    		`;
    	} else if (!anchor1isH && !anchor2isH) {
    		const midY = (coords1.y + coords2.y) / 2;
    		// Définition du chemin avec deux courbes : vertical -> horizontal -> vertical
    		pathData = `
    			M ${coords1.x} ${coords1.y} 
    			C ${coords1.x} ${midY}, ${coords1.x} ${midY}, ${(coords1.x + coords2.x)/2} ${midY} 
    			C ${coords2.x} ${midY}, ${coords2.x} ${midY}, ${coords2.x} ${coords2.y}
    		`;
    	} else {
    		if (anchor1isH) {
    			coords1 = getAnchorCoordinates(anchorId2, appendTo);
    			coords2 = getAnchorCoordinates(anchorId1, appendTo);
    		}
    		const midY = (coords1.y + coords2.y) / 2;
    		// Définition du chemin avec un seul virage
    		pathData = `
    			M ${coords1.x} ${coords1.y} 
    			C ${coords1.x} ${coords2.y}, ${coords1.x} ${coords2.y}, ${coords2.x} ${coords2.y}
    		`;
    	}
    }
    
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
	//path.setAttribute("filter", "url(#blurEffect)"); // Utilisation du dégradé
	
	// Créer la boule avec le dégradé
	const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
	circle.setAttribute("class", "ball");
	circle.setAttribute("cx", coords1.x); // Départ de la boule
	circle.setAttribute("cy", coords1.y); // Départ de la boule
	circle.setAttribute("r", "4");
	if(isDarkTheme) circle.setAttribute("fill", "url(#gradientDark)"); // Utilisation du dégradé
	else circle.setAttribute("fill", "url(#gradientLight)"); // Utilisation du dégradé
	
	// Ajouter le path et le circle au groupe
	pathContainer.appendChild(path);
	circContainer.appendChild(circle);
	
	// Animer la boule le long du path et recuperation du pointeur de fonction "reverse"
	const controls = animateBallAlongPath(anchorId1, path, circle, appendTo);
	
	// ajout du pointeur "reverse" dans un "map" pour exploitation ulterieur
	pathControls.set(anchorId1, controls);
	
	// ajout de la direction d'origine de path dans un map
	directionControls.set(anchorId1, direction_init);
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
function animateBallAlongPath(anchorId1, path, circle, appendTo) {
	
	let direction = directionControls.get(anchorId1);
	
	const pathLength = path.getTotalLength(); // Longueur totale du path
	
	const box = appendTo.querySelector(`#dashboard`);
	const boxWidth = box.offsetWidth;

	const speed = boxWidth/10; // Vitesse de la boule en pixels par seconde 100/900
	const duration = pathLength / speed * 1000; // Durée de l'animation (en ms)
	let startTime;
	
	function reverseDirection(cmd) {
	    const directionInit = directionControls.get(anchorId1);
		direction = directionInit*cmd; // Inverser la direction
	}
	
	function moveBall(time) {
		if (!startTime) startTime = time;
		
		const elapsed = time - startTime; // Temps écoulé
		var progress = (elapsed % duration) / duration; // Progression sur l'animation (0 à 1)
		
		if (direction == -1) {
			progress = 1 - progress; // Inverse la progression pour revenir en arrière
		} if (direction == 0) {
			progress = 0; 
		}
		
		// Calculer la position actuelle sur le path, proportionnelle à la durée
		const point = path.getPointAtLength(progress * pathLength);
		
		// Déplacer la boule
		circle.setAttribute("cx", point.x);
		circle.setAttribute("cy", point.y);
		
		// Continuer l'animation
		requestAnimationFrame(moveBall);
	}
	
	// Démarrer l'animation
	requestAnimationFrame(moveBall);
	
	// renvoi le pointeur de la fonction "reverse"
	return {
		reverse: reverseDirection,
	};
}

/******************************************************/
/* fonction de d'invertion de l'animation :           */
/* verifie la valeur de l'entité et change le sens si */
/* necessaire                                         */
/******************************************************/
export function checkForReverse(devices, hass) {
    
    for (const boxId in devices) {
            const device = devices[boxId];
            
            // Parcours des liens numérotés
            const links = device.link;
            
            if(links !== "nolink") {
                for (const linkId in links) {
                    
                    const link = links[linkId];
                    
                    const stateLinkEnt = hass.states[link.entity];
                    const valueLinkEnt = stateLinkEnt ? stateLinkEnt.state : '';
                    
                    const pathControl = pathControls.get(`${boxId}_${link.start}`);
                    
                    if (pathControl && typeof pathControl.reverse === "function") {
                        if(valueLinkEnt < -0.5) pathControls.get(`${boxId}_${link.start}`).reverse(-1); 
                        else if(valueLinkEnt > 0.5) pathControls.get(`${boxId}_${link.start}`).reverse(1); 
                        else pathControls.get(`${boxId}_${link.start}`).reverse(0); 
                    } 
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