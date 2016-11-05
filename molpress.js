/*
    MolPress

    (c) 2016 Molecular Materials Informatics, Inc.

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

// render a molecular structure, using the given parameters: see the EmbedMolecule class for details
function molpress_RenderMolecule(id, options)
{
    if (!options) options = {};
	let span = $('#' + id), molstr = span.text();
    span.empty();
    new EmbedMolecule(molstr, options).render(span);
	span.css('display', 'block');
}