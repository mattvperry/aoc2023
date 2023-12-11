import { readInputLines, sumBy } from '../shared/utils';

type Point = [number, number];
type Data = Point[];

const parse = (lines: string[], extra: number): Data => {
    let [dx, dy] = [0, 0];
    const points = [];
    for (let y = 0; y < lines.length; ++y) {
        dx = 0;
        if (lines[y].split('').every(s => s === '.')) {
            dy += extra;
        }

        for (let x = 0; x < lines[0].length; ++x) {
            if (lines.map(row => row[x]).every(s => s === '.')) {
                dx += extra;
            }

            if (lines[y][x] === '#') {
                points.push([x + dx, y + dy] as Point);
            }
        }
    }

    return points;
};

const dist = ([ax, ay]: Point, [bx, by]: Point): number => {
    return Math.abs(ax - bx) + Math.abs(ay - by);
};

const day11 = (data: Data): number => {
    return sumBy(
        data.flatMap((a, i) => data.slice(i + 1).map(b => [a, b] as [Point, Point])),
        ([a, b]) => dist(a, b)
    );
};

(async () => {
    const input = await readInputLines('day11');

    console.log(day11(parse(input, 1)));
    console.log(day11(parse(input, 999999)));
})();
