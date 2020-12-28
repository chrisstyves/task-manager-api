// this file is automatically discovered by jest

const { calculateTip, fahrenheitToCelsius, celsiusToFahrenheit, add } = require('../src/math')

// test() is a global from jest
test('Should calculate total with tip', () => {
    const total = calculateTip(10, .3)

    // the manual way, but jest has tools to make this easier
    // if (total !== 13) {
    //     throw new Error('Total tip should be 13, but got ' + total)
    // }

    expect(total).toBe(13)
})

test('Should calculate total with default tip', () => {
    const total = calculateTip(10)
    expect(total).toBe(12.5)
})

test('Should convert 32 F to 0 C', () => {
    expect(fahrenheitToCelsius(32)).toBe(0)
})

test('Should convert 0 C to 32 F', () => {
    expect(celsiusToFahrenheit(0)).toBe(32)
})

// jest won't consider this a pass/fail until done is called
// test('Async test demo', (done) => {
//     setTimeout(() => {
//         expect(1).toBe(2)
//         done()
//     }, 2000)
// })

test('Async test demo (promise-based)', (done) => {
    add(2, 3).then((sum) => {
        expect(sum).toBe(5)
        done()
    })
})

test('Async test demo (async/await)', async () => {
    const sum = await add(10, 22)
    expect(sum).toBe(32)
})