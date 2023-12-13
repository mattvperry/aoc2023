import { countBy, readInputLines, splitOnEvery, sumBy, zip, zipWithV } from '../shared/utils';

type Data = string[][];

const parse = (lines: string[]): Data => {
    return Array.from(splitOnEvery(lines, ''));
};

const transpose = (data: Data[number]): Data[number] => {
    return zipWithV(
        (...cells) => cells.join(''),
        ...data.map(s => Array.from(s)));
};

const offByOne = (as: string, bs: string): boolean => {
    return countBy(zip(Array.from(as), Array.from(bs)), ([a, b]) => a !== b) === 1;
};

function* reflections(pattern: Data[number]): IterableIterator<[number, number]> {
    for (let i = 1; i < pattern.length; ++i) {
        const size = Math.min(i, pattern.length - i);
        const [left, right] = [
            pattern.slice(i - size, i).toReversed().join(''),
            pattern.slice(i, i + size).join(''),
        ];

        if (left === right) {
            yield [0, i];
        } else if (offByOne(left, right)) {
            yield [1, i];
        }
    }
};

const day13 = (data: Data): [number, number] => {
    const rs = data.map(p => ({
        horizontal: new Map<number, number>(reflections(p)), 
        vertical: new Map<number, number>(reflections(transpose(p))),
    }));

    return [
        sumBy(rs, r => (100 * (r.horizontal.get(0) ?? 0)) + (r.vertical.get(0) ?? 0)),
        sumBy(rs, r => (100 * (r.horizontal.get(1) ?? 0)) + (r.vertical.get(1) ?? 0)),
    ];
};

(async () => {
    const input = await readInputLines('day13');
    const [part1, part2] = day13(parse(input));

    console.log(part1);
    console.log(part2);
})();
