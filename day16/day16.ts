import { isLiteral, readInputLines } from '../shared/utils';

type Point = [number, number];
type PointS = `${number}_${number}`;
type Dir = 'N' | 'S' | 'E' | 'W';
type Beam = [Dir, Point];
type Wall = typeof walls[number];
type Data = [Map<PointS, Wall>, number];

const toStr = ([x, y]: Point): PointS => `${x}_${y}`;

const walls = ['/', '\\', '|', '-']  as const;

const dirs: Record<Dir, Point> = {
    N: [0, -1],
    S: [0, 1],
    E: [1, 0],
    W: [-1, 0],
};

const parse = (lines: string[]): Data => {
    const grid = new Map<PointS, Wall>();
    for (let y = 0; y < lines.length; ++y) {
        for (let x = 0; x < lines[0].length; ++x) {
            const curr = lines[y][x];
            if (isLiteral(curr, walls)) {
                grid.set(toStr([x, y]), curr);
            }
        }
    }

    return [grid, lines.length];
};

const inBounds = ([x, y]: Point, size: number): boolean => {
    return x >= 0 && y >= 0 && x < size && y < size;
};

const moves: Record<Wall, Record<Dir, Dir[]>> = {
    '-': {
        N: ['E', 'W'],
        S: ['E', 'W'],
        E: ['E'],
        W: ['W'],
    },
    '|': {
        N: ['N'],
        S: ['S'],
        E: ['N', 'S'],
        W: ['N', 'S'],
    },
    '/': {
        N: ['E'],
        S: ['W'],
        E: ['N'],
        W: ['S'],
    },
    '\\': {
        N: ['W'],
        S: ['E'],
        E: ['S'],
        W: ['N'],
    },
};

const energize = (beams: Beam[], [grid, size]: Data): number => {
    const seen = new Map<PointS, Dir[]>();
    while (beams.length > 0) {
        const [dir, [x, y]] = beams.shift()!;
        seen.set(toStr([x, y]), [dir, ...(seen.get(toStr([x, y])) ?? [])]);

        const [dx, dy] = dirs[dir]; 
        const next = [x + dx, y + dy] as Point;
        if (!inBounds(next, size)) {
            continue;
        }
        
        const wall = grid.get(toStr(next));
        if (wall !== undefined) {
            beams = [
                ...moves[wall][dir].map<Beam>(d => [d, next]),
                ...beams
            ];
        } else if (!(seen.get(toStr(next)) ?? []).includes(dir)) {
            beams = [
                [dir, next],
                ...beams
            ];
        }
    }

    return seen.size - 1;
};

const part1 = (data: Data): number => energize([['E', [-1, 0]]], data);

const part2 = ([grid, size]: Data): number => {
    return Array
        .from({ length: size }, (_, i) => i)
        .flatMap<Beam>(i => [
            ['S', [i, -1]],
            ['N', [i, size]],
            ['E', [-1, i]],
            ['W', [size, i]],
        ])
        .map(b => energize([b], [grid, size]))
        .reduce((acc, curr) => Math.max(acc, curr));
};

(async () => {
    const input = await readInputLines('day16');
    const data = parse(input);

    console.log(part1(data));
    console.log(part2(data));
})();
