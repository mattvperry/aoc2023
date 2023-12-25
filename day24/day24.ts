import { countBy, readInputLines, zipWith } from '../shared/utils';

type Point = { x: number, y: number, z: number };
type Data = [Point, Point][];

const parse = (lines: string[]): Data => {
    return lines.map(l => l.split(' @ ').map(x => {
        const [a, b, c] = x.split(', ').map(y => parseInt(y, 10));
        return { x: a, y: b, z: c };
    }) as [Point, Point]);
};

const intersect2D = ([a, b]: [Point, Point], [c, d]: [Point, Point]): Point | null => {
    const bax = b.x - a.x;
    const bay = b.y - a.y;
    const dcx = d.x - c.x;
    const dcy = d.y - c.y;

    const denom = bax * dcy - dcx * bay;
    if (denom === 0) {
        return null; // colinear
    }

    const acx = a.x - c.x;
    const acy = a.y - c.y;
    const sNum = bax * acy - bay * acx;
    const tNum = dcx * acy - dcy * acx;

    const isPos = denom > 0;
    if ((sNum < 0) === isPos
        || (tNum < 0) === isPos
        || (sNum > denom) === isPos 
        || (tNum > denom) === isPos) {
        return null;
    }

    const t = tNum / denom;
    return { x: a.x + (t * bax) , y: a.y + (t * bay), z: -Infinity };
};

const combos = (data: Data): [[Point, Point], [Point, Point]][] => {
    const cs: [[Point, Point], [Point, Point]][] = [];
    for (var i = 0; i < data.length - 1; i++) {
        for (var j = i; j < data.length - 1; j++) {
            cs.push([data[i], data[j+1]]);
        }
    }

    return cs;
};

const convert = ([p, v]: [Point, Point], dist: number): [Point, Point] => {
    return [
        { x: p.x + (dist * v.x), y: p.y + (dist * v.y), z: p.z + (dist * v.z) },
        p
    ];
};

const solve = (
    as: [number, number, number, number][],
    bs: number[]
): number[] => {
    let m = zipWith(as, bs, (a, b) => [...a, b]);
    m = m.slice(0, 4).map(x => zipWith(x, m[4], (a, b) => a - b));

    for (let i = 0; i < m.length; ++i) {
        m[i] = m[i].map(x => x / m[i][i]);
        for (let j = i + 1; j < m.length; ++j) {
            m[j] = m[i].map((x, k) => m[j][k] - x * m[j][i]);
        }
    }

    for (let i = m.length - 1; i >= 0; --i) {
        for (let j = 0; j < i; ++j) {
            m[j] = m[i].map((x, k) => m[j][k] - x * m[j][i]);
        }
    }

    return m.map(r => r[r.length - 1]);
};

const part1 = (data: Data): number => {
    const [rs, re] = [200000000000000, 400000000000000];
    const is = combos(data).map(([a, b]) => intersect2D(convert(a, re - rs), convert(b, re - rs)));
    return countBy(is, i => i !== null && i.x >= rs && i.x <= re && i.y >= rs && i.y <= re);
};

const part2 = (data: Data): number => {
    const a1 = data.map(([p, v]) => [v.x, -1 * v.y, p.x, p.y] as [number, number, number, number]);
    const b1 = data.map(([p, v]) => p.y * v.x - p.x * v.y);
    const a2 = data.map(([p, v]) => [v.y, -1 * v.z, p.y, p.z] as [number, number, number, number]);
    const b2 = data.map(([p, v]) => p.z * v.y - p.y * v.z);

    const [x, y] = solve(a1, b1);
    const [z] = solve(a2, b2);

    return Math.round(x + y + z);
};

(async () => {
    const input = await readInputLines('day24');
    const data = parse(input);

    console.log(part1(data));
    console.log(part2(data));
})();
