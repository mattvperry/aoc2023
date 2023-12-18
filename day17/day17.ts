import { readInputLines } from '../shared/utils';
import { Point, PointS, Grid, toStr, Node, shortestPath } from '../shared/pathfinding';

type Dir = 'N' | 'S' | 'E' | 'W';
type Data = [Grid, number];

type LavaNode = Node & {
    dir: Dir,
    steps: number,
};

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

const getKey = ({ pos, dir, steps }: LavaNode): string => {
    return `${toStr(pos)}|${dir}|${steps}`;
};

const move = (node: LavaNode, dir: Dir): LavaNode => {
    const [x, y] = node.pos;
    const [dx, dy] = dirs[dir];
    return {
        pos: [x + dx, y + dy],
        dir,
        steps: node.dir === dir ? node.steps + 1 : 1,
    };
};

const getCost = ([grid, size]: Data, move: (node: LavaNode) => IterableIterator<LavaNode>, finish?: (node: LavaNode) => boolean): number => {
    return shortestPath(
        grid,
        [
            { pos: [0, 1], dir: 'S', steps: 1 },
            { pos: [1, 0], dir: 'E', steps: 1 },
        ],
        [size - 1, size - 1],
        getKey,
        move,
        finish,
    )?.cost ?? -1;
};

const part1 = (data: Data): number => {
    return getCost(
        data,
        function* (node) {
            if (node.steps < 3) {
                yield move(node, node.dir);
            }

            yield move(node, left[node.dir]);
            yield move(node, right[node.dir]);
        }
    );
};

const part2 = (data: Data): number => {
    return getCost(
        data,
        function* (node) {
            if (node.steps < 10) {
                yield move(node, node.dir);
            }

            if (node.steps > 3) {
                yield move(node, left[node.dir]);
                yield move(node, right[node.dir]);
            }
        },
        node => node.steps > 3,
    );
};

(async () => {
    const input = await readInputLines('day17');
    const data = parse(input);

    console.log(part1(data));
    console.log(part2(data));
})();
