# MolPress

WordPress plugin adding chemical structure embedding.

## License

Copyright &copy; 2010-2016 Molecular Materials Informatics, Inc.

[http://molmatinf.com](http://molmatinf.com)

All rights reserved

* **General availability**: The _WebMolKit_ library may be used by anyone under the terms set by the general [Gnu Public License (v3.0)](https://www.gnu.org/licenses/gpl-3.0.en.html). The synopsis of this license is that if you use any part of the source code in your own project, you are contractually bound to make the **entire** project available under a similar license whenever you distribute it, i.e. it's the _viral_ version of the GPL. Not to be confused with the _lesser_ version (LGPL). Also, if you are considering asserting software patents, you'd best read the GPL v3.0 terms very carefully.

* **Owner availability**: The copyright owner, [Molecular Materials Informatics, Inc.](http://molmatinf.com), can and will exercise the liberty of using this toolkit in proprietary and/or open source software.

## Installation

Installation is crude & effective: copy the directory into the WordPress hierarchy under the web server's directory, i.e.

	/path/to/web/wordpress/wp-content/plugins/

Note that this has a dependency on WebMolKit (https://github.com/aclarkxyz/web_molkit); the output file must be copied into the same directory. This can alternatively be done with a link, e.g.

    ln /path/to/WebMolKit/bin/webmolkit-build.js .
