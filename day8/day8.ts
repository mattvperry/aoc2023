import { readInputLines, splitOn } from '../shared/utils';

type Dir = 'L' | 'R';
type Node = string;
type Net = Map<Node, [Node, Node]>;
type Data = [Dir[], Net];

const parse = (lines: string[]): Data => {
    const [[dirs], nodes] = splitOn(lines, '');
    return [
        dirs.split('') as Dir[],
        new Map<Node, [Node, Node]>(nodes.map(n => {
            const [from, to] = n.split(' = ');
            return [from, to.replace('(', '').replace(')', '').split(', ') as [Node, Node]];
        })),
    ];
};

const steps = (node: Node, [dirs, net]: Data): number => {
    let i = 0;
    do {
        node = net.get(node)![dirs[i % dirs.length] === 'L' ? 0 : 1];
        ++i;
    }
    while (!node.endsWith('Z'))

    return i;
};

const gcd = (x: number, y: number): number => {
    return y === 0 ? x : gcd(y, x % y);
};

const lcm = (x: number, y: number): number => {
    return (x * y) / gcd(x, y);
};

const part1 = (data: Data): number => steps('AAA', data);

const part2 = ([dirs, net]: Data): number => {
    const nodes = Array.from(net.keys()).filter(d => d.endsWith('A'));
    const periods = nodes.map(n => steps(n, [dirs, net]));
    return periods.reduce(lcm);
};

(async () => {
    const input = await readInputLines('day8');
    const data = parse(input);

    console.log(part1(data));
    console.log(part2(data));
})();
