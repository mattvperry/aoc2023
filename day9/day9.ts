import { readInputLines, sumBy, zip } from '../shared/utils';

type History = number[];
type Data = History[];

const parse = (lines: string[]): Data => {
    return lines.map(l => l.split(' ').map(x => parseInt(x, 10)));
};

function* seq(history: History): IterableIterator<History> {
    if (history.every(x => x === 0)) {
        yield history;
        return;
    }

    yield history;
    const next = zip(history, history.slice(1)).map(([a, b]) => b - a);
    yield* seq(next);
};

const part1 = (data: Data): number => {
    return sumBy(
        data,
        h => sumBy(seq(h), x => x[x.length - 1]));
};

const part2 = (data: Data): number => {
    return sumBy(
        data,
        h => Array.from(seq(h)).toReversed().reduce((acc, curr) => curr[0] - acc, 0));
};

(async () => {
    const input = await readInputLines('day9');
    const data = parse(input);

    console.log(part1(data));
    console.log(part2(data));
})();
