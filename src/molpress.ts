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
///<reference path='../../WebMolKit/src/ui/EmbedMolecule.ts'/>
///<reference path='../../WebMolKit/src/ui/EmbedReaction.ts'/>
///<reference path='../../WebMolKit/src/ui/EmbedCollection.ts'/>
///<reference path='../../WebMolKit/src/dialog/EditCompound.ts'/>
///<reference path='ImportReaction.ts'/>

import wmk = WebMolKit;

namespace MolPress /* BOF */ {

// render a molecular structure, using the given parameters: see the EmbedMolecule class for details
export function RenderMolecule(id:string, options:any)
{
    if (!options) options = {};
	let span = $('#' + id);
    
    // if a source is provided, fetch that and plug it in
    if (options.source)
    {
        span.empty();
        $.ajax(
        {
            'url': options.source, 
            'type': 'GET',
            'dataType': 'text',
            'success': (molstr:string) =>
            {
                new wmk.EmbedMolecule(molstr, options).render(span);
                span.css('display', 'block');
            },
            'error': () => {console.log('Unable to load source: ' + options.source);}
        });
        return;
    }

    let molstr = span.text();
    span.empty();
    new wmk.EmbedMolecule(molstr, options).render(span);
	span.css('display', 'block');
}

// render a single reaction experiment, using the given parameters: see the EmbedReaction class for details
export function RenderReaction(id:string, options:any)
{
    if (!options) options = {};
	let span = $('#' + id);

    // if a source is provided, fetch that and plug it in
    if (options.source)
    {
        span.empty();
        $.ajax(null,
        {
            'url': options.source, 
            'type': 'GET',
            'dataType': 'text',
            'success': (datastr:string) =>
            {
                new wmk.EmbedReaction(datastr, options).render(span);
                span.css('display', 'block');
            },
            'error': () => {console.log('Unable to load source: ' + options.source);}
        });
        return;
    }

    let datastr = span.text();
    span.empty();
    new wmk.EmbedReaction(datastr, options).render(span);
	span.css('display', 'block');
}

// render a collection of molecular objects and miscellany, using the given parameters: see the EmbedCollection class for details
export function RenderCollection(id:string, options:any)
{
    if (!options) options = {};
	let span = $('#' + id);

    // if a source is provided, fetch that and plug it in
    if (options.source)
    {
        span.empty();
        $.ajax(null,
        {
            'url': options.source, 
            'type': 'GET',
            'dataType': 'text',
            'success': (datastr:string) =>
            {
                new wmk.EmbedCollection(datastr, options).render(span);
                span.css('display', 'block');
            },
            'error': () => {console.log('Unable to load source: ' + options.source);}
        });
        return;
    }

    let datastr = span.text();
    span.empty();
    new wmk.EmbedCollection(datastr, options).render(span);
	span.css('display', 'block');
}

/* EOF */ }