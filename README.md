unzip-wrapper
=============
This package wraps the native 'unzip' UNIX binary on *NIX machines.

### Example usage:

```
var unzip = require('unzip-wrapper');
unzip('/path/to/file.zip');
```

You can also pass options:

```
unzip('/path/to/file.zip', {fix: true});
```

The following options are available:

* fix (true/false) -- whether to check for and attempt to fix any errors with the archive.
