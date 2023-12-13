import { memoize, readInputLines, sum } from '../shared/utils';

type Data = [string, number[]][];

const parse = (lines: string[]): Data => {
    return lines.map(l => {
        const [pattern, nums] = l.split(' ');
        return [pattern, nums.split(',').map(n => parseInt(n, 10))]
    });
};

const isValid = (pattern: string[], valid: number[]): boolean => {
    const groups = pattern
        .join('')
        .split('.')
        .map(g => g.length)
        .filter(s => s !== 0);
    return groups.join(',') === valid.join(',');
};

const validArrangements = (pattern: string[], groups: number[]): number => {
    const idx = pattern.indexOf('?');
    if (idx === -1) {
        return isValid(pattern, groups) ? 1 : 0;
    }

    const damaged = pattern.map((x, i) => idx === i ? '#' : x);
    const normal = pattern.map((x, i) => idx === i ? '.' : x);
    return validArrangements2(damaged.slice(idx), groups) + validArrangements2(normal, groups);
};

const validArrangements2 = memoize((pattern: string[], groups: number[]): number => {
    const idx = pattern.indexOf('?');
    if (idx === -1) {
        return isValid(pattern, groups) ? 1 : 0;
    }

    const damaged = pattern.map((x, i) => idx === i ? '#' : x);
    const normal = pattern.map((x, i) => idx === i ? '.' : x);
    return validArrangements2(damaged.slice(idx), groups) + validArrangements2(normal, groups);
}, (p, g) => `${p.join('')} ${g.join(',')}`);

const day12 = (data: Data): [number, number] => {
    const p1 = data.map(([p, g]) => validArrangements2(Array.from(p), g));

    return [
        sum(p1),
        0,
    ];
};

(async () => {
    const input = await readInputLines('day12');
    const [part1, part2] = day12(parse(input));

    console.log(part1);
    console.log(part2);
})();
