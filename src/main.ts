import * as fs from 'fs';
import { UptimeWindow } from './uptime-window.interface';

const INPUT_PATH = './data/input.txt';
const OUTPUT_PATH = './data/output.txt';
const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'Today', 'Tomorrow'];
const EVENT_METADATA_STRING = 'alert 1 hour alert 30 minutes alert 15 minutes /Big Fish';

function main(): void {
    const input = readInput();
    const fishName = parseFishName(input);
    const windows = parseWindows(input);
    const eventStrings = windows.map(window => createEventString(fishName, window));
    eventStrings.forEach(eventStr => console.log(eventStr));
    writeOutput(eventStrings);
}

/**
 * Read input data from input file on disk. Returns array of trimmed lines.
 * @returns Array of trimmed lines representing input data on disk
 */
function readInput(): string[] {
    const inputBuffer = fs.readFileSync(INPUT_PATH);
    const inputString = inputBuffer.toString('utf-8');
    return inputString.split('\n').map(line => line.trim());
}

/**
 * 
 * Returns Big Fish name from array of input lines
 * 
 * @important First line is removed from input array
 * @param input Array of input lines
 * @returns Parsed Big Fish name
 * @throws Error if fish name is not detected on first line
 */
function parseFishName(input: string[]): string {
    const fishName = input.shift();
    if (!fishName) {
        throw new Error('Empty input');
    }
    if (isTimestamp(fishName)) {
        throw new Error('Error: first line looks like a timestamp. First line should be fish name.');
    }
    return fishName;
}

/**
 * True if given line is a timestamp
 * @param line Line to test against
 * @returns True if given line is a timestamp
 */
function isTimestamp(line: string): boolean {
    return DAYS_OF_WEEK.some(day => line.includes(day)) &&
        line.includes('at') &&
        (line.includes('AM') || line.includes('PM'));
}

/**
 * True if given line is a duration
 * @param line Line to test against
 * @returns True if given line is a duration
 */
function isDuration(line: string): boolean {
    return line.includes('hours') || line.includes('hour') || line.includes('minutes') || line.includes('minute');
}

/**
 * 
 * Returns array of Uptime Windows parsed from array of input lines.
 * 
 * @important Each line describing an Uptime Window is removed from array of input lines
 * @param input Array of input lines
 * @returns Array of parsed Uptime Windows
 * @throws Error if uptime data is malformed
 */
function parseWindows(input: string[]): UptimeWindow[] {
    const windows: UptimeWindow[] = [];
    while (input.length > 0) {
        const windowInfo = input.splice(0, 4);
        const startTime = windowInfo[0];
        if (!isTimestamp(startTime)) {
            throw new Error(`Expected timestamp. Found: '${startTime}'`);
        }
        const duration = windowInfo[2];
        if (!isDuration(duration)) {
            throw new Error(`Expected duration. Found: '${duration}'`);
        }

        windows.push({
            startTime: startTime,
            duration: duration
        })
    }
    return windows;
}

/**
 * Returns Fantastical natural language event string
 * @param fish Name of Big Fish
 * @param uptimeWindow Upcoming uptime windows
 * @returns Fantastical NLP event string
 */
function createEventString(fish: string, uptimeWindow: UptimeWindow): string {
    return `${fish} on ${uptimeWindow.startTime} for ${uptimeWindow.duration} ${EVENT_METADATA_STRING}`;
}

/**
 * Writes lines to output text file
 * @param lines Array of lines to be written
 */
function writeOutput(lines: string[]): void {
    if (fs.existsSync(OUTPUT_PATH)) {
        fs.rmSync(OUTPUT_PATH);
    }
    fs.writeFileSync(OUTPUT_PATH, lines.join('\n'));
}

main();
