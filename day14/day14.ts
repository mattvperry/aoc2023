import { readInputLines } from '../shared/utils';

type Dir = 'N' | 'W' | 'S' | 'E';
type Point = [number, number];
type PointS = `${number}_${number}`;
type Data = [Point[], Set<PointS>, number];

const toStr = ([x, y]: Point): PointS => `${x}_${y}`;
const fromStr = (str: PointS): Point => str.split('_').map(x => parseInt(x, 10)) as Point;

const parse = (lines: string[]): Data => {
    const rocks: Point[] = [];
    const beams = new Set<PointS>();

    for (let y = 0; y < lines.length; ++y) {
        for (let x = 0; x < lines.length; ++x) {
            const curr = lines[y][x];
            if (curr === '#') {
                beams.add(toStr([x, y]));
            } else if (curr === 'O') {
                rocks.push([x, y]);
            }
        }
    }

    return [rocks, beams, lines.length];
};

const dirs: Record<Dir, Point> = {
    N: [0, -1],
    W: [-1, 0],
    S: [0, 1],
    E: [1, 0]
};

const inBounds = ([x, y]: Point, size: number): boolean => {
    return x >= 0 && y >= 0 && x < size && y < size;
};

const move = (rocks: Point[], beams: Set<PointS>, size: number, dir: Dir): Point[] => {
    const [dx, dy] = dirs[dir];
    const moved = new Set<PointS>();
    for (let [x, y] of rocks) {
        while (true) {
            const next: Point = [x + dx, y + dy];
            if (moved.has(toStr(next))
                || beams.has(toStr(next))
                || !inBounds(next, size)) {
                moved.add(toStr([x, y]));
                break;
            } else {
                [x, y] = next;
            }
        }
    }

    return Array.from(moved).map(fromStr);
};

const load = (rocks: Point[], size: number): number => {
    return rocks.reduce((acc, [, y]) => acc + (size - y), 0);
};

const sorters: Record<Dir, (a: Point, b: Point) => number> = {
    N: ([, ay], [, by]) => ay - by,
    W: ([ax], [bx]) => ax - bx,
    S: ([, ay], [, by]) => by - ay,
    E: ([ax], [bx]) => bx - ax,
}

const part1 = ([rocks, beams, size]: Data): number => {
    const moved = move(rocks, beams, size, 'N');
    return load(moved, size);
};

const part2 = ([rocks, beams, size]: Data): number => {
    const prev: string[] = [];

    while (true) {
        for (const dir of ['N', 'W', 'S', 'E'] as Dir[]) {
            const next = move(rocks.toSorted(sorters[dir]), beams, size, dir);
            const key = next.map(toStr).join(',');
            const cycle = prev.indexOf(key)
            if (cycle !== -1) {
                const mod = ((4 * 1000000000) - 1 - cycle) % (prev.length - cycle);
                const end = prev[cycle + mod].split(',').map(p => fromStr(p as PointS));
                return load(end, size);
            }

            prev.push(key);
            rocks = next;
        }
    }
};

(async () => {
    const input = await readInputLines('day14');
    const data = parse(input);

    console.log(part1(data));
    console.log(part2(data));
})();
