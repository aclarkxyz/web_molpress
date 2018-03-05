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

$ = jQuery;

// add a button to the editor for inserting a molecule
jQuery(document).ready(() =>
{
	let plug = new MolPress.ShortcodeIntegration();
    tinymce.create('tinymce.plugins.molpress_plugin', 
    {
        'init' : (ed, url) =>
        {
            WebMolKit.initWebMolKit(url + '/res');
            ed.addButton('molpress_molecule_button', 
            {
                'title' : 'Molecule',
                'image' : url + '/img/molecule.svg',
                'onclick' : () =>
                {
                    // (try to fetch selected molecule, if any)
                    let dlg = new WebMolKit.EditCompound(new Molecule());
                    dlg.onSave(() =>
                    {
                        let molstr = dlg.getMolecule().toString();
						let prehtml = molstr.trim().split('\n').join('<br>\n');
						let content = '<br>[molecule]' + prehtml + '[/molecule]<br>';
                        ed.execCommand('mceInsertContent', false, plug.preprocess(content));
                        dlg.close();
                    });
                    dlg.open();
                }
            });
            ed.addButton('molpress_reaction_button', 
            {
                'title' : 'Reaction',
                'image' : url + '/img/reaction.svg',
                'onclick' : () =>
                {
                    let dlg = new MolPress.ImportReaction();
                    dlg.onImport = (content) => ed.execCommand('mceInsertContent', false, plug.preprocess(content));
                    dlg.open();
                }
			});

			ed.on('BeforeSetContent', (o) => o.content = plug.preprocess(o.content));
			//ed.on('Change', (o) => /*o.content = plug.preprocess(o.content)*/ {console.log('CHANGE'); for (let k in o) console.log('['+k+'] [' + o[k] + ']');});
			ed.on('PostProcess', (o) => o.content = plug.postprocess(o.content));
        }
    });

    tinymce.PluginManager.add('molpress_plugin', tinymce.plugins.molpress_plugin);
});
