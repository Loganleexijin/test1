import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import type { AddressInfo } from 'net'
import app from '../app.js'

let baseUrl = ''
let server: any

beforeAll(async () => {
  server = app.listen(0)
  const address = server.address() as AddressInfo
  baseUrl = `http://127.0.0.1:${address.port}`
})

afterAll(async () => {
  await new Promise<void>((resolve) => server.close(() => resolve()))
})

async function http<T>(path: string, init?: RequestInit): Promise<{ status: number; json: any }> {
  const res = await fetch(`${baseUrl}${path}`, init)
  const json = await res.json().catch(() => null)
  return { status: res.status, json }
}

describe('api', () => {
  test('health', async () => {
    const { status, json } = await http('/api/health')
    expect(status).toBe(200)
    expect(json).toMatchObject({ success: true })
  })

  test('fasting start/current/end/history', async () => {
    const startBody = JSON.stringify({ targetHours: 16, startTime: Date.now(), plan: '16:8' })
    const startRes = await http('/api/fasting/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: startBody,
    })
    expect(startRes.status).toBe(200)
    expect(startRes.json).toMatchObject({ success: true })

    const currentRes = await http('/api/fasting/current')
    expect(currentRes.status).toBe(200)
    expect(currentRes.json.success).toBe(true)

    const endRes = await http('/api/fasting/end', { method: 'POST' })
    expect(endRes.status).toBe(200)
    expect(endRes.json).toMatchObject({ success: true })

    const historyRes = await http('/api/fasting/history')
    expect(historyRes.status).toBe(200)
    expect(historyRes.json.success).toBe(true)
    expect(Array.isArray(historyRes.json.data)).toBe(true)
  })

  test('meals create/list/delete', async () => {
    const createRes = await http('/api/meals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        timestamp: Date.now(),
        type: 'breakfast',
        imageUrl: null,
        foodName: '测试早餐',
        calories: 100,
        aiAnalysis: { tags: ['测试'] },
      }),
    })
    expect(createRes.status).toBe(200)
    expect(createRes.json.success).toBe(true)
    expect(createRes.json.data).toMatchObject({ type: 'breakfast' })

    const id = createRes.json.data.id as string

    const listRes = await http('/api/meals/today')
    expect(listRes.status).toBe(200)
    expect(listRes.json.success).toBe(true)
    expect(Array.isArray(listRes.json.data)).toBe(true)

    const delRes = await http(`/api/meals/${id}`, { method: 'DELETE' })
    expect(delRes.status).toBe(200)
    expect(delRes.json.success).toBe(true)
  })

  test('ai analyze without key returns api error', async () => {
    const oldKey = process.env.DOUBAO_API_KEY
    delete process.env.DOUBAO_API_KEY
    try {
      const res = await http('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: 'data:image/png;base64,AA==', currentState: '测试' }),
      })
      expect([400, 500]).toContain(res.status)
      expect(res.json).toMatchObject({ success: false })
    } finally {
      if (oldKey !== undefined) process.env.DOUBAO_API_KEY = oldKey
    }
  })
})
