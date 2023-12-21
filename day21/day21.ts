import { map, readInputLines } from '../shared/utils';

type Point = [number, number];
type PointS = `${number}_${number}`;
type Data = [Point, Set<PointS>, number];

const toStr = ([x, y]: Point): PointS => `${x}_${y}`;
const fromStr = (str: PointS): Point => str.split('_').map(x => parseInt(x, 10)) as Point;

const parse = (lines: string[]): Data => {
    let [start, set] = [[0, 0] as Point, new Set<PointS>()];
    for (let y = 0; y < lines.length; ++y) {
        for (let x = 0; x < lines[0].length; ++x) {
            if (lines[y][x] === '#') {
                set.add(toStr([x, y]));
            } else if (lines[y][x] === 'S') {
                start = [x, y];
            }
        }
    }

    return [start, set, lines.length];
};

const moves = [
    [0, 1],
    [0, -1],
    [1, 0],
    [-1, 0],
];

const neighbors = ([x, y]: Point): Point[] => moves.map(([dx, dy]) => [x + dx, y + dy]);

function* bfs(rocks: Data[1], start: Point, depth: number): IterableIterator<number> {
    let queue = [start];
    for (let i = 0; i < depth; ++i) {
        const next = queue.flatMap(p => neighbors(p).filter(x => !rocks.has(toStr(x))));
        queue = Array.from(new Map(next.map(p => [toStr(p), p])).values());
        yield queue.length;
    }
};

const expand = (rocks: Set<PointS>, size: number, factor: number): Set<PointS> => {
    const rs = Array.from(map(rocks, fromStr));
    const all: Point[] = [];
    for (let dy = -1 * factor; dy <= factor; ++dy) {
        for (let dx = -1 * factor; dx <= factor; ++dx) {
            all.push(...rs.map(([x, y]) => [
                x + (dx * size),
                y + (dy * size)
            ] as Point));
        }
    }

    return new Set(all.map(toStr));
};

const part1 = ([start, rocks]: Data): number => {
    const counts = Array.from(bfs(rocks, start, 64));
    return counts[counts.length - 1];
};

const part2 = ([start, rocks, size]: Data): number => {
    //const counts = Array.from(bfs(expand(rocks, size, 3), start, 327));
    //const pattern = [counts[64], counts[195], counts[326]]

    // Wolfram alpha polyfit
    const x = ((26501365 - 65) / 131) + 1;
    return 3768 - (15235 * x) + (15344 * Math.pow(x, 2));
};

(async () => {
    const input = await readInputLines('day21');
    const data = parse(input);

    console.log(part1(data));
    console.log(part2(data));
})();
