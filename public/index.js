const Index_template = document.createElement('template');
Index_template.innerHTML = `
	<div id="navitgation-panel" style="display: none;">
		<navitgation-panel></navitgation-panel>
	</div>

	<div id="login-page">
		<login-page></login-page>
	</div>
	<div id="report-page" style="display: none;">
		<report-page></report-page>
	</div>
	<div id="uplaod-page" style="display: none;">
		<uplaod-page></uplaod-page>
	</div>
	<div id="admin-page" style="display: none;">
		<admin-page></admin-page>
	</div>
	<div id="mexc-page" style="display: none;">
		<mexc-page></mexc-page>
	</div>
`
class IndexPage extends HTMLElement {
	constructor() {
		super();		
		this.attachShadow({mode:'open'});
		this.shadowRoot.appendChild(Index_template.content.cloneNode(true));
		EventBroker.listen('login Successful', this, this.login);
		EventBroker.listen('pageChanged', this, this.pageChange);
	}
	login(component){
		component.shadowRoot.querySelector('#uplaod-page').style.display = '';
		component.shadowRoot.querySelector('#login-page').style.display = 'none';
		component.shadowRoot.querySelector('#mexc-page').style.display = 'none';
		component.shadowRoot.querySelector('#admin-page').style.display = 'none';
		component.shadowRoot.querySelector('#report-page').style.display = 'none';
		component.shadowRoot.querySelector('#navitgation-panel').style.display = '';
	}
	pageChange(component, newPageName){
		if(newPageName==='Report'){
			component.shadowRoot.querySelector('#uplaod-page').style.display = 'none';
			component.shadowRoot.querySelector('#admin-page').style.display = 'none';
			component.shadowRoot.querySelector('#mexc-page').style.display = 'none';
		
			component.shadowRoot.querySelector('#report-page').style.display = '';
		}
		
		if(newPageName==='Upload'){
			component.shadowRoot.querySelector('#report-page').style.display = 'none';
			component.shadowRoot.querySelector('#admin-page').style.display = 'none';
			component.shadowRoot.querySelector('#mexc-page').style.display = 'none';
			
			component.shadowRoot.querySelector('#uplaod-page').style.display = '';
		}
		
		if(newPageName==='MEXC'){
			component.shadowRoot.querySelector('#report-page').style.display = 'none';
			component.shadowRoot.querySelector('#uplaod-page').style.display = 'none';
			component.shadowRoot.querySelector('#admin-page').style.display = 'none';
		
			component.shadowRoot.querySelector('#mexc-page').style.display = '';
		}
	}
}

window.customElements.define('index-page', IndexPage);