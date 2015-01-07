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

module.exports = function(archivePath, targetDirectory) {
    var archiveFileStats = fs.statSync(archivePath);

    // Ensure the file exists and is not zero bytes.
    if (!fs.existsSync(archivePath)) {
        throw 'File does not exist';
    }
    if (archiveFileStats.size == 0) {
        throw 'File is zero bytes';
    }

    // Default target directory to the same directory the archive is in.
    targetDirectory = targetDirectory || path.dirname(archivePath);

    async.waterfall([
        function(callback) {
            checkForErrors(archivePath, callback);
        },
        function(errorFound, callback) {
            if (errorFound) {
                fixErrors(archivePath, callback);
            }
            else {
                callback();
            }
        },
        function(callback) {
            unzipArchive(archivePath, targetDirectory, callback);
        }
    ], function(error) {
        if (error) {
            throw error;
        }
    });
};