import { readInputLines } from '../shared/utils';

type Edge = { from: string, to: string, cap: number };
type Graph = Map<string, Edge[]>;
type Data = Map<string, string[]>;

const parse = (lines: string[]): Data => {
    return new Map(lines.map(l => {
        const [a, b] = l.split(': ');
        return [a, b.split(' ')] as [string, string[]];
    }));
};

const toGraph = (data: Data): Graph => {
    const graph = new Map<string, Edge[]>();
    for (const [k, v] of data.entries()) {
        graph.set(k, [...(graph.get(k) ?? []), ...v.map(n => ({ from: k, to: n, cap: 1 }))]);
        for (const n of v) {
            graph.set(n, [...(graph.get(n) ?? []), { from: n, to: k, cap: 1 }]);
        }
    }

    return graph;
};

const bfs = (graph: Graph, source: string, sink: string): Edge[] | null => {
    const visited = new Set<string>();
    const queue: [string, Edge[]][] = [[source, []]];

    while (queue.length !== 0) {
        const [node, path] = queue.shift()!;
        if (visited.has(node)) {
            continue;
        }

        if (node === sink) {
            return path;
        }

        visited.add(node);
        queue.push(...(graph.get(node)!.filter(e => e.cap > 0).map(e => [e.to, [...path, e]] as [string, Edge[]])));
    }

    return null;
};

const reachable = (graph: Graph, source: string): Set<string> => {
    const seen = new Set<string>();
    const queue = [source];
    while (queue.length !== 0) {
        const curr = queue.shift()!;
        if (seen.has(curr)) {
            continue;
        }

        seen.add(curr);
        queue.push(...(graph.get(curr)!.filter(e => e.cap > 0).map(e => e.to)));
    }

    return seen;
};

const fordful = (data: Data, source: string, sink: string): [Edge[], number] => {
    const rGraph = toGraph(data);
    while (true) {
        const path = bfs(rGraph, source, sink);
        if (path === null) {
            break;
        }

        for (const { from, to } of path) {
            rGraph.set(from, [...rGraph.get(from)!.map(e => e.to !== to ? e : { ...e, cap: e.cap - 1 })]);
            rGraph.set(to, [...rGraph.get(to)!.map(e => e.to !== from ? e : { ...e, cap: e.cap + 1 })]);
        }
    }

    const rs = reachable(rGraph, source);
    return [Array.from(rGraph.values()).flat().filter(e => rs.has(e.from) && !rs.has(e.to)), rs.size];
};

function* combos(data: string[]): IterableIterator<[string, string]> {
    for (var i = 0; i < data.length - 1; i++) {
        for (var j = i; j < data.length - 1; j++) {
            yield [data[i], data[j+1]];
        }
    }
};

const nodes = (data: Data): Set<string> => {
    return new Set([
        ...data.keys(),
        ...Array.from(data.values()).flat(),
    ]);
};

const part1 = (data: Data): number => {
    const ns = nodes(data);
    for (const [s, t] of combos([...ns])) {
        const [es, size] = fordful(data, s, t);
        if (es.length === 3) {
            return size * (ns.size - size);
        }
    }

    return -1;
};

(async () => {
    const input = await readInputLines('day25');
    const data = parse(input);

    console.log(part1(data));
})();
