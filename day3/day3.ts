import { intersect, readInputLines, sumBy } from '../shared/utils';

type Point = readonly [number, number];
type PointS = `${number}_${number}`;
type Num = { set: Set<PointS>, num: number };
type Symbol = { set: Set<PointS>, mark: string };

const toStr = ([x, y]: Point): PointS => `${x}_${y}`;

const neighbors = ([x, y]: Point): PointS[] => ([
    [x + 1, y],
    [x - 1, y],
    [x, y + 1],
    [x, y - 1],
    [x + 1, y + 1],
    [x + 1, y - 1],
    [x - 1, y + 1],
    [x - 1, y - 1],
] as const).map(toStr);

const digitsToNum = (digits: number[]): number => digits
    .reverse()
    .reduce((acc, curr, idx) => curr * Math.pow(10, idx) + acc);

const parse = (lines: string[]): [Symbol[], Num[]] => {
    let symbols: Symbol[] = [];
    let nums: Num[] = [];
    let points: PointS[] = [];
    let digits: number[] = [];

    for (let y = 0; y < lines.length; ++y) {
        for (let x = 0; x < lines[0].length; ++x) {
            const curr = lines[y][x];
            if (curr.match(/[0-9]/)) {
                points = [...points, toStr([x, y])];
                digits = [...digits, parseInt(curr, 10)];
                continue;
            }

            if (points.length > 0) {
                nums = [...nums, {
                    set: new Set(points),
                    num: digitsToNum(digits)
                }];
            }

            if (curr !== '.') {
                symbols = [...symbols, {
                    set: new Set(neighbors([x, y])),
                    mark: curr,
                }];
            }

            [points, digits] = [[], []];
        }
    }

    return [symbols, nums];
};

const isGear = ([{ mark }, { length }]: readonly [Symbol, Num[]]): boolean => {
    return mark === '*' && length === 2;
};

const day3 = (lines: string[]): [number, number] => {
    const [symbols, nums] = parse(lines);
    const data = symbols.map(
        s => [s, nums.filter(n => intersect(s.set, n.set).size != 0)] as const);
    return [
        sumBy(data, ([_, nums]) => sumBy(nums, n => n.num)),
        sumBy(data.filter(isGear), ([_, [a, b]]) => a.num * b.num),
    ];
};

(async () => {
    const input = await readInputLines('day3');
    const [part1, part2] = day3(input);

    console.log(part1);
    console.log(part2);
})();
