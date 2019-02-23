import test from 'ava'
import quotesets from '../../source/data/quotesets'

test('set 0', (t) => {
  t.deepEqual(quotesets[0], {
    openingDouble: `“`,
    closingDouble: `”`,
    openingSingle: `‘`,
    closingSingle: `’`
  })
})

test('set 1', (t) => {
  t.deepEqual(quotesets[1], {
    openingDouble: `« `,
    closingDouble: ` »`,
    openingSingle: `‹ `,
    closingSingle: ` ›`
  })
})

test('set 2', (t) => {
  t.deepEqual(quotesets[2], {
    openingDouble: `„`,
    closingDouble: `“`,
    openingSingle: `‚`,
    closingSingle: `‘`
  })
})

test('set 3', (t) => {
  t.deepEqual(quotesets[3], {
    openingDouble: `«`,
    closingDouble: `»`,
    openingSingle: `‹`,
    closingSingle: `›`
  })
})

test('set 4', (t) => {
  t.deepEqual(quotesets[4], {
    openingDouble: `”`,
    closingDouble: `”`,
    openingSingle: `’`,
    closingSingle: `’`
  })
})

test('set 5', (t) => {
  t.deepEqual(quotesets[5], {
    openingDouble: `„`,
    closingDouble: `”`,
    openingSingle: `’`,
    closingSingle: `’`
  })
})

test('set 6', (t) => {
  t.deepEqual(quotesets[6], {
    openingDouble: `«`,
    closingDouble: `»`,
    openingSingle: `’`,
    closingSingle: `’`
  })
})

test('set 7', (t) => {
  t.deepEqual(quotesets[7], {
    openingDouble: `‘`,
    closingDouble: `’`,
    openingSingle: `“`,
    closingSingle: `”`
  })
})
