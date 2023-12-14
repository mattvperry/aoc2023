import { memoize, readInputLines, reduce } from '../shared/utils';

type Dir = 'N' | 'W' | 'S' | 'E';
type Point = [number, number];
type PointS = `${number}_${number}`;
type Data = [Set<PointS>, Set<PointS>, number];

const toStr = ([x, y]: Point): PointS => `${x}_${y}`;
const fromStr = (str: PointS): Point => str.split('_').map(x => parseInt(x, 10)) as Point;

const parse = (lines: string[]): Data => {
    const rocks = new Set<PointS>();
    const beams = new Set<PointS>();

    for (let y = 0; y < lines.length; ++y) {
        for (let x = 0; x < lines.length; ++x) {
            const curr = lines[y][x];
            if (curr === '#') {
                beams.add(toStr([x, y]));
            } else if (curr === 'O') {
                rocks.add(toStr([x, y]));
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

const move = memoize((rocks: Set<PointS>, beams: Set<PointS>, size: number, dir: Dir): Set<PointS> => {
    const [dx, dy] = dirs[dir];
    const moved = new Set<PointS>();
    for (const rock of rocks) {
        let [x, y] = fromStr(rock);
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

    return moved;
}, (r, _, __, d) => `${Array.from(r).toSorted().join('-')}_${d}`);

const load = (rocks: Set<PointS>, size: number, dir: Dir): number => {
    return reduce(rocks, 0, (acc, curr) => {
        const [x, y] = fromStr(curr);
        switch (dir) {
            case 'N':
                return acc + (size - y);
            case 'W':
                return acc + (size - x);
            case 'S':
                return acc + (y + 1);
            case 'E':
                return acc + (x + 1);
        }
    });
};

const part1 = ([rocks, beams, size]: Data): number => {
    const moved = move(rocks, beams, size, 'N');
    return load(moved, size, 'N');
};

const part2 = ([rocks, beams, size]: Data): number => {
    for (let i = 0; i < 1000000000; ++i) {
        for (const dir of ['N', 'W', 'S', 'E'] as Dir[]) {
            rocks = move(rocks, beams, size, dir);
        }
    }

    return load(rocks, size, 'N');
};

(async () => {
    const input = await readInputLines('day14');
    const data = parse(input);

    console.log(part1(data));
    console.log(part2(data));
})();
