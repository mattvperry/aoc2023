import { map, readInputLines, reduce } from '../shared/utils';

type Str = 'high' | 'low';
type Pulse = { str: Str, source: string, targets: string[] };
type Broad = { type: 'broadcast', name: string, outputs: string[] }
type Flip = { type: 'flipflop', name: string, state: boolean, outputs: string[] }
type Con = { type: 'con', name: string, inputs: Map<string, Str>, outputs: string[] };
type Sink = { type: 'sink', name: string, outputs: string[] };
type Module = Broad | Flip | Con | Sink;
type Data = Map<string, Module>;

const parse = (lines: string[]): Data => {
    const modules = lines
        .map<Module>(l => {
            const [a, b] = l.split(' -> ');
            const outputs = b.split(', ');
            if (a === 'broadcaster') {
                return { type: 'broadcast', name: 'broadcaster', outputs };
            } else if (a[0] === '%') {
                return { type: 'flipflop', name: a.slice(1), state: false, outputs };
            } else {
                return { type: 'con', name: a.slice(1), inputs: new Map(), outputs };
            }
        })
        .map((m, _, all) => {
            if (m.type !== 'con') {
                return m;
            }

            const inputs = all.filter(x => x.outputs.includes(m.name));
            return {
                ...m,
                inputs: new Map<string, Str>(inputs.map(i => [i.name, 'low'])),
            }
        });

    const map = new Map<string, Module>(modules.map(m => [m.name, m]));
    const sinks = modules.flatMap(m => m.outputs).filter(t => !map.has(t));
    for (const s of sinks) {
        map.set(s, { type: 'sink', name: s, outputs: [] });
    }

    return map;
};

const pulse = (pulse: Pulse, module: Module): [Pulse | null, Module] => {
    switch (module.type) {
        case 'broadcast':
            return [{ str: 'low', source: module.name, targets: module.outputs }, module];
        case 'flipflop':
            if (pulse.str === 'high') {
                return [null, module];
            }

            return [
                { str: module.state ? 'low' : 'high', source: module.name, targets: module.outputs },
                { ...module, state: !module.state },
            ];
        case 'con':
            module.inputs.set(pulse.source, pulse.str);
            const str = Array.from(module.inputs.values()).every(i => i === 'high') ? 'low' : 'high';
            return [
                { str, source: module.name, targets: module.outputs },
                module,
            ];
        case 'sink':
            return [null, module];
    }
};

const push = (mods: Data, tracker: (pulse: Pulse) => void): Data => {
    const pulses: Pulse[] = [{ str: 'low', source: 'button', targets: ['broadcaster'] }];
    while (pulses.length !== 0) {
        const curr = pulses.shift()!;
        tracker(curr);

        for (const target of curr.targets) {
            const [next, module] = pulse(curr, mods.get(target)!);
            mods.set(target, module);
            if (next !== null) {
                pulses.push(next);
            }
        }
    }

    return mods;
};

const part1 = (data: Data): number => {
    let [low, high] = [0, 0];
    for (let i = 0; i < 1000; ++i) {
        const next = push(data, pulse => {
            if (pulse.str === 'low') {
                low += pulse.targets.length;
            } else {
                high += pulse.targets.length;
            }
        });

        data = next;
    }

    return low * high;
};

const part2 = (data: Data): number => {
    const [source] = Array.from(data.values()).filter(m => m.outputs.includes('rx'));
    if (source.type !== 'con') {
        return -1;
    }

    let pushes = 1;
    let trackers = new Map(map(source.inputs.keys(), n => [n, 0]));
    while (Array.from(trackers.values()).some(t => t === 0)) {
        const next = push(data, ({ source, str }) => {
            if (trackers.get(source) === 0 && str === 'high') {
                trackers.set(source, pushes);
            }
        });

        pushes++;
        data = next;
    }

    return reduce(trackers.values(), 1, (acc, curr) => acc * curr);
};

(async () => {
    const input = await readInputLines('day20');

    console.log(part1(parse(input)));
    console.log(part2(parse(input)));
})();
