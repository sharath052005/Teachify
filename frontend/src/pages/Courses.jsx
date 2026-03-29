import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import CourseCard from '../components/CourseCard'
import { getCoursesAPI } from '../api/courses'
import { DUMMY_COURSES, CATEGORIES } from '../data/dummy'
import '../styles/courses.css'

const LEVELS    = ['Beginner', 'Intermediate', 'Advanced', 'All Levels']
const SORT_OPTS = [
  { value: 'newest',  label: 'Newest' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
]

export default function Courses() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [liveCourses, setLive]          = useState([])
  const [loading, setLoading]           = useState(true)
  const [filters, setFilters]           = useState({
    category: searchParams.get('category') || '',
    level: '',
    price: 'all',
  })
  const [sort, setSort]   = useState('newest')
  const [search, setSearch] = useState(searchParams.get('q') || '')

  useEffect(() => {
    setLoading(true)
    const params = {}
    if (search)           params.q        = search
    if (filters.category) params.category = filters.category
    if (filters.level)    params.level    = filters.level

    getCoursesAPI(params)
      .then(data => setLive(data.courses || []))
      .catch(() => setLive([]))
      .finally(() => setLoading(false))
  }, [search, filters])

  // Merge live + dummy (filter out duplicate ids)
  const liveIds = new Set(liveCourses.map(c => String(c.id)))
  const merged  = [
    ...liveCourses,
    ...DUMMY_COURSES.filter(d => !liveIds.has(String(d.id)))
  ]

  const filtered = merged.filter(c => {
    if (filters.level && c.level !== filters.level) return false
    if (filters.price === 'free' && c.price > 0) return false
    if (filters.price === 'paid' && c.price === 0) return false
    return true
  })

  return (
    <div className="courses-page page-enter">

      {/* Header */}
      <div className="courses-topbar">
        <div className="container courses-topbar__inner">
          <div>
            <h1>
              {filters.category || (search ? `Results for "${search}"` : 'All Courses')}
              <span className="courses-count">{filtered.length} courses</span>
            </h1>
          </div>
          <div className="courses-topbar__controls">
            <select
              className="courses-select"
              value={sort}
              onChange={e => setSort(e.target.value)}
            >
              {SORT_OPTS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="container courses-layout">

        {/* Sidebar */}
        <aside className="courses-sidebar">
          <div className="courses-sidebar__header">
            <h3>Filters</h3>
            <button
              className="courses-clear"
              onClick={() => setFilters({ category: '', level: '', price: 'all' })}
            >
              Clear
            </button>
          </div>

          {/* Category */}
          <div className="filter-section">
            <h4>Category</h4>
            <div className="filter-list">
              <label className="filter-radio">
                <input
                  type="radio"
                  name="cat"
                  checked={filters.category === ''}
                  onChange={() => setFilters(f => ({ ...f, category: '' }))}
                />
                <span className="filter-radio__dot" />
                All Categories
              </label>
              {CATEGORIES.map(c => (
                <label key={c.name} className="filter-radio">
                  <input
                    type="radio"
                    name="cat"
                    checked={filters.category === c.name}
                    onChange={() => setFilters(f => ({ ...f, category: c.name }))}
                  />
                  <span className="filter-radio__dot" />
                  {c.icon} {c.name}
                </label>
              ))}
            </div>
          </div>

          {/* Level */}
          <div className="filter-section">
            <h4>Level</h4>
            <div className="filter-list">
              <label className="filter-radio">
                <input
                  type="radio"
                  name="level"
                  checked={filters.level === ''}
                  onChange={() => setFilters(f => ({ ...f, level: '' }))}
                />
                <span className="filter-radio__dot" />
                All Levels
              </label>
              {LEVELS.map(l => (
                <label key={l} className="filter-radio">
                  <input
                    type="radio"
                    name="level"
                    checked={filters.level === l}
                    onChange={() => setFilters(f => ({ ...f, level: l }))}
                  />
                  <span className="filter-radio__dot" />
                  {l}
                </label>
              ))}
            </div>
          </div>

          {/* Price */}
          <div className="filter-section">
            <h4>Price</h4>
            <div className="filter-list">
              {[
                { val: 'all', label: 'All Prices' },
                { val: 'free', label: 'Free' },
                { val: 'paid', label: 'Paid' },
              ].map(p => (
                <label key={p.val} className="filter-radio">
                  <input
                    type="radio"
                    name="price"
                    checked={filters.price === p.val}
                    onChange={() => setFilters(f => ({ ...f, price: p.val }))}
                  />
                  <span className="filter-radio__dot" />
                  {p.label}
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* Main */}
        <div className="courses-main">
          {loading ? (
            <div className="courses-loading">
              <div className="spinner" />
              <p>Loading courses...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="courses-empty">
              <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🔍</div>
              <h3>No courses found</h3>
              <p>Try adjusting your filters</p>
              <button
                className="btn btn-primary"
                onClick={() => setFilters({ category: '', level: '', price: 'all' })}
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="courses-grid-main">
              {filtered.map(course => (
                <CourseCard key={course.id} course={course} size="md" />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}