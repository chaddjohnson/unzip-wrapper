var exec = require('child_process').exec;
var path = require('path');
var fs = require('fs');
var async = require('async');

function checkForErrors(archivePath, callback) {
    var archiveErrorCheckCommand = '/usr/bin/unzip -tqqq "' + archivePath + '"';
    exec(archiveErrorCheckCommand, function(error, stdout, stderr) {
        // If there is any output, there is an error.
        callback(null, stdout.length > 0);
    });
}

function fixErrors(archivePath, callback) {
    var fixedArchiveFileName = path.basename(archivePath, '.zip');
    var fixedArchivePath = path.join(path.dirname(archivePath), fixedArchiveFileName);
    var fixArchiveCommand = 'echo y | /usr/bin/zip -FF "' + archivePath + '" --out "' + fixedArchivePath + '" >> /dev/null';

    // Try to fix the error.
    exec(fixArchiveCommand, function(error, stdout, stderr) {
        if (error) {
            callback('Unable to fix archive');
            return;
        }

        // Remove the original archive file.
        fs.unlinkSync(archivePath);

        // Move the fixed archive file in place of the original.
        fs.renameSync(fixedArchivePath, archivePath);

        callback();
    });
}

function unzipArchive(archivePath, targetDirectory, callback) {
    // Execute the native unzip binary.
    var unzipCommand = '/usr/bin/unzip -qqq -o "' + archivePath + '" -d "' + targetDirectory + '" >> /dev/null';
    exec(unzipCommand, function(error, stdout, stderr) {
        callback(error);
    });
}

module.exports = function(archivePath, options, unzipCallback) {
    var defaultOptions = {
        target: path.dirname(archivePath),
        fix: false
    };

    if (typeof options == 'function') {
        unzipCallback = options;
    }

    // Add any missing properties from defaultOptions into options.
    options = options || {};
    for (var property in defaultOptions) {
        if (!options.hasOwnProperty(property)) {
            options[property] = defaultOptions[property];
        }
    }

    try {
        var archiveFileStats = fs.statSync(archivePath);

        // Ensure the file is not zero bytes.
        if (archiveFileStats.size == 0) {
            unzipCallback('File is zero bytes');
            return;
        }
    }
    catch (error) {
        // File does not exist.
        unzipCallback(error);
        return;
    }

    async.waterfall([
        function(callback) {
            if (options.fix) {
                checkForErrors(archivePath, callback);
            }
            else {
                callback(null, false);
            }
        },
        function(errorFound, callback) {
            if (options.fix && errorFound) {
                fixErrors(archivePath, callback);
            }
            else {
                callback();
            }
        },
        function(callback) {
            unzipArchive(archivePath, options.target, callback);
        }
    ], function(error) {
        if (typeof unzipCallback == 'function') {
            unzipCallback(error);
        }
    });
};