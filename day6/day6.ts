import { countBy, readInputLines, zip } from '../shared/utils';

type Data = [number[], number[]];

function* distances(max: number): IterableIterator<number> {
    for (let i = 1; i < max; ++i) {
        yield i * (max - i);
    }
}

const parse = (lines: string[]): Data => {
    return lines.map(l => l
        .split(':')[1]
        .split(' ')
        .map(x => parseInt(x, 10))
        .filter(x => !isNaN(x))
    ) as Data;
};

const part1 = ([time, distance]: Data): number => {
    return zip(time, distance)
        .map(([t, d]) => countBy(distances(t), x => x >= d))
        .reduce((acc, curr) => acc * curr);
};

const part2 = ([time, distance]: Data): number => {
    const t = parseInt(time.join(''), 10);
    const d = parseInt(distance.join(''), 10);
    return countBy(distances(t), x => x >= d);
};

(async () => {
    const input = await readInputLines('day6');
    const data = parse(input);

    console.log(part1(data));
    console.log(part2(data));
})();
