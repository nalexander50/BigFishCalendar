"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var INPUT_PATH = './data/input.txt';
var OUTPUT_PATH = './data/output.txt';
var DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'Today', 'Tomorrow'];
var EVENT_METADATA_STRING = 'alert 1 hour alert 30 minutes alert 15 minutes /Big Fish';
function main() {
    var input = readInput();
    var fishName = parseFishName(input);
    var windows = parseWindows(input);
    var eventStrings = windows.map(function (window) { return createEventString(fishName, window); });
    eventStrings.forEach(function (eventStr) { return console.log(eventStr); });
    writeOutput(eventStrings);
}
function readInput() {
    var inputBuffer = fs.readFileSync(INPUT_PATH);
    var inputString = inputBuffer.toString('utf-8');
    return inputString.split('\n').map(function (line) { return line.trim(); });
}
function parseFishName(input) {
    var fishName = input.shift();
    if (!fishName) {
        throw new Error('Empty input');
    }
    if (isTimestamp(fishName)) {
        throw new Error('Error: first line looks like a timestamp. First line should be fish name.');
    }
    return fishName;
}
function isTimestamp(line) {
    return DAYS_OF_WEEK.some(function (day) { return line.includes(day); }) &&
        line.includes('at') &&
        (line.includes('AM') || line.includes('PM'));
}
function isDuration(line) {
    return line.includes('hours') || line.includes('hour') || line.includes('minutes') || line.includes('minute');
}
function parseWindows(input) {
    var windows = [];
    while (input.length > 0) {
        var windowInfo = input.splice(0, 4);
        var startTime = windowInfo[0];
        if (!isTimestamp(startTime)) {
            throw new Error("Expected timestamp. Found: '".concat(startTime, "'"));
        }
        var duration = windowInfo[2];
        if (!isDuration(duration)) {
            throw new Error("Expected duration. Found: '".concat(duration, "'"));
        }
        windows.push({
            startTime: startTime,
            duration: duration
        });
    }
    return windows;
}
function createEventString(fish, uptimeWindow) {
    return "".concat(fish, " on ").concat(uptimeWindow.startTime, " for ").concat(uptimeWindow.duration, " ").concat(EVENT_METADATA_STRING);
}
function writeOutput(lines) {
    if (fs.existsSync(OUTPUT_PATH)) {
        fs.rmSync(OUTPUT_PATH);
    }
    fs.writeFileSync(OUTPUT_PATH, lines.join('\n'));
}
main();
