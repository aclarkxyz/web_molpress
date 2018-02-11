/*
    MolPress

    (c) 2016-2018 Molecular Materials Informatics, Inc.

    All rights reserved
    
    http://molmatinf.com

	This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

///<reference path='../../WebMolKit/src/decl/corrections.d.ts'/>
///<reference path='../../WebMolKit/src/decl/jquery.d.ts'/>
///<reference path='../../WebMolKit/src/util/util.ts'/>
///<reference path='../../WebMolKit/src/data/DataSheet.ts'/>
///<reference path='../../WebMolKit/src/data/DataSheetStream.ts'/>
///<reference path='../../WebMolKit/src/aspect/Experiment.ts'/>
///<reference path='../../WebMolKit/src/ui/EmbedReaction.ts'/>
///<reference path='../../WebMolKit/src/ui/OptionList.ts'/>
///<reference path='../../WebMolKit/src/dialog/Dialog.ts'/>

/*
	Brings up a panel that invites the user to provide a reaction from some source, and then do something with it.
*/

class ImportReaction extends Dialog
{
	public onImport:(content:string) => void = null;

	private btnImport:JQuery;

	private xs:Experiment = null;
	private facet = EmbedReactionFacet.SCHEME.toString();
	private rows:number[] = [];
	private selected = 0;

	constructor()
	{
		super();
		
		this.title = 'Import Reaction';
		this.minPortionWidth = 80;
		this.maxPortionWidth = 95;
	}

	// builds the dialog content
	protected populate():void
	{
		let buttons = this.buttons(), body = this.body();

		this.btnImport = $('<button class="button button-primary">Import</button>').appendTo(buttons);
		this.btnImport.prop('disabled', true);
		this.btnImport.click(() => this.actionImport());

		buttons.append(' ');
		buttons.append(this.btnClose); // easy way to reorder

		body.append('Drag or paste a reaction to import it.');

		// setup drop events
		this.panelBoundary[0].addEventListener('dragover', (event) =>
		{
			event.stopPropagation();
			event.preventDefault();
			event.dataTransfer.dropEffect = 'copy';
		});
		this.panelBoundary[0].addEventListener('drop', (event) =>
		{
			event.stopPropagation();
			event.preventDefault();
			this.dropInto(event.dataTransfer);
		});
		
		// pasting: captures the menu/hotkey form
		let pasteFunc = (e:any) =>
		{
			// if widget no longer visible, detach the paste handler
			if (!$.contains(document.documentElement, this.panelBoundary[0]))
			{
				document.removeEventListener('paste', pasteFunc);
				return false;
			}

			let wnd = <any>window;
			if (wnd.clipboardData && wnd.clipboardData.getData) this.acquireText(wnd.clipboardData.getData('Text'));
			else if (e.clipboardData && e.clipboardData.getData) this.acquireText(e.clipboardData.getData('text/plain')); 
			e.preventDefault();
			return false;
		};
		document.addEventListener('paste', pasteFunc);

		this.btnImport.focus();
	}

	// ------------ private methods ------------

	// content is ready to roll, so bring it in
	private actionImport():void
	{
		let row = this.rows[this.selected];
		let rowXS = new Experiment();
		rowXS.addEntry(this.xs.getEntry(row));
		let xml = DataSheetStream.writeXML(rowXS.ds);

		let content = '[reaction facet="' + this.facet + '" encoding="base64"]\n';
		content += btoa(toUTF8(xml));
		content += '\n[/reaction]';

		this.onImport(content);
		this.close();
	}

	// replace the dialog content with an error message
	private showError(msg:string):void
	{
		this.body().text(msg);
		this.btnImport.prop('disabled', true);
	}

	// receive text of arbitrary format
	public acquireText(str:string):void
	{
		let ds:DataSheet = null;
		try {ds = DataSheetStream.readXML(str);}
		catch {} // silent

		if (ds == null)
		{
			// (when other format options are implemented, check for them)
			this.showError('Unrecognised format.');
			return;
		}
		else if (!Experiment.isExperiment(ds))
		{
			this.showError('DataSheet does not contain the Experiment aspect that is needed to describe a chemical reaction.');
			return;
		}
		if (ds.numRows == 0)
		{
			this.showError('Incoming content is blank.');
			return;
		}

		this.xs = new Experiment(ds);
		this.createContent();
		this.btnImport.prop('disabled', false);
	}

