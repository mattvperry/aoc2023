import { MinPriorityQueue } from '@datastructures-js/priority-queue';

export type Point = [number, number];
export type PointS = `${number}_${number}`;
export type Grid = Map<PointS, number>;

export type Node = {
    pos: Point,
}

type State<TNode extends Node> = {
    key: string,
    node: TNode,
    cost: number,
    prev: State<TNode> | null,
};

export const toStr = ([x, y]: Point): PointS => `${x}_${y}`;

export const shortestPath = <TNode extends Node>(
    grid: Grid,
    initial: TNode[],
    end: Point,
    getKey: (node: TNode) => string,
    next: (curr: TNode) => IterableIterator<TNode>,
    finish?: (node: TNode) => boolean,
): State<TNode> | undefined => {
    const visited = new Set<string>();
    const queue = MinPriorityQueue.fromArray(initial.map<State<TNode>>(node => ({
        key: getKey(node),
        node,
        cost: grid.get(toStr(node.pos))!,
        prev: null,
    })), s => s.cost);

    while (queue.size() > 0) {
        const curr = queue.dequeue();
        if (visited.has(curr.key)) {
            continue;
        }

        visited.add(curr.key);
        if (toStr(curr.node.pos) === toStr(end) && (finish?.(curr.node) ?? true)) {
            return curr;
        }

        for (const node of next(curr.node)) {
            const cost = grid.get(toStr(node.pos));
            if (cost === undefined) {
                continue;
            }

            queue.enqueue({
                key: getKey(node),
                node,
                cost: curr.cost + cost,
                prev: curr,
            });
        }
    }
};