import * as fc from "fast-check";
import Maybe from "@sweet-monads/maybe";
import LazyIterator from "@sweet-monads/iterator";

describe("Iterator", () => {
  test("toString", () => {
    expect(LazyIterator.from([]).toString()).toBe("[object LazyIterator]");
  });
  describe("all", () => {
    it("should say true for all items", () => {
      fc.assert(
        fc.property(fc.array(fc.nat()), (arr: number[]) => {
          const iterator: LazyIterator<number> = LazyIterator.from(arr);
          expect(iterator.all(a => typeof a === "number")).toBe(true);
        })
      );
    });
    it("should say false for all items", () => {
      fc.assert(
        fc.property(fc.array(fc.nat()), (arr: number[]) => {
          const iterator: LazyIterator<number> = LazyIterator.from(arr);
          expect(iterator.all(a => typeof a === "string")).toBe(arr.length === 0);
        })
      );
    });
  });
  describe("any", () => {
    it("should say true for any item", () => {
      fc.assert(
        fc.property(fc.array(fc.nat()), (arr: number[]) => {
          const iterator: LazyIterator<number> = LazyIterator.from(arr);
          expect(iterator.any(a => typeof a === "number")).toBe(arr.length !== 0);
        })
      );
    });
    it("should say false for any item", () => {
      fc.assert(
        fc.property(fc.array(fc.nat()), (arr: number[]) => {
          const iterator: LazyIterator<number> = LazyIterator.from(arr);
          expect(iterator.any(a => typeof a === "string")).toBe(false);
        })
      );
    });
  });
  describe("chain", () => {
    it("should merge two iterators in one lazy", () => {
      fc.assert(
        fc.property(fc.array(fc.nat()), fc.array(fc.nat()), (arr1: number[], arr2: number[]) => {
          const iterator: LazyIterator<number> = LazyIterator.from(arr1).chain(arr2);
          expect([...iterator]).toEqual([...arr1, ...arr2]);
          expect(iterator).toBeInstanceOf(LazyIterator);
        })
      );
    });
  });
  describe("count", () => {
    it("should give right count of items", () => {
      fc.assert(
        fc.property(fc.array(fc.nat()), (arr: number[]) => {
          const iterator: LazyIterator<number> = LazyIterator.from(arr);
          expect(iterator.count()).toBe(arr.length);
          expect(iterator).toBeInstanceOf(LazyIterator);
        })
      );
    });
  });
  describe("cycle", () => {
    it("should create infinity link", () => {
      fc.assert(
        fc.property(fc.array(fc.nat()), (arr: number[]) => {
          const iterator: LazyIterator<number> = LazyIterator.from(arr).cycle();
          if (arr.length === 0) {
            expect(iterator[Symbol.iterator]().next().done).toBe(true);
          } else {
            let neededIndex = arr.length * 3;
            let lastItem;
            let firstItem;
            for (const item of iterator) {
              if (firstItem === undefined) {
                firstItem = item;
              }
              if (neededIndex-- < 0) {
                break;
              }
              lastItem = item;
            }
            expect(lastItem).toBe(firstItem);
          }
        })
      );
    });
  });
  describe("enumarate", () => {
    it("should create enumarated iterator", () => {
      fc.assert(
        fc.property(fc.array(fc.nat()), (arr: number[]) => {
          const iterator = LazyIterator.from(arr).enumarate();
          for (const [index, item] of iterator) {
            expect(item).toBe(arr[index]);
          }
          expect(iterator.count()).toBe(arr.length);
        })
      );
    });
  });
  describe("fold", () => {
    it("should do right folding", () => {
      fc.assert(
        fc.property(fc.array(fc.nat()), (arr: number[]) => {
          const sum = (s: number, a: number) => s + a;
          const concat = (s: string, a: number) => s + a;
          const iterator: LazyIterator<number> = LazyIterator.from(arr);
          if (arr.length !== 0) {
            expect(iterator.fold(sum)).toEqual(arr.reduce(sum));
          }
          expect(iterator.fold(concat, "")).toEqual(arr.reduce(concat, ""));
        })
      );
    });
  });
  describe("first", () => {
    it("should get right first element with Maybe", () => {
      fc.assert(
        fc.property(fc.array(fc.nat()), (arr: number[]) => {
          const iterator: LazyIterator<number> = LazyIterator.from(arr);
          const first = iterator.first();
          expect(first).toEqual(arr[0] === undefined ? Maybe.none() : Maybe.just(arr[0]));
        })
      );
    });
    it("should get right first element", () => {
      fc.assert(
        fc.property(fc.array(fc.nat()), (arr: number[]) => {
          const iterator: LazyIterator<number> = LazyIterator.from(arr);
          expect(iterator.first(true)).toBe(arr[0]);
        })
      );
    });
  });
  describe("filter", () => {
    it("should get right filtered elements", () => {
      fc.assert(
        fc.property(fc.array(fc.nat()), (arr: number[]) => {
          const criteria = (item: number) => item < 3;
          const iterator: LazyIterator<number> = LazyIterator.from(arr);
          expect([...iterator.filter(criteria)]).toEqual([...arr.filter(criteria)]);
        })
      );
    });
  });
  describe("filterMap", () => {
    it("should get right filtered and mapped elements with Maybe", () => {
      fc.assert(
        fc.property(fc.array(fc.nat()), (arr: number[]) => {
          const criteria = (item: number) => item < 3;
          const map = (item: number) => (item < 3 ? Maybe.just(item + 5) : Maybe.none());
          const iterator: LazyIterator<number> = LazyIterator.from(arr);
          expect([...iterator.filterMap(map)]).toEqual([
            ...arr
              .filter(criteria)
              .map(map)
              .map(a => a.value)
          ]);
        })
      );
    });
    it("should get right filtered and mapped elements", () => {
      fc.assert(
        fc.property(fc.array(fc.nat()), (arr: number[]) => {
          const criteria = (item: number) => item < 3;
          const map = (item: number) => (item < 3 ? item + 5 : undefined);
          const iterator: LazyIterator<number> = LazyIterator.from(arr);
          expect([...iterator.filterMap(map)]).toEqual([...arr.filter(criteria).map(map)]);
        })
      );
    });
  });
  describe("find", () => {
    it("should find element with Maybe", () => {
      fc.assert(
        fc.property(fc.array(fc.nat()), (arr: number[]) => {
          const iterator: LazyIterator<number> = LazyIterator.from(arr);
          const finder = (a: number) => a === 3;
          const element = iterator.find(finder);
          if (arr.find(finder)) {
            expect(element).toEqual(Maybe.just(3));
          } else {
            expect(element).toEqual(Maybe.none());
          }
        })
      );
    });
    it("should find element", () => {
      fc.assert(
        fc.property(fc.array(fc.nat()), (arr: number[]) => {
          const iterator: LazyIterator<number> = LazyIterator.from(arr);
          const finder = (a: number) => a === 3;
          expect(iterator.find(finder, true)).toBe(arr.find(finder));
        })
      );
    });
  });
  describe("findMap", () => {
    it("should find and map element with Maybe", () => {
      fc.assert(
        fc.property(fc.array(fc.nat()), (arr: number[]) => {
          const iterator: LazyIterator<number> = LazyIterator.from(arr);
          const element1 = iterator.findMap(a => (a === 3 ? Maybe.just(a + 3) : Maybe.none()));
          if (arr.includes(3)) {
            expect(element1).toEqual(Maybe.just(6));
          } else {
            expect(element1).toEqual(Maybe.none());
          }
        })
      );
    });
    it("should find and map element", () => {
      fc.assert(
        fc.property(fc.array(fc.nat()), (arr: number[]) => {
          const iterator: LazyIterator<number> = LazyIterator.from(arr);
          const element1 = iterator.findMap(a => (a === 3 ? a + 3 : undefined), true);
          if (arr.find(a => a === 3)) {
            expect(element1).toEqual(6);
          } else {
            expect(element1).toEqual(undefined);
          }
        })
      );
    });
  });
  describe("flatMap", () => {
    it("should flatten and map elements", () => {
      fc.assert(
        fc.property(fc.array(fc.nat()), (arr: number[]) => {
          const iterator: LazyIterator<number> = LazyIterator.from(arr);
          const mapper = (a: number) => LazyIterator.from([a + 2]);
          const result = iterator.flatMap(mapper);
          const expected = arr.reduce((arr, el) => [...arr, ...mapper(el)], []);
          expect([...result]).toEqual(expected);
        })
      );
    });
  });
  describe("flatten", () => {
    it("should flatten elements", () => {
      fc.assert(
        fc.property(fc.array(fc.nat()), fc.array(fc.nat()), (arr1: number[], arr2: number[]) => {
          const iterator1: LazyIterator<number> = LazyIterator.from(arr1);
          const iterator2: LazyIterator<number> = LazyIterator.from(arr2);
          const iterator: LazyIterator<LazyIterator<number>> = LazyIterator.from([iterator1, iterator2]);
          const result = iterator.flatten();
          const expected = [...arr1, ...arr2];
          expect([...result]).toEqual(expected);
        })
      );
    });
  });
  describe("forEach", () => {
    it("should run fn for all elements", () => {
      fc.assert(
        fc.property(fc.array(fc.nat()), (arr: number[]) => {
          const iterator: LazyIterator<number> = LazyIterator.from(arr);
          const fn = jest.fn(el => el);
          iterator.forEach(fn);
          expect(fn.mock.calls.length).toBe(arr.length);
          fn.mock.calls.forEach(([el], i) => {
            expect(el).toBe(arr[i]);
          });
        })
      );
    });
  });
  describe("last", () => {
    it("should get right last element with Maybe", () => {
      fc.assert(
        fc.property(fc.array(fc.nat()), (arr: number[]) => {
          const iterator: LazyIterator<number> = LazyIterator.from(arr);
          const last = arr[arr.length - 1];
          expect(iterator.last()).toEqual(last === undefined ? Maybe.none() : Maybe.just(last));
        })
      );
    });
    it("should get right last element", () => {
      fc.assert(
        fc.property(fc.array(fc.nat()), (arr: number[]) => {
          const iterator: LazyIterator<number> = LazyIterator.from(arr);
          const last = arr[arr.length - 1];
          expect(iterator.last(true)).toBe(last);
        })
      );
    });
  });
  describe("map", () => {
    it("should get mapped elements", () => {
      fc.assert(
        fc.property(fc.array(fc.nat()), (arr: number[]) => {
          const iterator: LazyIterator<number> = LazyIterator.from(arr);
          const mapper = (a: number) => a + 2;
          expect([...iterator.map(mapper)]).toEqual(arr.map(mapper));
        })
      );
    });
  });
  describe("max", () => {
    it("should get right max element with maybe", () => {
      fc.assert(
        fc.property(fc.array(fc.nat()), (arr: number[]) => {
          const iterator: LazyIterator<number> = LazyIterator.from(arr);
          const max1 = iterator.max();
          const max2 = Math.max(...arr);
          expect(max1).toEqual(isFinite(max2) ? Maybe.just(max2) : Maybe.none());
        })
      );
    });
    it("should get right max element", () => {
      fc.assert(
        fc.property(fc.array(fc.nat()), (arr: number[]) => {
          const iterator: LazyIterator<number> = LazyIterator.from(arr);
          const max1 = iterator.max(a => a, true);
          const max2 = Math.max(...arr);
          expect(max1).toEqual(isFinite(max2) ? max2 : undefined);
        })
      );
    });
  });
  describe("min", () => {
    it("should get right min element with maybe", () => {
      fc.assert(
        fc.property(fc.array(fc.nat()), (arr: number[]) => {
          const iterator: LazyIterator<number> = LazyIterator.from(arr);
          const min1 = iterator.min();
          const min2 = Math.min(...arr);
          expect(min1).toEqual(isFinite(min2) ? Maybe.just(min2) : Maybe.none());
        })
      );
    });
    it("should get right min element", () => {
      fc.assert(
        fc.property(fc.array(fc.nat()), (arr: number[]) => {
          const iterator: LazyIterator<number> = LazyIterator.from(arr);
          const min1 = iterator.min(a => a, true);
          const min2 = Math.min(...arr);
          expect(min1).toEqual(isFinite(min2) ? min2 : undefined);
        })
      );
    });
  });
  describe("nth", () => {
    it("should get right nth element with maybe", () => {
      fc.assert(
        fc.property(fc.array(fc.nat()), fc.nat(), (arr: number[], index: number) => {
          const iterator: LazyIterator<number> = LazyIterator.from(arr);
          const nth1 = iterator.nth(index);
          const nth2 = arr[index];
          expect(nth1).toEqual(nth2 !== undefined ? Maybe.just(nth2) : Maybe.none());
        })
      );
    });
    it("should get right nth element", () => {
      fc.assert(
        fc.property(fc.array(fc.nat()), fc.nat(), (arr: number[], index: number) => {
          const iterator: LazyIterator<number> = LazyIterator.from(arr);
          const nth1 = iterator.nth(index, true);
          const nth2 = arr[index];
          expect(nth1).toBe(nth2);
        })
      );
    });
  });
  describe("partion", () => {
    it("should get right partioned elements", () => {
      fc.assert(
        fc.property(fc.array(fc.nat()), (arr: number[]) => {
          const iterator: LazyIterator<number> = LazyIterator.from(arr);
          const filterFn = (a: number) => a < 3;
          const [left1, right1] = iterator.partion(filterFn);
          const [left2, right2] = [arr.filter(filterFn), arr.filter(a => !filterFn(a))];
          expect(left1).toEqual(left2);
          expect(right1).toEqual(right2);
        })
      );
    });
  });
  describe("position", () => {
    it("should get right position of element with maybe", () => {
      fc.assert(
        fc.property(fc.array(fc.nat()), (arr: number[]) => {
          const iterator: LazyIterator<number> = LazyIterator.from(arr);
          const position1 = iterator.position(a => a === 3);
          const position2 = arr.indexOf(3);
          expect(position1).toEqual(position2 === -1 ? Maybe.none() : Maybe.just(position2));
        })
      );
    });
    it("should get right position of element", () => {
      fc.assert(
        fc.property(fc.array(fc.nat()), (arr: number[]) => {
          const iterator: LazyIterator<number> = LazyIterator.from(arr);
          const position1 = iterator.position(a => a === 3, true);
          const position2 = arr.indexOf(3);
          expect(position1).toBe(position2 === -1 ? undefined : position2);
        })
      );
    });
  });
  describe("product", () => {
    it("should get right product of elements", () => {
      fc.assert(
        fc.property(fc.array(fc.nat()), (arr: number[]) => {
          const iterator: LazyIterator<number> = LazyIterator.from(arr);
          const product1 = iterator.product();
          const product2 = arr.reduce((p, e) => p * e, 1);
          expect(product1).toBe(product2);
        })
      );
    });
  });
  describe("reverse", () => {
    it("should get right reversed elements", () => {
      fc.assert(
        fc.property(fc.array(fc.nat()), (arr: number[]) => {
          const iterator: LazyIterator<number> = LazyIterator.from(arr);
          expect([...iterator.reverse()]).toEqual(arr.reverse());
        })
      );
    });
  });
  describe("scan", () => {
    it("should get right scanned elements", () => {
      fc.assert(
        fc.property(fc.array(fc.nat()), (arr: number[]) => {
          const iterator: LazyIterator<number> = LazyIterator.from(arr);
          const products1 = [...iterator.scan((a, b) => a * b, 1)];
          const products2 = arr.reduce<[number, number[]]>(([a, els], b) => [a * b, els.concat([a * b])], [1, []]);
          expect(products1).toEqual(products2[1]);
        })
      );
    });
  });
  describe("skip", () => {
    it("should get right skipped elements", () => {
      fc.assert(
        fc.property(fc.array(fc.nat()), (arr: number[]) => {
          const iterator: LazyIterator<number> = LazyIterator.from(arr);
          expect([...iterator.skip(2)]).toEqual(arr.slice(2));
        })
      );
    });
  });
  describe("skipWhile", () => {
    it("should get right skipped elements", () => {
      fc.assert(
        fc.property(fc.array(fc.nat()), (arr: number[]) => {
          const iterator: LazyIterator<number> = LazyIterator.from(arr);
          const index = arr.indexOf(3);
          expect([...iterator.skipWhile(a => a !== 3)]).toEqual(index === -1 ? [] : arr.slice(index));
        })
      );
    });
  });
  describe("stepBy", () => {
    it("should get right stepped elements", () => {
      fc.assert(
        fc.property(
          fc.array(fc.nat()),
          fc.nat().filter((a: number) => a > 0),
          (arr: number[], step: number) => {
            const iterator: LazyIterator<number> = LazyIterator.from(arr);
            expect([...iterator.stepBy(step)]).toEqual(arr.filter((_, i) => i % step === 0));
          }
        )
      );
    });
  });
  describe("sum", () => {
    it("should get right sum of elements", () => {
      fc.assert(
        fc.property(fc.array(fc.nat()), (arr: number[]) => {
          const iterator: LazyIterator<number> = LazyIterator.from(arr);
          const sum1 = iterator.sum();
          const sum2 = arr.reduce((a, b) => a + b, 0);
          expect(sum1).toBe(sum2);
        })
      );
    });
  });
  describe("take", () => {
    it("should take right elements", () => {
      fc.assert(
        fc.property(fc.array(fc.nat()), fc.nat(), (arr: number[], count: number) => {
          const iterator: LazyIterator<number> = LazyIterator.from(arr);
          expect([...iterator.take(count)]).toEqual(arr.slice(0, count));
        })
      );
    });
  });
  describe("takeWhile", () => {
    it("should take right elements", () => {
      fc.assert(
        fc.property(fc.array(fc.nat()), (arr: number[]) => {
          const iterator: LazyIterator<number> = LazyIterator.from(arr);
          const index = arr.findIndex(a => a >= 3);
          expect([...iterator.takeWhile(a => a < 3)]).toEqual(index === -1 ? arr : arr.slice(0, index));
        })
      );
    });
  });
  describe("unzip", () => {
    it("should get right unzipped elements", () => {
      fc.assert(
        fc.property(fc.array(fc.tuple(fc.nat(), fc.nat())), (arr: Array<[number, number]>) => {
          const iterator: LazyIterator<[number, number]> = LazyIterator.from(arr);
          const [left, right] = iterator.unzip();
          for (let i = 0; i < arr.length; i++) {
            const [l, r] = arr[i];
            expect(left[i]).toBe(l);
            expect(right[i]).toBe(r);
          }
        })
      );
    });
  });
  describe("zip", () => {
    it("should get right zipped elements", () => {
      fc.assert(
        fc.property(fc.array(fc.nat()), fc.array(fc.nat()), (arr1: number[], arr2: number[]) => {
          const iterator: LazyIterator<number> = LazyIterator.from(arr1);
          const zipped1 = iterator.zip(LazyIterator.from(arr2));
          const zipped2 = arr1.map((el, i) => [el, arr2[i]]).filter(a => a.every(a => a !== undefined));
          expect([...zipped1]).toEqual(zipped2);
        })
      );
    });
  });
  describe("compress", () => {
    it("should get right compressed elements", () => {
      fc.assert(
        fc.property(fc.array(fc.nat()), fc.array(fc.boolean()), (arr: number[], bits: Array<boolean>) => {
          const iterator: LazyIterator<number> = LazyIterator.from(arr);
          const compressed1 = iterator.compress(bits);
          const compressed2 = arr.filter((_, i) => bits[i]);
          expect([...compressed1]).toEqual(compressed2);
        })
      );
    });
  });
  describe("permutations", () => {
    it("should get right permutated elements", () => {
      fc.assert(
        fc.property(fc.array(fc.nat()), (arr: number[]) => {
          const iterator: LazyIterator<number> = LazyIterator.from(arr);
          const permutated1 = iterator.permutations();
          const permutated2 = arr.reduce(
            (res: [number, number][], el1, i1) => res.concat(arr.filter((_, i2) => i1 !== i2).map(el2 => [el1, el2])),
            [] as Array<[number, number]>
          );
          expect([...permutated1]).toEqual(permutated2);
        })
      );
    });
  });
  describe("slice", () => {
    it("should get right sliced elements", () => {
      fc.assert(
        fc.property(fc.array(fc.nat()), (arr: number[]) => {
          const iterator: LazyIterator<number> = LazyIterator.from(arr);
          const sliced1 = iterator.slice(2, 6);
          const sliced2 = arr.slice(2, 6);
          expect([...sliced1]).toEqual(sliced2);
        })
      );
    });
  });
  describe("compact", () => {
    it("should get right compacted elements", () => {
      fc.assert(
        fc.property(fc.array(fc.oneof(fc.nat(), fc.constant(undefined))), (arr: Array<number | undefined>) => {
          const iterator: LazyIterator<number | undefined> = LazyIterator.from(arr);
          const compacted1 = iterator.compact();
          const compacted2 = arr.filter(a => a !== undefined);
          expect([...compacted1]).toEqual(compacted2);
        })
      );
    });
  });
  describe("contains", () => {
    it("should show including element in iterator", () => {
      fc.assert(
        fc.property(fc.array(fc.nat()), fc.nat(), (arr: number[], element: number) => {
          const iterator: LazyIterator<number> = LazyIterator.from(arr);
          expect(iterator.contains(element)).toEqual(arr.includes(element));
        })
      );
    });
  });
  describe("unique", () => {
    it("should get right unique elements", () => {
      fc.assert(
        fc.property(fc.array(fc.nat()), (arr: number[]) => {
          const iterator: LazyIterator<number> = LazyIterator.from(arr);
          const unique1 = iterator.unique();
          const unique2 = arr.reduce((res, el) => (res.includes(el) ? res : [...res, el]), [] as number[]);
          expect([...unique1]).toEqual(unique2);
        })
      );
    });
  });
  describe("except", () => {
    it("should get right excepted elements", () => {
      fc.assert(
        fc.property(fc.array(fc.nat()), fc.array(fc.nat()), (arr1: number[], arr2: number[]) => {
          const iterator1: LazyIterator<number> = LazyIterator.from(arr1);
          const iterator2: LazyIterator<number> = LazyIterator.from(arr2);
          const except1 = iterator1.except(iterator2);
          const except2 = arr1.filter(a => !arr2.includes(a));
          expect([...except1]).toEqual(except2);
        })
      );
    });
  });
  describe("intersect", () => {
    it("should get right intersected elements", () => {
      fc.assert(
        fc.property(fc.array(fc.nat()), fc.array(fc.nat()), (arr1: number[], arr2: number[]) => {
          const iterator1: LazyIterator<number> = LazyIterator.from(arr1);
          const iterator2: LazyIterator<number> = LazyIterator.from(arr2);
          const except1 = iterator1.intersect(iterator2);
          const except2 = arr1.filter(a => arr2.includes(a));
          expect([...except1]).toEqual(except2);
        })
      );
    });
  });
  describe("isEmpty", () => {
    it("should show right empty iterator", () => {
      fc.assert(
        fc.property(fc.array(fc.nat()), (arr: number[]) => {
          const iterator: LazyIterator<number> = LazyIterator.from(arr);
          expect(iterator.isEmpty()).toBe(arr.length === 0);
        })
      );
    });
  });
  describe("prepend", () => {
    it("should add right element to head of iterator", () => {
      fc.assert(
        fc.property(fc.array(fc.nat()), fc.nat(), (arr: number[], element: number) => {
          const iterator: LazyIterator<number> = LazyIterator.from(arr);
          const newIterator: LazyIterator<number> = iterator.prepend(element);
          expect([...newIterator]).toEqual([element, ...arr]);
        })
      );
    });
  });
  describe("append", () => {
    it("should add right element to tail of iterator", () => {
      fc.assert(
        fc.property(fc.array(fc.nat()), fc.nat(), (arr: number[], element: number) => {
          const iterator: LazyIterator<number> = LazyIterator.from(arr);
          const newIterator: LazyIterator<number> = iterator.append(element);
          expect([...newIterator]).toEqual([...arr, element]);
        })
      );
    });
  });
});
