import * as fc from 'fast-check';
import Result from '@sweet-monads/Result';

describe('Result', () => {

    test.each([
        [Result.initial(), true, false, false, false],
        [Result.pending(), false, true, false, false],
        [Result.success('s'), false, false, true, false],
        [Result.failure('s'), false, false, false, true],
    ])('Static constants initializing ', (input, initial, pending, success, failure) => {
        expect(input.isInitial()).toBe(initial);
        expect(input.isPending()).toBe(pending);
        expect(input.isSuccess()).toBe(success);
        expect(input.isFailure()).toBe(failure);
    })
});
