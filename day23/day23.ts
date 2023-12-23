import { Point, PointS, toStr } from '../shared/pathfinding';
import { concatMap, frequency, isLiteral, readInputLines } from '../shared/utils';

type Slope = typeof slopes[number];
type Cell = '.' | Slope;
type Edge = { from: Point, to: Point, weight: number };
type Graph = Map<PointS, Edge[]>;
type Data = Map<PointS, Cell>;

const parse = (lines: string[]): Data => {
    const grid = new Map<PointS, Cell>();
    for (let y = 0; y < lines.length; ++y) {
        for (let x = 0; x < lines[0].length; ++x) {
            const curr = lines[y][x];
            if (curr !== '#') {
                grid.set(toStr([x, y]), curr as Cell);
            }
        }
    }

    return grid;
};

const slopes = ['^', 'v', '<', '>'] as const;

const dirs: Record<Slope, Point> = {
    '^': [0, -1],
    'v': [0, 1],
    '<': [-1, 0],
    '>': [1, 0],
};

const opposite: Record<Slope, Slope> = {
    '^': 'v',
    'v': '^',
    '<': '>',
    '>': '<',
};

function* withSlopes(grid: Data, [x, y]: Point): IterableIterator<Point> {
    const val = grid.get(toStr([x, y]))!;
    const isSlope = isLiteral(val, slopes);
    const ds = (isSlope ? [[val, dirs[val]]] : Object.entries(dirs)) as [Slope, Point][];
    for (const [s, [dx, dy]] of ds) {
        const n = [x + dx, y + dy] as Point;
        const v = grid.get(toStr(n));
        if (v === undefined || (isLiteral(v, slopes) && v === opposite[s])) {
            continue
        }

        yield n;
    }
};

function* noSlopes(grid: Data, [x, y]: Point): IterableIterator<Point> {
    for (const [dx, dy] of Object.values(dirs)) {
        const n = [x + dx, y + dy] as Point;
        const v = grid.get(toStr(n));
        if (v === undefined) {
            continue
        }

        yield n;
    }
};

const simplify = (
    grid: Data,
    start: Point,
    end: Point,
    neighbors: (grid: Data, point: Point) => Iterable<Point>
): Graph => {
    const graph = new Map<PointS, Edge[]>();
    const reachable = ([x, y]: Point, steps: number, seen: Set<PointS>): [Point, number][] => {
        const next = Array.from(neighbors(grid, [x, y])).filter(n => !seen.has(toStr(n)));
        if (next.length !== 1) {
            return [[[x, y], steps]];
        }

        return next.flatMap(n => reachable(n, steps + 1, new Set([...seen, toStr([x, y])])));
    };

    const reached = new Set<PointS>();
    const queue = [start];
    while (queue.length !== 0) {
        const [x, y] = queue.shift()!;
        const key = toStr([x, y]);
        if (reached.has(key) || key === toStr(end)) {
            continue;
        }

        reached.add(key);
        const rs = Array.from(concatMap(neighbors(grid, [x, y]), n => reachable(n, 1, new Set([key]))));
        queue.push(...rs.map(([p]) => p));
        graph.set(key, rs.map(([to, weight]) => ({
            from: [x, y],
            to,
            weight
        })));
    }

    return graph.set(toStr(end), []);
};

const topoSort = (graph: Graph, start: Point): Point[] => {
    const ins = frequency(concatMap(graph.values(), es => es.map(e => toStr(e.to))));
    const list: Point[] = [];
    const queue = [start];
    while (queue.length !== 0) {
        const curr = queue.shift()!;
        list.push(curr);
        for (const e of graph.get(toStr(curr))!) {
            const to = toStr(e.to);
            if (ins[to] === undefined || --ins[to] === 0) {
                queue.push(e.to);
            }
        }
    }

    return list;
};

const longestPath = (grid: Data, start: Point, end: Point): number => {
    const dist = new Map<PointS, number>([[toStr(start), 0]]);
    const graph = simplify(grid, start, end, withSlopes);
    for (const u of topoSort(graph, start)) {
        const us = toStr(u);
        for (const e of graph.get(us)!) {
            const vs = toStr(e.to);
            if ((dist.get(vs) ?? -Infinity) < dist.get(us)! + e.weight) {
                dist.set(vs, dist.get(us)! + e.weight);
            }
        }
    }

    return dist.get(toStr(end))!;
};

const longestPath2 = (grid: Data, start: Point, end: Point): number => {
    const goal = toStr(end);
    const graph = simplify(grid, start, end, noSlopes);
    const dfs = ([x, y]: Point, steps: number, seen: Set<PointS>): number => {
        const key = toStr([x, y]);
        if (key === goal) {
            return steps;
        }

        const next = graph.get(key)!
            .filter(e => !seen.has(toStr(e.to)))
            .map(e => dfs(e.to, steps + e.weight, new Set([...seen, key])));
        return Math.max(...next);
    };

    return dfs(start, 0, new Set());
};

const part1 = (data: Data): number => {
    return longestPath(data, [1, 0], [139, 140]);
};

const part2 = (data: Data): number => {
    return longestPath2(data, [1, 0], [139, 140]);
};

(async () => {
    const input = await readInputLines('day23');
    const data = parse(input);

    console.log(part1(data));
    console.log(part2(data));
})();
