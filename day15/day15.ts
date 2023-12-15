import { mod, readInputLines, reduce, sumBy } from '../shared/utils';

type Op 
    = { type: '=', label: string, hash: number, length: number }
    | { type: '-', label: string, hash: number }
type Slot = { label: string, length: number }
type Data = Op[];

const hash = (str: string): number => reduce(
    str,
    0,
    (acc, curr) => mod((acc + curr.charCodeAt(0)) * 17, 256)
);

const parse = ([line]: string[]): Data => {
    return line.split(',').map(o => {
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
};

const part1 = ([line]: string[]): number => {
    return sumBy(line.split(','), hash);
};

const part2 = (data: Data): number => {
    const map = new Map<number, Slot[]>();
    for (const op of data) {
        const slots = map.get(op.hash);
        switch (op.type) {
            case '-':
                if (slots === undefined) {
                    continue;
                }

                map.set(op.hash, slots.filter(({ label }) => label !== op.label));
                break;
            case '=':
                const slot = { label: op.label, length: op.length };
                if (slots === undefined) {
                    map.set(op.hash, [slot]);
                    continue;
                }

                const idx = slots.findIndex(s => s.label === op.label);
                if (idx === -1) {
                    map.set(op.hash, [...slots, slot]);
                } else {
                    map.set(op.hash, slots.map((x, i) => i === idx ? slot : x));
                }
                break;
        }
    }

    const labels = new Set<string>(data.map(o => o.label));
    return reduce(labels, 0, (acc, curr) => {
        const slots = map.get(hash(curr));
        const idx = slots?.findIndex(s => s.label === curr) ?? -1;
        if (slots === undefined || idx === -1) {
            return acc;
        }

        return acc + ((hash(curr) + 1) * (idx + 1) * (slots[idx].length));
    });
};

(async () => {
    const input = await readInputLines('day15');

    console.log(part1(input));
    console.log(part2(parse(input)));
})();
