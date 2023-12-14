import { readInputLines, reduce } from '../shared/utils';

type Point = [number, number];
type PointS = `${number}_${number}`;
type Data = [Point[], Map<PointS, string>, number];

const toStr = ([x, y]: Point): PointS => `${x}_${y}`;
const fromStr = (str: PointS): Point => str.split('_').map(x => parseInt(x, 10)) as Point;

const parse = (lines: string[]): Data => {
    const rocks = [] as Point[];
    const grid = new Map<PointS, string>();

    for (let y = 0; y < lines.length; ++y) {
        for (let x = 0; x < lines.length; ++x) {
            const curr = lines[y][x];
            if (curr === '#') {
                grid.set(toStr([x, y]), curr);
            } else if (curr === 'O') {
                rocks.push([x, y]);
            }
        }
    }

    return [rocks, grid, lines.length];
};

const move = ([x, y]: Point, grid: Data[1], size: number): Point => {
    while (y !== 0) {
        if (grid.get(toStr([x, y - 1])) !== undefined) {
            return [x, y];
        }

        y = y - 1;
    }

    return [x, y];
};

const load = (grid: Data[1], size: number): number => {
    return reduce(grid.entries(), 0, (acc, [p, s]) => {
        if (s === '#') {
            return acc;
        }

        const [, y] = fromStr(p);
        return acc + (size - y);
    });
};

const part1 = ([rocks, grid, size]: Data): number => {
    for (const rock of rocks) {
        const final = move(rock, grid, size);
        grid.set(toStr(final), 'O');
    }

    return load(grid, size);
};

const part2 = (data: Data): number => {
    return 0;
};

(async () => {
    const input = await readInputLines('day14');
    const data = parse(input);

    console.log(part1(data));
    console.log(part2(data));
})();
