import { difference, isSubset, partition, readInputLines, sumBy } from '../shared/utils';

type Point = { x: number, y: number, z: number };
type Brick = { id: number, start: Point, end: Point, settled: boolean, supports: Set<number> };
type Data = Brick[];

const parse = (lines: string[]): Data => {
    return lines.map((l, i) => {
        const [[sx, sy, sz], [ex, ey, ez]] = l.split('~').map(x => x.split(',').map(y => parseInt(y, 10)));
        return {
            id: i,
            start: { x: sx, y: sy, z: sz },
            end: { x: ex, y: ey, z: ez },
            settled: sz === 1 || ez === 1,
            supports: new Set([]),
        };
    });
};

const touching = ({ start: as, end: ae }: Brick, { start: bs, end: be }: Brick): boolean => {
    if (as.z !== be.z + 1) {
        return false;
    }

    const axis = (['x', 'y', 'z'] as const).find(a => bs[a] !== be[a]) ?? 'x';
    const length = be[axis] - bs[axis] + 1;
    const points = Array
        .from({ length }, (_, i) => ({ ...bs, [axis]: i + bs[axis] }))
        .filter(({ z }) => z === be.z);

    return points.some(({ x, y }) => as.x <= x && x <= ae.x && as.y <= y && y <= ae.y);
};

const fall = (b: Brick, settled: Brick[]): Brick => {
    while (b.start.z !== 1 && b.end.z !== 1 && settled.every(s => !touching(b, s))) {
        b.start.z--;
        b.end.z--;
    }

    return { ...b, settled: true, supports: new Set(settled.filter(s => touching(b, s)).map(s => s.id)) };
};

const settle = (bricks: Brick[]): Brick[] => {
    const sorted = bricks.toSorted((a, b) => a.start.z - b.start.z);
    const [settled, falling] = partition(sorted, b => b.settled);
    while (falling.length !== 0) {
        settled.push(fall(falling.shift()!, settled));
    }

    return settled;
};

const chain = (id: number, settled: Brick[]) => {
    const dead = new Set([id]);
    for (const b of settled) {
        if (b.supports.size > 0 && isSubset(b.supports, dead)) {
            dead.add(b.id);
        }
    }

    return dead.size - 1;
};

const part1 = (settled: Data): number => {
    return difference(
        new Set(settled.map(s => s.id)),
        new Set(settled.filter(s => s.supports.size === 1).map(({ supports: [x] }) => x))).size;
};

const part2 = (settled: Data): number => {
    return sumBy(settled, s => chain(s.id, settled));
};

(async () => {
    const input = await readInputLines('day22');
    const data = parse(input);
    const settled = settle(data);

    console.log(part1(settled));
    console.log(part2(settled));
})();
