import { concatMap, map, readInputLines, reduce, splitEvery, splitOnEvery } from '../shared/utils';

type Range = [number, number];
type Mapping = [number, number, number][];

const parse = (lines: string[]): [number[], Mapping[]] => {
    const [[seeds], ...rest] = splitOnEvery(lines, '');
    return [
        seeds
            .split(': ')[1]
            .split(' ')
            .map(s => parseInt(s, 10)),
        rest
            .map(([_, ...mappings]) => mappings
                .map(m => m
                    .split(' ')
                    .map(n => parseInt(n, 10)) as [number, number, number])
                .toSorted(([, a], [, b]) => a - b)
            ),
    ];
}

const within = (x: number, [start, len]: Range): boolean => {
    return x >= start && x < (start + len);
};

function* convert([s, l]: Range, mapping: Mapping): IterableIterator<Range> {
    for (const [dest, source, len] of mapping) {
        if ((s + l) <= source) {
            // This range is entirely before this mapping
            // emit the entire range as-is and end
            yield [s, l];
            return;
        } else if (within(s, [source, len]) && within(s + l - 1, [source, len])) {
            // This range is entirely within this mapping
            // convert the entire range and end
            yield [dest + (s - source), l];
            return;
        } else if (within(source, [s, l]) && within(s + l - 1, [source, len])) { 
            // This range overhangs the beginning of this mapping
            // emit the section before the mapping and convert the section after
            // and end
            yield [s, source - s];
            yield [dest, l - (source - s)];
            return;
        } else if (within(s, [source, len]) && within(source + len - 1, [s, l])) {
            // This range overhangs the end of this mapping
            // convert the section within the mapping and update the remaining range
            yield [dest + (s - source), len - (s - source)];
            [s, l] = [source + len, l - (len - (s - source))];
        } else if (within(source, [s, l]) && within(source + len - 1, [s, l])) {
            // This range overhangs both sides of this mapping
            // emit the section before the mapping and convert the entire mapping
            // update the remaining range
            yield [s, source - s];
            yield [dest, len];
            [s, l] = [source + len, l - (len - (source - s))];
        }
    }

    if (l > 0) {
        yield [s, l];
    }
}

const part1 = ([items, mappings]: ReturnType<typeof parse>): number => {
    return Math.min(...items.map(i => mappings.reduce((item, mapping) => {
        const found = mapping.find(([, source, len]) => within(item, [source, len]))!;
        const [dest, source] = found ?? [0, 0];
        return dest + (item - source);
    }, i)));
};

const part2 = ([items, mappings]: ReturnType<typeof parse>): number => {
    const ranges = splitEvery(items, 2);
    const locations = concatMap(ranges, r => reduce(
        mappings,
        [r] as Iterable<Range>,
        (acc, curr) => concatMap(acc, r => convert(r, curr)),
    ));
    return Math.min(...map(locations, ([s]) => s));
};

(async () => {
    const input = await readInputLines('day5');
    const data = parse(input);

    console.log(part1(data));
    console.log(part2(data));
})();
