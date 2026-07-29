import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { createDraft, publishStory } from '../services/postService'

const GENRES = ['Thriller', 'Romance', 'Fantasy', 'Poetry', 'Horror', 'Mystery', 'Fiction']

export default function Editor() {
  const navigate = useNavigate()
  const contentRef = useRef(null)

  const [postType, setPostType] = useState('story') // 'story' | 'poem'
  const [title, setTitle] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [genre, setGenre] = useState(GENRES[0])
  const [coverImage, setCoverImage] = useState(null)
  const [hasChapters, setHasChapters] = useState(false)
  const [chapterTitle, setChapterTitle] = useState('')
  const [content, setContent] = useState('')

  // ---- New feature state ----
  const [tags, setTags] = useState([])
  const [tagInput, setTagInput] = useState('')
  const [ageRating, setAgeRating] = useState('Everyone') // 'Everyone' | 'Mature (18+)'
  const [previewMode, setPreviewMode] = useState(false)
  const [scheduleDate, setScheduleDate] = useState('')
  const [autoSaveStatus, setAutoSaveStatus] = useState('')
  const [wordCount, setWordCount] = useState(0)
  const [charCount, setCharCount] = useState(0)
  const [saving, setSaving] = useState(false)

  // ---- Rich text formatting ----
  function format(command) {
    document.execCommand(command, false, null)
    contentRef.current?.focus()
  }

  function handleContentInput() {
    const html = contentRef.current.innerHTML
    const text = contentRef.current.innerText || ''
    setContent(html)
    setWordCount(text.trim() ? text.trim().split(/\s+/).length : 0)
    setCharCount(text.length)
  }

  // ---- Tags ----
  function handleTagKeyDown(e) {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault()
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim().replace(/^#/, '')])
      }
      setTagInput('')
    }
  }
  function removeTag(tag) {
    setTags(tags.filter((t) => t !== tag))
  }

  // ---- Auto-save draft every 30 seconds ----
  const buildStoryPayload = useCallback(() => ({
    title,
    subtitle,
    genre,
    content,
    coverImage,
    tags,
    ageRating,
  }), [title, subtitle, genre, content, coverImage, tags, ageRating])

  useEffect(() => {
    const interval = setInterval(async () => {
      if (!title.trim() && !content.trim()) return
      try {
        await createDraft(buildStoryPayload(), postType, hasChapters)
        setAutoSaveStatus(`Draft saved at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`)
      } catch {
        setAutoSaveStatus('Auto-save failed — check your connection')
      }
    }, 30000)
    return () => clearInterval(interval)
  }, [buildStoryPayload, postType, hasChapters, title, content])

  async function handleSaveDraft() {
    setSaving(true)
    try {
      await createDraft(buildStoryPayload(), postType, hasChapters)
      setAutoSaveStatus(`Draft saved at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`)
    } finally {
      setSaving(false)
    }
  }

  async function handlePublish() {
    setSaving(true)
    try {
      await publishStory(buildStoryPayload(), postType, hasChapters)
      navigate('/dashboard')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ background: 'var(--color-cream)', minHeight: '100vh', padding: '48px 24px' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>

        <h1 style={{ fontSize: '28px', marginBottom: '4px' }}>✍️ Write</h1>
        {autoSaveStatus && (
          <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '20px' }}>
            {autoSaveStatus}
          </p>
        )}

        {/* Story / Poem toggle */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '28px' }}>
          {['story', 'poem'].map((type) => (
            <button
              key={type}
              onClick={() => setPostType(type)}
              style={{
                padding: '8px 22px',
                borderRadius: '999px',
                border: `1px solid ${postType === type ? 'var(--color-rose)' : 'var(--color-border)'}`,
                background: postType === type ? 'var(--color-rose)' : 'var(--color-white)',
                color: postType === type ? 'var(--color-white)' : 'var(--color-text)',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
                textTransform: 'capitalize'
              }}
            >
              {type}
            </button>
          ))}
        </div>

        {!previewMode ? (
          <>
            {/* Title */}
            <label style={fieldLabel}>Title</label>
            <input
              className="input-field"
              placeholder="Enter your story title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{ marginBottom: '20px' }}
            />

            {/* Subtitle */}
            <label style={fieldLabel}>Subtitle</label>
            <input
              className="input-field"
              placeholder="Add a short description..."
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              style={{ marginBottom: '20px' }}
            />

            {/* Genre */}
            <label style={fieldLabel}>Genre</label>
            <select
              className="input-field"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              style={{ marginBottom: '20px' }}
            >
              {GENRES.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>

            {/* Age rating */}
            <label style={fieldLabel}>Audience</label>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              {['Everyone', 'Mature (18+)'].map((rating) => (
                <button
                  key={rating}
                  onClick={() => setAgeRating(rating)}
                  style={{
                    padding: '8px 18px',
                    borderRadius: 'var(--radius-md)',
                    border: `1px solid ${ageRating === rating ? 'var(--color-rose)' : 'var(--color-border)'}`,
                    background: ageRating === rating ? 'var(--color-rose-light)' : 'var(--color-white)',
                    color: 'var(--color-text)',
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  {rating}
                </button>
              ))}
            </div>

            {/* Tags */}
            <label style={fieldLabel}>Tags & Keywords</label>
            <div className="input-field" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', marginBottom: '20px' }}>
              {tags.map((tag) => (
                <span key={tag} style={{
                  background: 'var(--color-rose-light)', color: 'var(--color-mauve)',
                  padding: '4px 10px', borderRadius: '999px', fontSize: '12px',
                  display: 'flex', alignItems: 'center', gap: '6px'
                }}>
                  #{tag}
                  <span onClick={() => removeTag(tag)} style={{ cursor: 'pointer', fontWeight: 700 }}>×</span>
                </span>
              ))}
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder="Type a tag and press Enter (e.g. dark-romance)"
                style={{ border: 'none', outline: 'none', flex: 1, minWidth: '160px', fontSize: '13px', fontFamily: 'var(--font-body)' }}
              />
            </div>

            {/* Cover image */}
            <label style={fieldLabel}>Cover Image</label>
            <div style={{ marginBottom: '24px' }}>
              <input
                type="file"
                accept="image/*"
                id="cover-upload"
                style={{ display: 'none' }}
                onChange={(e) => setCoverImage(e.target.files[0])}
              />
              <label htmlFor="cover-upload" className="btn-outline" style={{ display: 'inline-block' }}>
                {coverImage ? coverImage.name : 'Upload Cover Image'}
              </label>
            </div>

            {/* Chapters toggle */}
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', fontSize: '14px' }}>
              <input type="checkbox" checked={hasChapters} onChange={(e) => setHasChapters(e.target.checked)} />
              Divide into chapters
            </label>

            {hasChapters && (
              <>
                <label style={fieldLabel}>Chapter Title</label>
                <input
                  className="input-field"
                  placeholder="Enter your chapter title..."
                  value={chapterTitle}
                  onChange={(e) => setChapterTitle(e.target.value)}
                  style={{ marginBottom: '20px' }}
                />
              </>
            )}

            {/* Rich text toolbar */}
            <label style={fieldLabel}>Content</label>
            <div style={{
              display: 'flex', gap: '4px', border: '1px solid var(--color-border)',
              borderBottom: 'none', borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
              padding: '8px', background: 'var(--color-white)'
            }}>
              <ToolbarButton onClick={() => format('bold')} label="B" bold />
              <ToolbarButton onClick={() => format('italic')} label="I" italic />
              <ToolbarButton onClick={() => format('underline')} label="U" underline />
              <ToolbarButton onClick={() => format('formatBlock', 'blockquote')} label="❝" />
              <ToolbarButton onClick={() => format('insertUnorderedList')} label="• List" />
              <ToolbarButton onClick={() => format('justifyLeft')} label="⯇" />
              <ToolbarButton onClick={() => format('justifyCenter')} label="≡" />
              <ToolbarButton onClick={() => format('justifyRight')} label="⯈" />
            </div>
            <div
              ref={contentRef}
              contentEditable
              onInput={handleContentInput}
              suppressContentEditableWarning
              style={{
                minHeight: '260px',
                padding: '16px',
                border: '1px solid var(--color-border)',
                borderRadius: '0 0 var(--radius-md) var(--radius-md)',
                background: 'var(--color-white)',
                fontSize: '15px',
                lineHeight: 1.7,
                fontFamily: 'var(--font-body)'
              }}
              data-placeholder="Start writing..."
            />
            <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: '8px 0 28px' }}>
              {wordCount} words · {charCount} characters
            </p>

            {/* Schedule publish */}
            <label style={fieldLabel}>Schedule Publication (optional)</label>
            <input
              type="datetime-local"
              className="input-field"
              value={scheduleDate}
              onChange={(e) => setScheduleDate(e.target.value)}
              style={{ marginBottom: '28px' }}
            />
          </>
        ) : (
          // ---- Preview mode ----
          <div style={{ background: 'var(--color-white)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-card)', padding: '32px', marginBottom: '28px' }}>
            {coverImage && (
              <img
                src={URL.createObjectURL(coverImage)}
                alt="cover"
                style={{ width: '100%', maxHeight: '280px', objectFit: 'cover', borderRadius: 'var(--radius-md)', marginBottom: '20px' }}
              />
            )}
            <p style={{ fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--color-mauve)' }}>{genre} · {ageRating}</p>
            <h1 style={{ fontSize: '30px', margin: '6px 0' }}>{title || 'Untitled Story'}</h1>
            {subtitle && <p style={{ color: 'var(--color-text-muted)', fontStyle: 'italic', marginBottom: '16px' }}>{subtitle}</p>}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
              {tags.map((tag) => (
                <span key={tag} style={{ background: 'var(--color-rose-light)', color: 'var(--color-mauve)', padding: '3px 10px', borderRadius: '999px', fontSize: '11px' }}>#{tag}</span>
              ))}
            </div>
            <div style={{ lineHeight: 1.8, fontSize: '15px' }} dangerouslySetInnerHTML={{ __html: content || '<p style="color:#999">Nothing written yet...</p>' }} />
          </div>
        )}

        {/* Action buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button className="btn-outline" onClick={() => setPreviewMode(!previewMode)}>
            {previewMode ? '← Back to Editor' : '👁 Preview'}
          </button>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={handleSaveDraft}
              disabled={saving}
              style={{
                background: 'var(--color-rose-light)', color: 'var(--color-mauve)', border: 'none',
                padding: '12px 24px', borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: '13px', cursor: 'pointer'
              }}
            >
              Save Draft
            </button>
            <button className="btn-primary" onClick={handlePublish} disabled={saving}>
              {scheduleDate ? 'Schedule Publish' : 'Publish'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ToolbarButton({ onClick, label, bold, italic, underline }) {
  return (
    <button
      onClick={onClick}
      type="button"
      style={{
        border: '1px solid var(--color-border)',
        background: 'var(--color-cream)',
        borderRadius: '4px',
        padding: '6px 10px',
        fontSize: '13px',
        cursor: 'pointer',
        fontWeight: bold ? 700 : 500,
        fontStyle: italic ? 'italic' : 'normal',
        textDecoration: underline ? 'underline' : 'none',
        color: 'var(--color-text)'
      }}
    >
      {label}
    </button>
  )
}

const fieldLabel = {
  display: 'block',
  fontSize: '13px',
  fontWeight: 600,
  color: 'var(--color-text)',
  marginBottom: '6px'
}
