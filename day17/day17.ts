import { readInputLines } from '../shared/utils';

type Point = [number, number];
type PointS = `${number}_${number}`;
type Dir = 'N' | 'S' | 'E' | 'W';
type Data = [Map<PointS, number>, number];

type Node = {
    pos: Point,
    dir: Dir,
    steps: number,
};

type State = {
    key: string,
    node: Node,
    cost: number,
    prev: State | null,
};

const toStr = ([x, y]: Point): PointS => `${x}_${y}`;

const parse = (lines: string[]): Data => {
    const grid = new Map<PointS, number>();
    for (let y = 0; y < lines.length; ++y) {
        for (let x = 0; x < lines[0].length; ++x) {
            const curr = lines[y][x];
            grid.set(toStr([x, y]), parseInt(curr, 10));
        }
    }

    return [grid, lines.length];
};

const dirs: Record<Dir, Point> = {
    N: [0, -1],
    S: [0, 1],
    E: [1, 0],
    W: [-1, 0],
};

const left: Record<Dir, Dir> = {
    N: 'W',
    S: 'E',
    E: 'N',
    W: 'S',
};

const right: Record<Dir, Dir> = {
    N: 'E',
    S: 'W',
    E: 'S',
    W: 'N',
};

const getKey = ({ pos, dir, steps }: Node): string => {
    return `${toStr(pos)}|${dir}|${steps}`;
};

const sortedIdx = <T>(xs: T[], val: number, pluck: (x: T) => number): number => {
    let [low, high] = [0, xs.length];

    while (low < high) {
        const mid = (low + high) >>> 1;
        [low, high] = pluck(xs[mid]) < val 
            ? [mid + 1, high]
            : [low, mid];
    }

    return low;
};

const pf = (
    grid: Data[0],
    end: Point,
    moves: (curr: Node) => IterableIterator<Dir>,
    finish?: (node: Node) => boolean,
): State | undefined => {
    const visited = new Set<string>();
    const initial: Node[] = [
        { pos: [1, 0], dir: 'E', steps: 1 },
        { pos: [0, 1], dir: 'S', steps: 1 },
    ];
    const queue: State[] = initial.map(node => ({
        key: getKey(node),
        node,
        cost: grid.get(toStr(node.pos))!,
        prev: null,
    }));

    while (queue.length > 0) {
        const curr = queue.shift()!;
        if (visited.has(curr.key)) {
            continue;
        }

        visited.add(curr.key);
        if (curr.key.startsWith(toStr(end)) && (finish?.(curr.node) ?? true)) {
            return curr;
        }

        const [ux, uy] = curr.node.pos;
        for (const dir of moves(curr.node)) {
            const [dx, dy] = dirs[dir];
            const pos: Point = [ux + dx, uy + dy];
            const cost = grid.get(toStr(pos));
            if (cost === undefined) {
                continue;
            }

            const node = {
                pos,
                dir,
                steps: dir === curr.node.dir ? curr.node.steps + 1 : 1,
            };

            const idx = sortedIdx(queue, curr.cost + cost, x => x.cost);
            queue.splice(idx, 0, {
                key: getKey(node),
                node,
                cost: curr.cost + cost,
                prev: curr,
            });
        }
    }
};

const part1 = ([grid, size]: Data): number => {
    return pf(
        grid,
        [size - 1, size - 1],
        function* (node) {
            if (node.steps < 3) {
                yield node.dir;
            }

            yield left[node.dir];
            yield right[node.dir];
        }
    )?.cost ?? -1;
};

const part2 = ([grid, size]: Data): number => {
    return pf(
        grid,
        [size - 1, size - 1],
        function* (node) {
            if (node.steps < 10) {
                yield node.dir;
            }

            if (node.steps > 3) {
                yield left[node.dir];
                yield right[node.dir];
            }
        },
        node => node.steps > 3,
    )?.cost ?? -1;
};

(async () => {
    const input = await readInputLines('day17');
    const data = parse(input);

    console.log(part1(data));
    console.log(part2(data));
})();
