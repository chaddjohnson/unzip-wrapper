unzip-wrapper
=============
This package wraps the native 'unzip' UNIX binary on *NIX machines.

### Usage:

```
unzip(archivePath, [options]);
```

### Example:

```
var unzip = require('unzip-wrapper');
unzip('/path/to/file.zip');
```

You can also pass options:

```
var options = {
    fix: true,
    target: '/path/to/target/dir'
};
unzip('/path/to/file.zip');
```

The following options are available:

* `fix` -- Whether to check for and attempt to fix any errors with the archive. Defaults to false.
* `target` -- The target directory. Defaults to the archive's directory.

Any errors encountered will be thrown.