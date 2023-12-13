import { memoize, readInputLines, sum } from '../shared/utils';

type Data = [string, number[]][];

const parse = (lines: string[]): Data => {
    return lines.map(l => {
        const [pattern, nums] = l.split(' ');
        return [pattern, nums.split(',').map(n => parseInt(n, 10))]
    });
};

const validArrangements = memoize((pattern: string, groups: number[]): number => {
    if (pattern.length === 0) {
        return groups.length ? 0 : 1;
    }

    if (groups.length === 0) {
        return pattern.includes('#') ? 0 : 1;
    }

    let arrangements = 0;
    if (pattern[0] === '.' || pattern[0] === '?') {
        arrangements += validArrangements(pattern.slice(1), groups);
    }

    const [g, ...gs] = groups;
    if (pattern.slice(0, g + 1).match(`^[?#]{${g}}($|[?.])`) !== null) {
        arrangements += validArrangements(pattern.slice(g + 1), gs);
    }

    return arrangements;
}, (p, g) => `${p} ${g.join(',')}`);

const expand = ([p, g]: Data[number]): Data[number] => [
    Array(5).fill(p).join('?'),
    Array(5).fill(g).flatMap(x => x),
];

const day12 = (data: Data): [number, number] => {
    const p1 = data.map(([p, g]) => validArrangements(p, g));
    const p2 = data.map(expand).map(([p, g]) => validArrangements(p, g))

    return [sum(p1), sum(p2)];
};

(async () => {
    const input = await readInputLines('day12');
    const [part1, part2] = day12(parse(input));

    console.log(part1);
    console.log(part2);
})();
