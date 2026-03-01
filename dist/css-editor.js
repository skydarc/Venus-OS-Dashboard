export function css(user) {
    var css =`
    
        #sl-tab-content {
              display: flex;
              flex-direction: column;
              height: 100%;
            }
    
            .content {
                /*padding: 16px;*/
            }
    
            .editor {
                display: flex;
                flex-direction: column;
                gap: 20px;
                padding: 20px 0px;
            }
            
            .devices-editor {
                display: flex;
                flex-direction: column;
                padding: 0px 0px;
            }
            
            .subTab-content {
                display: flex;
                flex-direction: column;
                gap: 20px;
                padding: 20px 0px;
            }
              
            .col{
                position: relative;
                display: flex;
                flex-direction: column;
                gap: 10px;
            }
              
            .row{
                position: relative;
                display: flex;
                flex-direction: row;
                align-items: center;
                gap: 10px;
            }
            
            .inner {
                padding: 10px 5px;
            }
            
            .cell{
                flex: 1; 
            }
            
            .cellx1-5{
                flex: 1.5; 
            }
              
            .left{
                position: relative;
                display: flex;
                justify-content: flex-start;
                align-items: center;
                gap: 10px;
            }
              
            .right{
                position: relative;
                display: flex;
                justify-content: flex-end;
                align-items: center;
                gap: 10px;
            }
            
            .contMenu {
                position: relative;
                display: flex;
                flex-direction: column;
                box-shadow: none;
                border-width: 1px;
                border-style: solid;
                border-color: var(--outline-color);
                border-radius: var(--ha-card-border-radius, 12px);
                padding: 0px 8px;

            }
            
            .headerMenu {
                font-weight: 500;
            }
            
            .noGap {
                gap: 0;
            }
			
			.disabled-section {
				opacity: 0.5;
				pointer-events: none;
			}
            
  `
    return css;

}
  
