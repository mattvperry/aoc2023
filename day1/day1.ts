import { sum, readInputLines } from '../shared/utils';

const part1: Record<string, number> = {
    "0": 0,
    "1": 1,
    "2": 2,
    "3": 3,
    "4": 4,
    "5": 5,
    "6": 6,
    "7": 7,
    "8": 8,
    "9": 9,
}

const part2: Record<string, number> = {
    ...part1,
    "one": 1,
    "two": 2,
    "three": 3,
    "four": 4,
    "five": 5,
    "six": 6,
    "seven": 7,
    "eight": 8,
    "nine": 9
}

const digitPattern = (keys: string[]) => new RegExp(`(?=(${keys.join('|')}))`, "g");

const findNum = (line: string, parser: Record<string, number>): number => {
    var pattern = digitPattern(Object.keys(parser));
    const matches = Array.from(line.matchAll(pattern), x => x[1]);
    return parser[matches[0]] * 10 + parser[matches[matches.length - 1]];
};

const day1 = (lines: string[]): number[] => {
    return [
        sum(lines.map(l => findNum(l, part1))),
        sum(lines.map(l => findNum(l, part2)))
    ];
};

(async () => {
    const input = await readInputLines('day1');
    const [part1, part2] = day1(input);

    console.log(part1);
    console.log(part2);
})();
