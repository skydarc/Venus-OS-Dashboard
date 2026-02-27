export function cssDataLight(user) {
    var css =`
    
        ha-card {
            --box-background-color: #ffffff;  	/* Couleur de fond de la box */
            --box-shadow-color: #38619b;      	/* Couleur de l'ombre de la box */
            --anchor-color: #38619b;            /* Couleur du point d'accroche */
	    --line-color: #4369a2; 				/* Couleur de la ligne */
        }
        
        .db-container {
            position: relative;
            width: 100%; /* Prend toute la largeur disponible */
            padding-bottom: 60%; /* Définit la hauteur à 60% de la largeur */
            overflow: hidden; /* Cache tout dépassement éventuel */
        }
        
  
        .dashboard {
            display: flex;
            width: 100%;
            height: 100%;
            padding: 25px 20px 15px 20px;
            border-radius: 10px;
            /*border: 1px solid #ccc;*/
            position: absolute;
            box-sizing: border-box;
            background-color: #fafafa;
            gap: 8%;
        }

        .column {
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            width: 33.33%;
        }

        .column-1 {
            width: 25%;
        }

        .column-2 {
            width: 34%;
        }

        .column-3 {
            width: 25%;
        }

        .box {
            background-color: var(--box-background-color);  /* Utilisation de la variable pour la couleur de fond */
            color: #484848;
            /*font-weight: bold;*/
            border-radius: 5px;
            box-shadow: 0px 0px 1px 2px var(--box-shadow-color);  /* Utilisation de la variable pour la couleur de l'ombre */
            height: 100%;
            /*max-height: 45%;*/
            margin: 5px;
            display: flex;
            justify-content: center;
            align-items: center;
            position: relative;
            
            padding: 3% 5%;
        }

        /* Point d'accroche */
        .anchor {
            position: absolute;
            background-color: var(--anchor-color); /* Utilisation de la variable pour la couleur du point d'accroche */
            border-radius: 50%; /* Rond */
			box-shadow: 0px 0px 1px 1px var(--anchor-color);
        }

        /* Position des points pour la colonne 2 */
        .box .anchor-L {
			width: 5px;
            height: 10px;
            left: -6px;
            top: 50%;
            transform: translateY(-50%);
			border-radius: 5px 0 0 5px;
        }

        .box .anchor-R {
			width: 5px;
            height: 10px;
            right: -6px;
            top: 50%;
            transform: translateY(-50%);
			border-radius: 0 5px 5px 0;
        }
		
		.box .anchor-T {
			width: 10px;
            height: 5px;
            top: -6px;
            left: 50%;
            transform: translateX(-50%);
			border-radius: 5px 5px 0 0;
        }
		
		.box .anchor-B {
			width: 10px;
            height: 5px;
            bottom: -6px;
            left: 50%;
            transform: translateX(-50%);
			border-radius: 0 0 5px 5px;
        }

        .line {
            position: absolute;
			left: 0px;
			top: 0px;
        }
		
		.line g path.link-path{
			stroke: var(--line-color);
			box-shadow: 0px 0px 1px 1px var(--line-color);
        }
		
		.ball {
			z-index: 1000;
		}
		

        .content {
            position: relative;
			display: flex;
			flex-direction: column;
			width: 100%;
			height: 100%;
			/*gap: calc(2.1vw - 15px);*/
			gap: 2%;
		}
		
		.boxHeader {
			display: flex;
			align-items: center;
			width: 100%;
			/*height: 15%;*/
			gap: 3%;
			z-index: 2;
		}
		
		.boxIcon {
			--mdc-icon-size: 1.2em;
			line-height: 1.2em;
			z-index: 2;
		}
		
		.boxTitle {
		    display: flex;
			align-items: center;
			width: 100%;
			font-size: calc(var(--card-width) * 0.1);;
			/*line-height: 1.8em;*/
			z-index: 2;
		}
		
		.headerEntity {
			/*position: absolute;*/
			display: flex;
			align-items: center;
			font-size: 1.1em;
			line-height: 1.1em;
			gap: 3%;
			z-index: 2;
		}
		
		.boxSensor1 {
			display: flex;
			align-items: center;
			width: 100%;
			font-size: 1em;
			line-height: 1em;
			z-index: 2;
			gap: 3%
		}
		
		.boxSensor2 {
			display: flex;
			align-items: center;
			width: 100%;
			font-size: 0.8em;
			line-height: 0.8em;
			z-index: 2;
			gap: 3%
		}
		
		.boxUnit {
			/*width: 100%;*/
			color: #aaaaaa;
			z-index: 2;
		}
		
		.graph {
			position: absolute;
			bottom: 15%;
			width: 100%;
			height: 30%;
			opacity: 1;
			z-index: 2;
			/*border-radius: 0 0 5px 5px;*/
		}
		
		.gauge {
			position: absolute;
			left: 0px;
			bottom: 0px;
			width: 100%;
			background: linear-gradient(to bottom, #70a1d5, #547dbb);
			opacity: 0.8;
			z-index: 1;
			border-radius: 0 0 5px 5px;
		}

		/*.gauge::before {
		    content: "";
		    position: absolute;
		    top: 0;
		    left: 0;
		    width: 100%;
		    height: 100%;
		    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 154' preserveAspectRatio='xMidYMid meet'%3E%3Cg transform='translate(0,154) scale(0.1,-0.1)' fill='%23fff' stroke='none'%3E%3Cpath d='M945 1296 c-102 -44 -124 -181 -41 -254 140 -123 338 67 219 209 -47 55 -116 72 -178 45z'/%3E%3Cpath d='M2405 1296 c-42 -18 -83 -69 -91 -112 -14 -77 44 -166 118 -179 18 -3 288 -5 600 -3 554 3 567 3 594 24 51 38 69 71 69 129 0 58 -18 91 -69 129 -27 21 -39 21 -609 23 -469 2 -588 0 -612 -11z'/%3E%3Cpath d='M405 526 c-42 -18 -83 -69 -91 -112 -14 -77 44 -166 118 -179 18 -3 288 -5 600 -3 554 3 567 3 594 24 51 38 69 71 69 129 0 58 -18 91 -69 129 -27 21 -39 21 -609 23 -469 2 -588 0 -612 -11z'/%3E%3Cpath d='M2945 526 c-102 -44 -124 -181 -41 -254 140 -123 338 67 219 209 -47 55 -116 72 -178 45z'/%3E%3C/g%3E%3C/svg%3E");

		    background-repeat: repeat;
		    background-size: 30px 12px;


		    mask-image: linear-gradient(to bottom, #fff4, transparent);
		    mask-repeat: no-repeat;
		    mask-size: 100% 100%;
		}*/
		
		.boxFooter {
			position: absolute;
			display: flex;
			bottom: 2px;
			width: 100%;
			font-size: 1em;
			align-items: center;
			gap: 3%;
			z-index: 1;
		}
		
		.footerCell {
			display: flex;
			line-height: 1em;
			align-items: center;
			justify-content: center;
			width: 30%;
			gap: 5%;
		}
		
		@keyframes flowDrops { to { stroke-dashoffset: -56; } }
		@keyframes flowTail  { to { stroke-dashoffset: -56; } }

		.flow-drops {
		  animation: flowDrops 1.2s linear infinite;
		  
		  stroke: rgba(0,0,255,0.4) !important;

		}
		
		.flow-drops-tail {
		  animation: flowTail 1.2s linear infinite;

		}
  `
    return css;

}
  
