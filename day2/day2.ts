import { readInputLines, sum } from '../shared/utils';

const cubes = ['blue', 'red', 'green'] as const;

type Cube = typeof cubes[number];

type Set = Record<Cube, number>;

type Game = {
    id: number,
    min: Set,
};

const constraint: Set = {
    red: 12,
    green: 13,
    blue: 14,
};

const parseGame = (line: string): Game => {
    const [a, b] = line.split(':');
    const id = parseInt(a.split(' ')[1], 10);
    const min = b
        .split(';')
        .flatMap(r => r.split(','))
        .reduce((acc, curr) => {
            const [count, cube] = curr.trim().split(' ') as [string, Cube];
            acc[cube] = Math.max(parseInt(count, 10), acc[cube] ?? 0);
            return acc;
        },
        {} as Set);

    return {
        id,
        min,
    };
};

const possible = (set: Set): boolean => {
    return cubes.every(c => set[c] <= constraint[c]);
};

const power = ({ min }: Game): number => {
    return Object.values(min).reduce((acc, curr) => acc * curr);
};

const day2 = (lines: string[]): number[] => {
    const games = lines.map(parseGame);
    return [
        sum(games.filter(g => possible(g.min)).map(g => g.id)),
        sum(games.map(power)),
    ];
};

(async () => {
    const input = await readInputLines('day2');
    const [part1, part2] = day2(input);

    console.log(part1);
    console.log(part2);
})();
