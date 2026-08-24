import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Network,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Search,
  BookOpen,
  Sparkles,
} from 'lucide-react'
import { useBook } from '../context/BookContext'
import { useTranslation } from '../lib/i18n'
import { Button } from '../components/ui/Button'
import { Sheet } from '../components/ui/Sheet'

interface NodeItem {
  id: string
  title: string
  category: string
  clusterIndex: number
  x: number
  y: number
  color: string
  chapterId: string
  summary: string
}

const CATEGORY_COLORS = [
  '#D97706', // amber
  '#059669', // emerald
  '#2563EB', // blue
  '#7C3AED', // purple
  '#DC2626', // red
  '#0891B2', // cyan
]

export default function MindmapPage() {
  const { isRtl, formatDigits } = useTranslation()
  const { index } = useBook()
  const navigate = useNavigate()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [zoom, setZoom] = useState(1)
  const [activeNode, setActiveNode] = useState<NodeItem | null>(null)
  const [activeDetailOpen, setActiveDetailOpen] = useState(false)

  // Generate Graph Nodes from index chapters
  const { nodes, categories } = useMemo(() => {
    if (!index || index.chapters.length === 0) return { nodes: [], categories: [] }

    const catsSet = new Set<string>()
    index.chapters.forEach((ch) => {
      ch.tags.forEach((t) => catsSet.add(t))
    })
    const cats = Array.from(catsSet).slice(0, 6)
    if (cats.length === 0) cats.push('الخصال والفضائل')

    const calculatedNodes: NodeItem[] = []
    const totalChapters = index.chapters.length
    const radius = 340
    const centerX = 500
    const centerY = 450

    index.chapters.forEach((ch, idx) => {
      const angle = (idx / totalChapters) * 2 * Math.PI - Math.PI / 2
      // Radial distribution with slight cluster jitter
      const catIdx = Math.max(0, cats.indexOf(ch.tags[0] || ''))
      const r = radius + (catIdx % 2 === 0 ? 30 : -30) + ((idx % 3) * 15)
      const x = centerX + r * Math.cos(angle)
      const y = centerY + r * Math.sin(angle)
      const color = CATEGORY_COLORS[catIdx % CATEGORY_COLORS.length]
      const firstBlock = ch.blocks.find((b) => (b.text?.length ?? 0) > 20) || ch.blocks[0]

      calculatedNodes.push({
        id: ch.id,
        title: ch.title,
        category: ch.tags[0] || cats[0],
        clusterIndex: catIdx,
        x,
        y,
        color,
        chapterId: ch.id,
        summary: firstBlock?.text || '',
      })
    })

    return { nodes: calculatedNodes, categories: cats }
  }, [index])

  const filteredNodes = useMemo(() => {
    return nodes.filter((n) => {
      const matchCat = selectedCategory === 'all' || n.category === selectedCategory
      const matchSearch = !searchQuery || n.title.includes(searchQuery) || n.summary.includes(searchQuery)
      return matchCat && matchSearch
    })
  }, [nodes, selectedCategory, searchQuery])

  const handleNodeClick = (node: NodeItem) => {
    setActiveNode(node)
    setActiveDetailOpen(true)
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-20">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400">
              <Network size={22} />
            </span>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-app-text">
              {isRtl ? 'شبكة العلاقات وخريطة الخصال' : 'Interactive Mind Map & Virtue Network'}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-app-text-secondary">
            {isRtl
              ? 'استكشف الترابط المعرفي بين الفضائل والحِكَم في خريطة بصرية تفاعلية.'
              : 'Explore the interconnected web of virtues and wisdom in a visual dynamic graph.'}
          </p>
        </div>

        {/* Zoom & Reset Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoom((z) => Math.min(1.8, z + 0.15))}
            className="p-2.5 rounded-xl border border-app-border bg-app-surface text-app-text hover:text-app-accent hover:border-app-accent transition-all shadow-xs"
            title={isRtl ? 'تكبير' : 'Zoom In'}
          >
            <ZoomIn size={16} />
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(0.6, z - 0.15))}
            className="p-2.5 rounded-xl border border-app-border bg-app-surface text-app-text hover:text-app-accent hover:border-app-accent transition-all shadow-xs"
            title={isRtl ? 'تصغير' : 'Zoom Out'}
          >
            <ZoomOut size={16} />
          </button>
          <button
            onClick={() => setZoom(1)}
            className="p-2.5 rounded-xl border border-app-border bg-app-surface text-app-text hover:text-app-accent hover:border-app-accent transition-all shadow-xs"
            title={isRtl ? 'إعادة ضبط' : 'Reset View'}
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 mb-6">
        <div className="relative flex-1 w-full">
          <Search size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-app-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isRtl ? 'ابحث عن خصلة أو كلمة في الخريطة...' : 'Search traits in mind map...'}
            className="w-full pl-4 pr-10 py-2.5 rounded-2xl border border-app-border bg-app-surface text-app-text text-sm focus:border-app-accent outline-none shadow-xs"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap border transition-all ${
              selectedCategory === 'all'
                ? 'bg-app-accent text-white border-app-accent shadow-xs'
                : 'bg-app-surface border-app-border text-app-muted hover:text-app-text'
            }`}
          >
            {isRtl ? 'الكل' : 'All'} ({formatDigits(nodes.length)})
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap border transition-all ${
                selectedCategory === cat
                  ? 'bg-app-accent text-white border-app-accent shadow-xs'
                  : 'bg-app-surface border-app-border text-app-muted hover:text-app-text'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive SVG Canvas */}
      <div className="relative w-full h-[58vh] sm:h-[65vh] min-h-90 max-h-155 rounded-3xl bg-app-surface/90 border border-app-border/80 shadow-md overflow-hidden flex items-center justify-center touch-manipulation">
        {/* Center Root Core Indicator */}
        <div className="absolute z-10 pointer-events-none text-center">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-linear-to-tr from-app-accent to-amber-500/80 text-white flex flex-col items-center justify-center p-2 shadow-2xl border-4 border-app-surface">
            <Sparkles size={18} className="mb-0.5" />
            <span className="font-display font-bold text-[11px] sm:text-xs text-center leading-tight">
              {index?.book.shortTitle || 'جامع الخصال'}
            </span>
          </div>
        </div>

        <motion.svg
          animate={{ scale: zoom }}
          transition={{ type: 'spring', stiffness: 200, damping: 30 }}
          className="w-full h-full cursor-grab active:cursor-grabbing touch-none"
          viewBox="0 0 1000 900"
        >
          {/* Connection Lines from Center to Nodes */}
          {filteredNodes.map((n) => (
            <line
              key={`line-${n.id}`}
              x1={500}
              y1={450}
              x2={n.x}
              y2={n.y}
              stroke={n.color}
              strokeOpacity={0.25}
              strokeWidth={1.2}
              strokeDasharray="4 3"
            />
          ))}

          {/* Nodes */}
          {filteredNodes.map((node) => (
            <g
              key={node.id}
              onClick={() => handleNodeClick(node)}
              className="cursor-pointer group"
              transform={`translate(${node.x}, ${node.y})`}
            >
              <circle
                r={16}
                fill={node.color}
                fillOpacity={0.85}
                stroke="#ffffff"
                strokeWidth={2}
                className="group-hover:scale-130 transition-transform duration-200"
              />
              <text
                dy={30}
                textAnchor="middle"
                className="text-[10px] font-bold fill-app-text select-none group-hover:fill-app-accent group-hover:font-extrabold"
              >
                {node.title.length > 18 ? node.title.slice(0, 16) + '…' : node.title}
              </text>
            </g>
          ))}
        </motion.svg>
      </div>

      {/* Node Detail Sheet */}
      <Sheet
        open={activeDetailOpen}
        onOpenChange={setActiveDetailOpen}
        title={activeNode?.title || (isRtl ? 'تفاصيل الخصلة' : 'Virtue Detail')}
        className="max-w-md mx-auto"
      >
        {activeNode && (
          <div className="space-y-4 pt-2">
            <div className="p-4 rounded-2xl bg-app-surface border border-app-border">
              <span
                className="inline-block text-xs font-bold px-2.5 py-0.5 rounded-full text-white mb-2"
                style={{ backgroundColor: activeNode.color }}
              >
                {activeNode.category}
              </span>
              <h3 className="font-display text-xl font-bold text-app-text mb-2">
                {activeNode.title}
              </h3>
              <p className="text-sm text-app-text-secondary leading-relaxed font-serif">
                {activeNode.summary}
              </p>
            </div>

            <Button
              className="w-full justify-center gap-1.5"
              onClick={() => {
                setActiveDetailOpen(false)
                navigate(`/book/${index?.book.id || 'imtaa-al-qari-vol-1'}/read?c=${activeNode.chapterId}`)
              }}
            >
              <BookOpen size={16} />
              {isRtl ? 'فتح وقراءة هذا الفصل في الكتاب' : 'Read Chapter in Book'}
            </Button>
          </div>
        )}
      </Sheet>
    </div>
  )
}
