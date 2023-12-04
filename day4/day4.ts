import { intersect, readInputLines, sumBy, sum } from '../shared/utils';

type Card = {
    id: number,
    overlap: number,
};

const parse = (line: string): Card => {
    const [a, b] = line.split(':');
    const id = parseInt(a.trim().split('Card')[1].trim(), 10);
    const [winning, have] = b
        .split('|')
        .map(x => new Set(x
            .trim()
            .split(' ')
            .map(s => parseInt(s.trim(), 10))
            .filter(n => !isNaN(n))));

    const overlap = intersect(winning, have).size;
    return {
        id,
        overlap
    };
};

const value = (overlap: number): number => {
    return overlap === 0 ? 0 : Math.pow(2, overlap - 1);
}

const part1 = (cards: Card[]): number => {
    return sumBy(cards, c => value(c.overlap));
};

const part2 = (cards: Card[]): number => {
    const seed = Object.fromEntries(cards.map(c => [c.id, 1]));
    const set = cards.reduce(
        (acc, curr) => {
            for (let i = curr.id + 1; i <= Math.min(cards.length, curr.id + curr.overlap); ++i)
            {
                acc[i] = acc[i] + acc[curr.id];
            }
            return acc;
        },
        seed);
    return sum(Object.values(set));
};

(async () => {
    const input = await readInputLines('day4');
    const cards = input.map(parse);

    console.log(part1(cards));
    console.log(part2(cards));
})();
