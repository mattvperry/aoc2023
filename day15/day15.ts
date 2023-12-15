import { mod, readInputLines, reduce, sum, sumBy } from '../shared/utils';

type Op 
    = { type: '=', label: string, hash: number, length: number }
    | { type: '-', label: string, hash: number }
type Data = Op[];
type Slot = { label: string, length: number };

const hash = (str: string): number => reduce(
    str,
    0,
    (acc, curr) => mod((acc + curr.charCodeAt(0)) * 17, 256)
);

const parse = ([line]: string[]): Data => line.split(',').map(o => {
    if (o.includes('=')) {
        const [label, length] = o.split('=');
        return {
            type: '=',
            label,
            hash: hash(label),
            length: parseInt(length, 10),
        };
    } else {
        const label = o.slice(0, -1);
        return {
            type: '-',
            label,
            hash: hash(label),
        };
    }
});

const doOp = (op: Op, slots: Slot[]): Slot[] => {
    const idx = slots.findIndex(s => s.label === op.label);
    switch (op.type) {
        case '-':
            return slots.filter((_, i) => i !== idx);
        case '=':
            return idx === -1
                ? [...slots, { label: op.label, length: op.length }]
                : slots.map((x, i) => i !== idx ? x : { ...x, length: op.length });
    }
};

const part1 = ([line]: string[]): number => {
    return sumBy(line.split(','), hash);
};

const part2 = (data: Data): number => {
    const map = data.reduce(
        (acc, curr) => acc.set(curr.hash, doOp(curr, acc.get(curr.hash) ?? [])),
        new Map<number, Slot[]>()
    );

    return reduce(map.entries(), 0, (acc, [hash, slots]) => 
        acc + sum(slots.map(({ length }, i) => (hash + 1) * (i + 1) * length))
    );
};

(async () => {
    const input = await readInputLines('day15');

    console.log(part1(input));
    console.log(part2(parse(input)));
})();
