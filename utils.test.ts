import { assertEquals, assertRejects } from '@std/assert'
import { type Model, modelManager } from './utils.ts'
import { assertSpyCall, spy } from '@std/testing/mock'

Deno.test('modelManager', async (t) => {
  await t.step(
    'If first one was successful, other models should not be called',
    async () => {
      const manager = modelManager([
        0 as unknown as Model,
        1 as unknown as Model,
        2 as unknown as Model,
      ])

      let called = 0
      await manager(() => {
        called++
        return Promise.resolve(null)
      })
      assertEquals(called, 1)
    },
  )
  await t.step(
    'If calling first one was failed, second model should be called',
    async () => {
      const second = spy()
      const manager = modelManager([
        (() => {
          throw new Error()
        }) as unknown as Model,
        second as unknown as Model,
      ])

      await manager(async (model) => {
        const fn = model as unknown as (() => Promise<void>)
        await fn()
        return null
      })

      assertSpyCall(second, 0, {
        args: [],
      })
    },
  )
  await t.step('Failed models should move to last of array', async () => {
    const models = [0, 1, 2]
    const manager = modelManager(models as unknown as Model[])

    let calledBefore = 0
    await manager(() => {
      calledBefore++
      return calledBefore === 1 ? Promise.reject(null) : Promise.resolve(null)
    })

    const calledAfter: number[] = []
    await manager((model) => {
      calledAfter.push(model as unknown as number)
      return Promise.reject(null)
    }).catch(() => null)

    assertEquals(calledAfter, [1, 2, 0])
  })
  await t.step('If all throwed an error, throw an error', async () => {
    const manager = modelManager([
      0,
      1,
      2,
    ] as unknown as Model[])

    await assertRejects(() => manager(() => Promise.reject(null)))
  })
})
