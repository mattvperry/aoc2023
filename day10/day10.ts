import { readInputLines } from '../shared/utils';

type Dir = 'N' | 'S' | 'E' | 'W';
type Point = [number, number];
type PointS = `${number}_${number}`;
type Data = [Point, Map<PointS, string>];

const toStr = ([x, y]: Point): PointS => `${x}_${y}`;

const parse = (lines: string[]): Data => {
    let start: Point = [-1, -1];
    const map = new Map<PointS, string>();
    for (let y = 0; y < lines.length; ++y) {
        for (let x = 0; x < lines[0].length; ++x) {
            const curr = lines[y][x];
            if (curr === 'S') {
                start = [x, y];
            } else if (curr === '.') {
                continue;
            } else {
                map.set(toStr([x, y]), lines[y][x]);
            }
        }
    }

    return [start, map];
};

const move = ([x, y]: Point, dir: Dir, map: Data[1]): [Point, Dir] => {
    switch (map.get(toStr([x, y]))) {
        case '|':
            return dir === 'N' ? [[x, y - 1], 'N'] : [[x, y + 1], 'S'];
        case '-':
            return dir === 'E' ? [[x + 1, y], 'E'] : [[x - 1, y], 'W'];
        case 'L':
            return dir === 'S' ? [[x + 1, y], 'E'] : [[x, y - 1], 'N'];
        case 'F':
            return dir === 'N' ? [[x + 1, y], 'E'] : [[x, y + 1], 'S'];
        case 'J':
            return dir === 'S' ? [[x - 1, y], 'W'] : [[x, y - 1], 'N'];
        case '7':
            return dir === 'E' ? [[x, y + 1], 'S'] : [[x - 1, y], 'W'];
        default:
            throw Error("Invalid point");
    }
};

function* walk([[sx, sy], map]: Data): IterableIterator<Point> {
    yield [sx, sy];

    let [[cx, cy], dir] = [[sx + 1, sy], 'E' as Dir];
    do {
        yield [cx, cy];
        [[cx, cy], dir] = move([cx, cy], dir, map);
    } while (sx !== cx || sy !== cy);
}

const isWest = ([[ax, ay], [bx, by]]: [Point, Point], [x, y]: Point): boolean => {
    if (ay > by) {
        return isWest([[bx, by], [ax, ay]], [x, y]);
    }

    if (y <= ay || y > by || x >= ax && x >= bx) {
        return false;
    }

    if (x < ax && x < bx) {
        return true;
    }

    return ((y - ay) / (x - ax)) > ((by - ay) / (bx - ax));
};

const pointInPoly = (point: Point, verts: Point[]): boolean => {
    let count = 0;
    for (let i = 0; i < verts.length; ++i) {
        const edge = [verts[i], verts[(i + 1) % verts.length]] as [Point, Point];
        if (isWest(edge, point)) {
            count++;
        }
    }

    return count % 2 === 1;
};

const part1 = (path: Point[]): number => {
    return path.length / 2;
};

const part2 = (path: Point[], map: Data[1]): number => {
    const left = Math.min(...path.map(([x]) => x));
    const right = Math.max(...path.map(([x]) => x));
    const top = Math.min(...path.map(([, y]) => y));
    const bottom = Math.max(...path.map(([, y]) => y));
    const verts = path.filter(p => ['L', 'J', '7', 'F'].includes(map.get(toStr(p))!));
    const edges = new Set<PointS>(path.map(toStr));

    let count = 0;
    for (let y = top; y <= bottom; ++y) {
        for (let x = left; x <= right; ++x) {
            if (!edges.has(toStr([x, y])) && pointInPoly([x, y], verts)) {
                count++;
            }
        }
    }

    return count;
};

(async () => {
    const input = await readInputLines('day10');
    const [start, map] = parse(input);
    const path = Array.from(walk([start, map]));

    console.log(part1(path));
    console.log(part2(path, map));
})();
