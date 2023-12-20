import { concatMap, groupBy, map, readInputLines, splitOn, sum, sumBy, zipper } from '../shared/utils';

type Cat = 'x' | 'm' | 'a' | 's';
type Condition = {
    category: Cat,
    operator: '>' | '<' | '>=' | '<=',
    value: number,
    label: string,
};
type Workflow = {
    name: string,
    conditions: Condition[],
    def: string,
};
type Part = Record<Cat, number>;
type Data = [Map<string, Workflow>, Part[]];

const parse = (lines: string[]): Data => {
    const [ws, ps] = splitOn(lines, '');
    const workflows = ws.map(w => {
        const [a, b] = w.split('{');
        const cs = b.slice(0, -1).split(',');
        return {
            name: a,
            conditions: cs.slice(0, -1).map(c => {
                const [a, b] = c.split(':');
                return {
                    category: a[0] as Cat,
                    operator: a[1] as Condition['operator'],
                    value: parseInt(a.slice(2), 10),
                    label: b
                };
            }),
            def: cs[cs.length - 1],
        }
    });
    const parts = ps.map(p => {
        return Object.fromEntries(p.slice(1, -1).split(',').map(c => {
            const [a, b] = c.split('=');
            return [a, parseInt(b, 10)];
        })) as Part;
    });
    return [new Map(workflows.map(w => [w.name, w])), parts];
};

const opposite: Record<Condition['operator'], Condition['operator']> = {
    '>': '<=',
    '<': '>=',
    '<=': '>',
    '>=': '<',
};

const matches = (part: Part, { category, operator, value }: Condition): boolean => {
    switch (operator) {
        case '<':
            return part[category] < value;
        case '>':
            return part[category] > value;
        case '>=':
            return part[category] >= value;
        case '<=':
            return part[category] <= value;
    }
};

function* paths(label: string, workflows: Map<string, Workflow>): IterableIterator<Condition[]> {
    if (label === 'A') {
        yield [];
        return;
    }

    if (label === 'R') {
        return;
    }

    const curr = workflows.get(label)!;
    for (const [prev, condition] of zipper(curr.conditions)) {
        yield* map(
            paths(condition.label, workflows),
            p => [...prev.map(c => ({ ...c, operator: opposite[c.operator] })), condition, ...p]
        );
    }

    yield* map(
        paths(curr.def, workflows),
        p => [...curr.conditions.map(c => ({ ...c, operator: opposite[c.operator] })), ...p]
    );
};

const count = (cs: Condition[]): number => {
    const [min, max] = cs.reduce(([min, max], curr) => {
        switch (curr.operator) {
            case '>':
                return [Math.max(min, curr.value + 1), max];
            case '>=':
                return [Math.max(min, curr.value), max];
            case '<':
                return [min, Math.min(max, curr.value - 1)];
            case '<=':
                return [min, Math.min(max, curr.value)];
        }
    }, [1, 4000]);

    return max - min + 1;
};

const part1 = ([ws, ps]: Data): number => {
    const accepted = concatMap(
        paths('in', ws), 
        cs => ps.filter(p => cs.every(c => matches(p, c))));
    return sumBy(accepted, p => sum(Object.values(p)));
};

const part2 = ([ws]: Data): number => {
    const counts = map(paths('in', ws), cs => {
        const groups = groupBy(cs, c => c.category);
        return (['x', 'm', 'a', 's'] as const)
            .reduce((acc, curr) => acc * count(groups[curr] ?? []), 1);
    });
    return sum(counts);
};

(async () => {
    const input = await readInputLines('day19');
    const data = parse(input);

    console.log(part1(data));
    console.log(part2(data));
})();
