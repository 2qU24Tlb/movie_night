const assert = require('assert')
const { searchGoogle, searchDouban, movies } = require('../index')

describe('Google', function () {
    it('Should return search results', async function () {
        const { data: { items } } = await searchGoogle("batman")
        console.log(items)

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
    this.timeout(5000)
    it('Should return movie tables', async function () {
        try {
            await movies()
        } catch (e) {
            assert.equal(e, null)
        }
    })
})