	// receive binary content of arbitrary format
	private acquireBinary(filename:string, data:ArrayBuffer):void
	{
		//this.showError('Unknown binary format.');
		
		// postulate that it's UTF8 text of some kind, and give it a try
		var bytes = new Uint8Array(data);
		let lines:string[] = [], stripe = '';
		const sz = bytes.length;
		for (let n = 0; n < sz; n++)
		{
			stripe += String.fromCharCode(bytes[n]);
			if (stripe.length > 100) {lines.push(stripe); stripe = '';}
		}
		lines.push(stripe);
		try {this.acquireText(fromUTF8(lines.join('')));}
		catch {this.showError('Unknown binary format.');}
	}

	// something was dragged into the sketcher area
	private dropInto(transfer:DataTransfer):void
	{
		let items = transfer.items;
		for (let n = 0; n < items.length; n++) 
		{
			if (items[n].kind == 'string')
			{
				items[n].getAsString((str:string) => this.acquireText(str));
				return;
			}
			if (items[n].kind == 'file')
			{
				let file = items[n].getAsFile();

				let reader = new FileReader();
				reader.onload = (event:ProgressEvent) => this.acquireBinary(file.name, reader.result);
				reader.readAsArrayBuffer(file);
			}
		}
	}

	// render the reaction(s) and selector metrics
	private createContent():void
	{
		let body = this.body();
		body.empty();

		let xs = this.xs, ds = xs.ds;

		this.facet = EmbedReactionFacet.SCHEME.toString();
		let facetOpt = new OptionList(['Header', 'Scheme', 'Quantity', 'Metrics']);
		facetOpt.setSelectedIndex(1);
		facetOpt.render($('<p></p>').appendTo(body));
		let facetValues = [EmbedReactionFacet.HEADER, EmbedReactionFacet.SCHEME, EmbedReactionFacet.QUANTITY, EmbedReactionFacet.METRICS];
		facetOpt.callbackSelect = (idx:number) => this.facet = facetValues[facetOpt.getSelectedIndex()].toString();	

		let table = $('<table></table>').appendTo($('<p></p>').appendTo(body));
		table.css('border-collapse', 'collapse');
		let radioList:JQuery[] = ds.numRows == xs.rowBlockCount(0) ? null : [];

		let policy = RenderPolicy.defaultColourOnWhite();

		this.selected = 0;
		this.rows = [];
		for (let n = 0; n < ds.numRows; n += xs.rowBlockCount(n))
		{
			this.rows.push(n);

			let tr = $('<tr></tr>').appendTo(table);

			if (radioList != null)
			{
				let tdRadio = $('<td></td>').appendTo(tr);
				radioList.push($('<input type="radio"></input>').appendTo(tdRadio));
			}

			let tdRxn = $('<td></td>').appendTo(tr);
			tdRxn.css('border', '1px solid #808080');

			let measure = new OutlineMeasurement(0, 0, policy.data.pointScale);
			let layout = new ArrangeExperiment(xs.getEntry(n), measure, policy);
			layout.limitTotalW = 1000;
			layout.includeStoich = true;
			layout.includeAnnot = true;
	
			layout.arrange();
	
			let metavec = new MetaVector();
			new DrawExperiment(layout, metavec).draw();
			metavec.normalise();
			let svg = $(metavec.createSVG()).appendTo(tdRxn);
		}

		if (radioList != null) for (let n = 0; n < radioList.length; n++)
		{
			const idx = n;
			radioList[n].prop('checked', idx == this.selected);
			radioList[n].change(() =>
			{
				this.selected = idx;
				for (let i = 0; i < radioList.length; i++) radioList[i].prop('checked', i == this.selected);
			});
		}
	}
}