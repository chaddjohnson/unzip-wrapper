unzip-wrapper
=============
This package wraps the native 'unzip' UNIX binary on *NIX machines.

### Usage:

```
unzip(archivePath, [options], [callback]);
```

### Example:

```
var unzip = require('unzip-wrapper');
unzip('/path/to/file.zip', {fix: true}, function(err) {
    if (error) {
        console.log(error.message);
        return;
    }

    console.log('Unzipping done!');
});
```

You can also pass options:

```
var options = {
    fix: true,
    target: '/path/to/target/dir'
};
unzip('/path/to/file.zip', options);
```

The following options are available:

* `fix` -- Whether to check for and attempt to fix any errors with the archive. Defaults to false.
* `target` -- The target directory. Defaults to the archive's directory.