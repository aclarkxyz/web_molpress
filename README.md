# MolPress

WordPress plugin adding chemical structure embedding.

Installation is crude & effective: copy the directory into the WordPress hierarchy under the web server's directory, i.e.

	/path/to/web/wordpress/wp-content/plugins/

Note that this has a dependency on WebMolKit (https://github.com/aclarkxyz/web_molkit); the output file must be copied into the same directory, which can be done with a link, e.g.

    ln /path/to/WebMolKit/bin/webmolkit-build.js .