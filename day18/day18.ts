import { readInputLines, sumBy } from '../shared/utils';

type Point = [number, number];
type PointS = `${number}_${number}`;
type Dir = 'U' | 'D' | 'R' | 'L';
type Op = {
    dir: Dir,
    count: number,
    color: string
};
type Data = Op[];

const toStr = ([x, y]: Point): PointS => `${x}_${y}`;

const dirs: Record<Dir, Point> = {
    U: [0, -1],
    D: [0, 1],
    R: [1, 0],
    L: [-1, 0],
};

const parse = (lines: string[]): Data => {
    return lines.map(line => {
        const [d, n, c] = line.split(' ');
        return {
            dir: d as Dir,
            count: parseInt(n, 10),
            color: c.slice(1, -1),
        };
    });
};

const shoelace = (verts: Point[]): number => {
    let sum = 0;
    for (let i = 0; i < verts.length; ++i) {
        const [[ax, ay], [bx, by]] = [verts[i], verts[(i + 1) % verts.length]] as [Point, Point];
        sum += (ax * by) - (bx * ay);
    }

    return sum / 2;
};

const translate = ({ color }: Op): Omit<Op, 'color'> => {
    return {
        dir: (['R', 'D', 'L', 'U'] as const)[parseInt(color[color.length - 1], 16)],
        count: parseInt(color.slice(1, -1), 16),
    };
};

const trace = (data: Omit<Op, 'color'>[]): Point[] => {
    let [x, y] = [0, 0];
    const verts: Point[] = [];
    for (const { dir, count } of data) {
        verts.push([x, y]);
        const [dx, dy] = dirs[dir];
        [x, y] = [x + (count * dx), y + (count * dy)];
    }

    return verts;
};

const part1 = (data: Omit<Op, 'color'>[]): number => {
    const boundary = sumBy(data, o => o.count);
    const area = shoelace(trace(data));
    return (boundary / 2) + area + 1;
};

const part2 = (data: Data): number => {
    const ops = data.map(translate);
    return part1(ops);
};

(async () => {
    const input = await readInputLines('day18');
    const data = parse(input);

    console.log(part1(data));
    console.log(part2(data));
})();
