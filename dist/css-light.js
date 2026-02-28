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
		
		.signIcon{
		  width: 16px;
		  height: 18px;
		  display: inline-block;
		  opacity: 0.9;
		  /* flèche type "play" */
		  clip-path: polygon(0 0, 100% 50%, 0 100%, 25% 50%);
		}

		.signIconPos{
		  /* bleu + vers la gauche */
		  background: #2f86ff;
		  transform: rotate(0deg);
		}

		.signIconNeg{
		  /* vert + vers la droite */
		  background: #37d27a;
		  transform: rotate(180deg);
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
			overflow: hidden;
		}

		.gauge.gaugeTexture::before {
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
			
			pointer-events: none;
		}
		
		/* Vague blanche dans la gauge (désactivée par défaut) */
		.gauge.chargeWave::after{
		  content: "";
		  position: absolute;
		  width: 100%;
		  height: 40px;           
		  bottom: -40px;

		  /* vague “douce” via 2 dégradés radiaux */
		  background: linear-gradient(
			to top,
			rgba(255,255,255,0.0),
			rgba(255,255,255,0.35)
		  );
		  
		  opacity: 0.9;

		  animation: gaugeWaveUp 1.8s linear infinite;
		  pointer-events: none;
		}

		/* Animation : la vague “monte” dans le fill */
		@keyframes gaugeWaveUp{
		  from { transform: translateY(0); }
		  to   { transform: translateY(-1000%); }
		}
		
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
		
		.box{
		  position: relative; /* important */
		}

		.sideGauge{
		  position: absolute;
		  right: 3%;
		  top: 5%;
		  bottom: 5%;
		  width: 4%;
		  border-radius: 4px;
		  background: rgba(0,0,255,0.08); /* ou noir en light si tu veux */
		  overflow: hidden;
		}

		.sideGaugeFill{
		  position: absolute;
		  left: 0;
		  right: 0;
		  bottom: 0;
		  height: 0%;
		  background: rgba(80,160,255,0.85); /* à ajuster */
		}
		
		.sideGaugeFill.sg-blue   { background: --line-color; }
		.sideGaugeFill.sg-orange { background: #ff9f2e; }
		.sideGaugeFill.sg-red    { background: #ff4b4b; }
		.sideGaugeFill.sg-green  { background: #2ecc71; }
		
		/* BACKGROUND (transparent) */
		.sideGauge.sg-blue   { background: rgba(0,0,255,0.08); }
		.sideGauge.sg-orange { background: rgba(255,159,46,0.15); }
		.sideGauge.sg-red    { background: rgba(255,75,75,0.15); }
		.sideGauge.sg-green  { background: rgba(46,204,113,0.15); }
  `
    return css;

}
  
