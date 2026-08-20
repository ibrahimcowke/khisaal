import { describe, it, expect } from 'vitest'
import { groupChapterIntoTopics } from './usePagination'
import type { Chapter } from '../../lib/types'

describe('groupChapterIntoTopics', () => {
  it('groups blocks cleanly by khislah/topic without breaking any topic', () => {
    const chapter: Chapter = {
      id: 'chap-1',
      title: 'منظومة الثنائيات',
      order: 1,
      sourcePageStart: 1,
      sourcePageEnd: 5,
      pageIds: ['p1', 'p2'],
      wordCount: 100,
      tags: [],
      blocks: [
        { id: 'b1', type: 'heading', text: 'أولاً: منظومة الثنائيات', sourcePage: 1, pageId: 'p1' },
        { id: 'b2', type: 'paragraph', text: '1. الحرص الذي لا ينقضي:', sourcePage: 1, pageId: 'p1' },
        { id: 'b3', type: 'callout', text: 'شرح الحرص والتطلع المستمر...', sourcePage: 1, pageId: 'p1' },
        { id: 'b4', type: 'list', items: ['طالب علم', 'طالب دنيا'], sourcePage: 1, pageId: 'p1' },
        { id: 'b5', type: 'divider', sourcePage: 2, pageId: 'p2' },
        { id: 'b6', type: 'paragraph', text: '2. صفات التنافي الإيماني:', sourcePage: 2, pageId: 'p2' },
        { id: 'b7', type: 'callout', text: 'شرح التنافي...', sourcePage: 2, pageId: 'p2' },
        { id: 'b8', type: 'list', items: ['البخل', 'سوء الخلق'], sourcePage: 2, pageId: 'p2' },
      ],
    }

    const topics = groupChapterIntoTopics(chapter)
    expect(topics).toHaveLength(3)

    // Topic 1: Heading
    expect(topics[0].blocks[0].id).toBe('b1')

    // Topic 2: First Khislah (stays completely intact)
    expect(topics[1].blocks.map((b) => b.id)).toEqual(['b2', 'b3', 'b4', 'b5'])

    // Topic 3: Second Khislah (stays completely intact)
    expect(topics[2].blocks.map((b) => b.id)).toEqual(['b6', 'b7', 'b8'])
  })

  it('returns empty array when chapter is empty or null', () => {
    expect(groupChapterIntoTopics(null)).toEqual([])
    expect(
      groupChapterIntoTopics({
        id: 'c0',
        title: '',
        order: 1,
        sourcePageStart: 1,
        sourcePageEnd: 1,
        pageIds: [],
        wordCount: 0,
        tags: [],
        blocks: [],
      })
    ).toEqual([])
  })
})
