import Timer from '../../src/utils/Timer'
// import sinon from 'sinon'
import assert from 'assert'

describe('timer', () => {
    describe('promise', () => {
        it('should be rejected by timeout', () => {
            let timer = new Timer(20, 30, () => Promise.resolve(false))

            return timer.then(assert.fail, (e) => {
                expect(e.message).toBe('timeout')
            })
        })

        it('should be fulfilled when resolved with true value', () => {
            let timer = new Timer(20, 30, () => Promise.resolve(true))

            return timer.then(assert.isTrue, assert.fail)
        })

        it('should not be fulfilled when resolved with false value', () => {
            let timer = new Timer(20, 30, () => Promise.resolve(false))

            return timer.then(assert.fail, assert.ok)
        })

        it('should be rejected', () => {
            let timer = new Timer(20, 30, () => Promise.reject(new Error('err')))

            return timer.then(assert.fail).catch((msg) => {
                expect(msg.message).toBe('err')
            })
        })

        it('should be rejected when fuction does not return a promise', () => {
            let timer = new Timer(20, 30, () => {return true})

            return timer.then(assert.fail).catch((msg) => {
                expect(msg).toContain('Expected a promise as return value but got')
            })
        })
    })

    it('should execute condition at least once', () => {
        let wasExecuted = false
        let timer = new Timer(100, 200, () => new Promise((resolve) =>
            setTimeout(() => {
                wasExecuted = true
                resolve(true)
            }, 500)
        ))

        return timer.then(() => {
            assert.ok(wasExecuted)
        }, assert.fail)
    })
})
