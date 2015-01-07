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
            callback(error);
            return;
        }

        // Remove the original archive file.
        fs.unlinkSync(archivePath);

        // Move the fixed archive file in place of the original.
        fs.rename(fixedArchivePath, archivePath);

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
    var archiveFileStats = fs.statSync(archivePath);

    // Ensure the file exists and is not zero bytes.
    if (!fs.existsSync(archivePath)) {
        unzipCallback('File does not exist');
        return;
    }
    if (archiveFileStats.size == 0) {
        unzipCallback('File is zero bytes');
        return;
    }

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
        },
        function(callback) {
            if (typeof unzipCallback == 'function') {
                unzipCallback();
            }
            callback();
        }
    ], function(error) {
        unzipCallback(error);
    });
};