const assert = require('assert')
const { searchGoogle, searchDouban, movies } = require('../index')

describe('Google', function () {
    it('Should return search results', async function () {
        const { data: { items } } = await searchGoogle("batman")

        assert.notEqual(items, null)
    })
})

describe('Douban', function () {
    this.timeout(5000)
    it('Douban should return movie meta', async function () {
        const res = await searchDouban("34968378")

        assert('name' in res)
    })
})

describe('List Movie', function () {
    this.timeout(1000 * 15)
    it('Should return movie tables', async function () {
        try {
            await movies({}, {}, 14, false, false)
        } catch (e) {
            assert.equal(e, null)
        }
    })
})