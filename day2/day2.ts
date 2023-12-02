import { readInputLines, sumBy } from '../shared/utils';

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

const possible = ({ min }: Game): boolean => {
    return cubes.every(c => min[c] <= constraint[c]);
};

const power = ({ min }: Game): number => {
    return Object.values(min).reduce((acc, curr) => acc * curr);
};

const day2 = (lines: string[]): number[] => {
    const games = lines.map(parseGame);
    return [
        sumBy(games.filter(possible), g => g.id),
        sumBy(games, power),
    ];
};

(async () => {
    const input = await readInputLines('day2');
    const [part1, part2] = day2(input);

    console.log(part1);
    console.log(part2);
})();
