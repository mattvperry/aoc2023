import { countBy, frequency, readInputLines, zip } from '../shared/utils';

type Hand = [keyof typeof cardRanks];
type Data = [Hand, number][];
type Type = number;

const cardRanks = {
    A: 14,
    K: 13,
    Q: 12,
    J: 11,
    T: 10,
    '9': 9,
    '8': 8,
    '7': 7,
    '6': 6,
    '5': 5,
    '4': 4,
    '3': 3,
    '2': 2,
    '1': 1,
};

const parse = (lines: string[]): Data => {
    return lines.map(l => {
        const [a, b] = l.split(' ');
        return [a.split('') as Hand, parseInt(b, 10)];
    });
};

const classify = (hand: Hand): Type => {
    const freq = Object.values(frequency(hand));
    if (freq.includes(5)) {
        return 6;
    } else if (freq.includes(4)) {
        return 5;
    } else if (freq.includes(3) && freq.includes(2)) {
        return 4;
    } else if (freq.includes(3)) {
        return 3;
    } else if (countBy(freq, x => x === 2) === 2) {
        return 2;
    } else if (freq.includes(2)) {
        return 1;
    } else {
        return 0;
    }
};

const classifyWild = (hand: Hand, wild: keyof typeof cardRanks): Type => {
    const { [wild]: wilds, ...rest } = frequency(hand);
    const freq = Object.values(rest);
    if (freq.includes(5)) {
        return 6;
    } else if (freq.includes(4)) {
        return wilds === 1 
            ? 6
            : 5;
    } else if (freq.includes(3) && freq.includes(2)) {
        return 4;
    } else if (freq.includes(3)) {
        return wilds === 1
            ? 5
            : wilds === 2
            ? 6
            : 3;
    } else if (countBy(freq, x => x === 2) === 2) {
        return wilds === 1
            ? 4
            : 2;
    } else if (freq.includes(2)) {
        return wilds === 3
            ? 6
            : wilds === 2
            ? 5
            : wilds === 1
            ? 3
            : 1;
    } else if (freq.includes(1)) {
        return wilds === 4
            ? 6
            : wilds === 3
            ? 5
            : wilds === 2
            ? 3
            : wilds === 1
            ? 1
            : 0;
    } else {
        return wilds === 5
            ? 6
            : wilds === 4
            ? 5
            : wilds === 3
            ? 3
            : wilds === 2
            ? 1
            : 0;
    }
};

const sort = ([a, ta]: [Hand, Type], [b, tb]: [Hand, Type], ranks: typeof cardRanks): number => {
    if (ta !== tb) {
        return ta - tb;
    }

    for (const [x, y] of zip(a, b)) {
        if (x !== y) {
            return ranks[x] - ranks[y];
        }
    }

    return 0;
};

const part1 = (data: Data): number => {
    return data
        .map(([hand, bid]) => [[hand, classify(hand)], bid] as [[Hand, Type], number])
        .toSorted(([a], [b]) => sort(a, b, cardRanks))
        .reduce((acc, [, bid], idx) => acc + (bid * (idx + 1)), 0);
};

const part2 = (data: Data): number => {
    return data
        .map(([hand, bid]) => [[hand, classifyWild(hand, 'J')], bid] as [[Hand, Type], number])
        .toSorted(([a], [b]) => sort(a, b, { ...cardRanks, J: 1 }))
        .reduce((acc, [, bid], idx) => acc + (bid * (idx + 1)), 0);
};

(async () => {
    const input = await readInputLines('day7');
    const data = parse(input);

    console.log(part1(data));
    console.log(part2(data));
})();
