unzip-wrapper
=============
This package wraps the native 'unzip' UNIX binary on *NIX machines.

### Usage:

```
unzip(archivePath, [targetDirectory], [options]);
```

### Example:

```
var unzip = require('unzip-wrapper');
unzip('/path/to/file.zip');
```

By default this will extract files to the same directory as the archive directory. To specify a target directory, add another parameter:

```
unzip('/path/to/file.zip', '/path/to/target/directory');
```

You can also pass options:

```
unzip('/path/to/file.zip', {fix: true});
unzip('/path/to/file.zip', '/path/to/target/directory', {fix: true});
```

The following options are available:

* fix (true/false) -- whether to check for and attempt to fix any errors with the archive.
