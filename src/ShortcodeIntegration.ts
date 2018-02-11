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

/*
	Integration with the WordPress TinyMCE editor, to display chemical objects in WYSIWYG mode.
*/

class ShortcodeIntegration
{
	private SHORTCODES = ['molecule', 'reaction', 'collection'];
	private watermark = 0;
	private origin:{[id : string] : string} = {};

	// take the raw pre-HTML content that may include shortcodes and substitute out interesting ones for visuals
	public preprocess(src:string):string
	{
		let result = '';
		while (true)
		{
			let [pos, len, found] = this.detectShortcode(src);
			if (!len) 
			{
				result += src;
				break;
			}
			
			if (found)
			{
				result += src.substring(0, pos);
				result += this.embedGraphic(src.substring(pos, pos + len));
			}
			else result += src.substring(0, pos + len);

			src = src.substring(pos + len);
		}

		return result;
	}

	// returns the content back to the shortcode-containing pre-HTML
	public postprocess(src:string):string
	{
		let regex = /^(.*?)\<p id="(molpress_mcepreview_\w+)\">.*?\<\/p>(.*)$/;

		let result = '';
		while (true)
		{
			let match = src.match(regex);
			if (!match) break;
			result += match[1] + this.origin[match[2]] + '\n';
			src = match[3];
		}

		return result + src;
	}

	// ------------ private methods ------------

	// searches for the next shortcode in the given string and, if any, figures out how long it goes for; it may not necessarily
	// be a valid shortcode, but it will establish boundaries; return values are [pos, len, found], where pos & len define the
	// string snipping, while found is true if the section doesn't seem valid; a length of zero means found no candidates
	private detectShortcode(str:string):[number, number, boolean]
	{
		const sz = str.length;
		let pos = -1, code = '';
		for (let c of this.SHORTCODES)
		{
			let i = str.indexOf('[' + c);
			if (i < 0) continue;
			if (pos < 0 || i < pos) {pos = i; code = c;}
		}
		if (pos < 0) return [-1, 0, false];

		// first option: self-closed tag, e.g. '/]' or '/ ]'
		let len = 1 + code.length;
		for (let quoted = false; len < sz; len++)
		{
			let ch = str.charAt(pos + len);
			if (ch == '"') {quoted = !quoted; continue;}
			if (quoted) continue;
			if (ch == '\n' || ch == ']') break;
			if (ch != '/') continue;
			if (len < sz - 1 && str.charAt(pos + len + 1) == ']') return [pos, len + 2, true];
			if (len < sz - 2 && str.charAt(pos + len + 1) == ' ' && str.charAt(pos + len + 2) == ']') return [pos, len + 3, true];
		}

		// keep looking beyond current length for closing tag
		let ctag = '[/' + code + ']', cpos = str.indexOf(ctag, pos + len);
		if (cpos >= 0) return [pos, cpos + ctag.length - pos, true];
		
		return [pos, 1 + code.length, false];
	}

	// given a block that is supposed to represent a shortcode, generate a graphical representation that can be used
	// in its place, and also used to substitute it back later (if possible)
	private embedGraphic(str:string):string
	{
		let html = this.pseudoHTML(str.trim());
		if (!html) return str;

		let dom = document.createElement('snip');
		dom.innerHTML = html;

		let obj = dom.children[0];
		
		let code = obj.tagName.toLowerCase();
		if (this.SHORTCODES.indexOf(code) < 0) return str; // fail

		let options:{[id:string] : any} = {};
		for (let n = 0; n < obj.attributes.length; n++) options[obj.attributes[n].name] = obj.attributes[n].value;

		let content = $(obj).text();

		let id = 'molpress_mcepreview_' + (++this.watermark);
		this.origin[id] = str;

		let render = (count:number) =>
		{
			let para = $('#content_ifr').contents().find('#' + id);
			if (!para.length)
			{
				if (count < 10) setTimeout(() => render(count + 1), count * 20);
				return;
			}

			para.empty();

			if (code == 'molecule') new EmbedMolecule(content, options).render(para);
			else if (code == 'reaction') new EmbedReaction(content, options).render(para);
			else if (code == 'collection') new EmbedCollection(content, options).render(para);
		};

		let placeholder = 'loading';

		if (code == 'collection')
		{
			placeholder = 'collections are shown in preview';
		}
		else if (code == 'reaction' && (options.facet && options.facet != EmbedReactionFacet.SCHEME))
		{
			placeholder = 'reaction details are shown in preview';
		}
		else if (options.source)
		{
	        $.ajax(
			{
				'url': options.source, 
				'type': 'GET',
				'dataType': 'text',
				'success': (datastr:string) =>
				{
					content = datastr;
					setTimeout(() => render(0), 1);
				},
				'error': () => $('#content_ifr').contents().find('#' + id).text('Unable to load source: ' + options.source)
			});
		}
		else setTimeout(() => render(0), 1);

		placeholder = '<font style="border: 1px solid #808080; padding: 0.2em 0.5em 0.2em 0.5em; ">' + placeholder + '</font>';
		return '<p id="' + id + '">' + placeholder + '</p><span name="endchem" style="display: none"></span>';
	}

	// convert a shortcode to HTML-like by turning [] into <>, so it can be parsed with the DOM
	private pseudoHTML(str:string):string
	{
		let lines = str.split(/\r?\n/);
		
		if (lines.length == 1)
		{
			let match = str.match(/^\[(\w+) (.*?)\/ ?]$/);
			if (match && this.SHORTCODES.indexOf(match[1]) >= 0) 
				return '<' + match[1] + ' ' + match[2] + '></' + match[1] + '>';

			match = str.match(/^\[(\w+)( ?.*?)](.*)\[\/(\w+)]$/);
			if (match && this.SHORTCODES.indexOf(match[1]) >= 0 && match[1] == match[4])
			return '<' + match[1] + match[2] + '>' + match[3] + '</' + match[4] + '>';
		}

		let open = lines[0].match(/^\[(\w+)( ?.*?)](.*)/);
		if (!open || this.SHORTCODES.indexOf(open[1]) < 0) return null;

		let close = lines[lines.length - 1].match(/^(.*)\[\/(\w+)]$/);
		if (!close || open[1] != close[2]) return null;

		let html = '<' + open[1] + open[2] + '>' + open[3];
		for (let n = 1; n < lines.length - 1; n++) html += '\n' + lines[n];
		html += '\n' + close[1] + '</' + close[2] + '>';

		return html;
	}
}