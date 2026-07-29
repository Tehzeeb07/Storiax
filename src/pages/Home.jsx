import "../styles/theme.css";
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getPublishedStories } from '../services/postService'
import { useAuth } from '../contexts/AuthContext'

const GENRES = ['Romance', 'Fantasy', 'Poetry', 'Horror', 'Mystery', 'Fiction']

export default function Home() {
  const [stories, setStories] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    async function fetchStories() {
      const { data, error } = await getPublishedStories()
      if (!error && data) setStories(data)
      setLoading(false)
    }
    fetchStories()
  }, [])

  function handleSearch(e) {
    e.preventDefault()
    navigate(`/explore?search=${encodeURIComponent(searchTerm)}`)
  }

  return (
    <div style={{ background: 'var(--color-cream)', overflow: 'hidden' }}>

      {/* ============ SECTION 1 — HERO ("Come for the story...") ============ */}
      <section style={{
        background: 'var(--color-rose-light)',
        padding: '90px 24px',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '48px',
        position: 'relative'
      }}>
        <div style={{ flex: '1 1 380px', minWidth: '300px', zIndex: 2 }}>
          <h1 style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 800,
            fontSize: '54px',
            lineHeight: 1.05,
            margin: '0 0 22px',
            color: 'var(--color-text)'
          }}>
            Come for the story.<br />Stay for the connection.
          </h1>
          <p style={{
            fontSize: '16px',
            color: 'var(--color-text-muted)',
            marginBottom: '30px',
            maxWidth: '420px',
            lineHeight: 1.6
          }}>
            Stories worth staying up for, and comments sections better than your group chat.
          </p>

          {!user ? (
            <>
              <button
                onClick={() => navigate('/register')}
                style={{
                  background: 'var(--color-text)',
                  color: 'var(--color-white)',
                  border: 'none',
                  padding: '14px 32px',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 600,
                  fontSize: '15px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
              >
                Get Started
              </button>
              <p style={{ marginTop: '14px', fontSize: '13px', color: 'var(--color-text-muted)' }}>
                Already have an account?{' '}
                <Link to="/login" style={{ color: 'var(--color-text)', fontWeight: 600 }}>Log in</Link>
              </p>
            </>
          ) : (
            <button className="btn-primary" onClick={() => navigate('/explore')}>
              Continue Exploring
            </button>
          )}
        </div>

        {/* Floating covers + comment bubbles with decorative illustration card */}
        <div style={{ flex: '1 1 340px', minWidth: '300px', position: 'relative', height: '380px' }}>
          <div style={{
            position: 'absolute', top: 10, right: 30, width: '180px', height: '340px',
            borderRadius: '40px', background: 'linear-gradient(135deg, #ffd1b3 0%, #ffb380 100%)', opacity: 0.5,
            boxShadow: '0 20px 40px rgba(0,0,0,0.05)'
          }} />

          {stories[0] && (
            <FloatingCover
              story={stories[0]}
              onClick={() => navigate(`/story/${stories[0].id}`)}
              style={{ position: 'absolute', top: 30, right: 50, width: '150px', height: '210px', zIndex: 2 }}
            />
          )}

          {/* Decorative Community Avatar Badge overlay */}
          <div style={{
            position: 'absolute', top: 180, right: 180, background: 'white', padding: '10px 14px',
            borderRadius: '20px', boxShadow: 'var(--shadow-card)', zIndex: 4, display: 'flex', alignItems: 'center', gap: '8px'
          }}>
            <span style={{ fontSize: '16px' }}>📚</span>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text)' }}>+10M Readers</span>
          </div>

          <CommentBubble
            author="@readerone"
            text="from banter to BREAKUP in two paragraphs? 😭"
            likes={95}
            style={{ position: 'absolute', top: 40, left: 0, width: '230px', zIndex: 3 }}
          />
          <CommentBubble
            author="@bookworm_22"
            text="what in the Storiax?! (i love it) ✨"
            likes={113}
            style={{ position: 'absolute', bottom: 10, left: 20, width: '230px', zIndex: 3 }}
          />
        </div>
      </section>

      {/* ============ SECTION 2 — TRENDING NOW ============ */}
      <section style={{ padding: '64px 24px', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
          <h2 style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 800,
            fontSize: '30px',
            margin: 0,
            color: 'var(--color-text)'
          }}>
            Trending Now 🔥
          </h2>
          <Link to="/explore" style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-rose)', textDecoration: 'none' }}>
            View all →
          </Link>
        </div>

        {loading ? (
          <p style={{ color: 'var(--color-text-muted)' }}>Loading stories...</p>
        ) : stories.length === 0 ? (
          <p style={{ color: 'var(--color-text-muted)' }}>No stories published yet — be the first to write one!</p>
        ) : (
          <div style={{ display: 'flex', gap: '18px', overflowX: 'auto', paddingBottom: '12px', scrollbarWidth: 'thin' }}>
            {stories.slice(0, 8).map((story, index) => (
              <StoryStripCard
                key={story.id}
                story={story}
                index={index + 1}
                onClick={() => navigate(`/story/${story.id}`)}
              />
            ))}
          </div>
        )}
      </section>

      {/* ============ SECTION 3 — "Must-read" purple band ============ */}
      <section style={{
        background: '#DCDCF7',
        padding: '64px 24px',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '32px'
      }}>
        <div style={{ flex: '0 0 260px' }}>
          <h2 style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 800,
            fontSize: '30px',
            color: 'var(--color-text)',
            margin: '0 0 8px'
          }}>
            Must-read Stories 💜
          </h2>
          <p style={{ fontSize: '13px', color: '#4A4558', margin: 0 }}>Handpicked community favorites you won't put down.</p>
        </div>

        <div style={{ display: 'flex', gap: '14px', overflowX: 'auto', flex: '1 1 400px', paddingBottom: '8px' }}>
          {stories.slice(2, 9).map(story => (
            <div
              key={story.id}
              onClick={() => navigate(`/story/${story.id}`)}
              style={{
                flex: '0 0 auto', width: '110px', height: '150px', borderRadius: 'var(--radius-md)',
                overflow: 'hidden', cursor: 'pointer', boxShadow: 'var(--shadow-card)', position: 'relative',
                transition: 'transform 0.2s ease'
              }}
            >
              <img
                src={story.cover_image || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=300'}
                alt={story.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          ))}
        </div>
      </section>

      {/* ============ SECTION 4 — "All the genres" search band ============ */}
      <section style={{
        background: '#F2F2F2',
        padding: '80px 24px',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '40px'
      }}>
        <div style={{ flex: '1 1 380px', minWidth: '300px' }}>
          <h2 style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 800,
            fontSize: '38px',
            margin: '0 0 16px',
            color: 'var(--color-text)',
            lineHeight: 1.15
          }}>
            All the genres.<br />All the moods. All you.
          </h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '15px', marginBottom: '26px' }}>
            Find your next favorite read, no matter your mood or vibe.
          </p>

          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title or genre..."
              style={{
                flex: 1,
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                fontSize: '14px',
                background: 'white'
              }}
            />
            <button type="submit" className="btn-primary">Search</button>
          </form>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {GENRES.map(genre => (
              <button
                key={genre}
                onClick={() => navigate(`/explore?category=${genre}`)}
                style={{
                  background: 'var(--color-white)',
                  border: '1px solid var(--color-border)',
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '13px',
                  cursor: 'pointer',
                  color: 'var(--color-text)',
                  fontWeight: 500,
                  transition: 'background 0.2s'
                }}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>

        {/* Visual Graphic Banner side element */}
        <div style={{
          flex: '1 1 260px',
          minWidth: '220px',
          height: '280px',
          borderRadius: 'var(--radius-lg)',
          background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '20px',
          textAlign: 'center',
          boxShadow: 'var(--shadow-card)'
        }}>
          <span style={{ fontSize: '48px', marginBottom: '12px' }}>✨</span>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '20px', color: '#1e1e1e', margin: '0 0 8px' }}>Explore Unlimited Worlds</h3>
          <p style={{ fontSize: '13px', color: '#666', margin: 0 }}>Discover hidden gems written by passionate creators worldwide.</p>
        </div>
      </section>

      {/* ============ SECTION 5 — "Your book club, but bigger" ============ */}
      <section style={{
        padding: '80px 24px',
        maxWidth: '1100px',
        margin: '0 auto',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '48px'
      }}>
        <div style={{ flex: '1 1 340px', minWidth: '280px', position: 'relative', height: '260px' }}>
          <div style={{
            position: 'absolute', top: 0, left: 0, width: '220px', height: '220px',
            borderRadius: 'var(--radius-lg)', background: 'var(--color-rose-light)'
          }} />
          <CommentBubble
            author="@auqu33n"
            text="we're all collectively losing our minds over this chapter right? 😭"
            likes={105}
            style={{ position: 'absolute', top: 10, left: 20, width: '250px', zIndex: 2 }}
          />
          <CommentBubble
            author="@slowburn_stan"
            text="someone pass the popcorn 🍿"
            likes={98}
            style={{ position: 'absolute', bottom: 0, left: 70, width: '230px', zIndex: 3 }}
          />
        </div>

        <div style={{ flex: '1 1 340px', minWidth: '280px' }}>
          <h2 style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 800,
            fontSize: '34px',
            margin: '0 0 16px',
            color: 'var(--color-text)'
          }}>
            Your book club, but bigger
          </h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '15px', lineHeight: 1.7 }}>
            Read, react, and connect with writers and readers who live for the same stories you do. Drop inline comments right where the plot twists happen!
          </p>
        </div>
      </section>

      {/* ============ SECTION 6 — "Where stories become favorites" (peach, floating covers) ============ */}
      <section style={{
        background: 'var(--color-rose-light)',
        padding: '80px 24px',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '48px'
      }}>
        <div style={{ flex: '1 1 360px', minWidth: '300px' }}>
          <h2 style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 800,
            fontSize: '42px',
            lineHeight: 1.1,
            margin: '0 0 18px',
            color: 'var(--color-text)'
          }}>
            Where stories<br />become favorites.
          </h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '15px', maxWidth: '380px', lineHeight: 1.6 }}>
            Start writing where creators grow together, and stories find their readers. Publish your chapters and build your own dedicated fanbase.
          </p>
        </div>

        <div style={{ flex: '1 1 320px', minWidth: '280px', position: 'relative', height: '320px' }}>
          {stories[1] && (
            <FloatingCover
              story={stories[1]}
              onClick={() => navigate(`/story/${stories[1].id}`)}
              style={{ position: 'absolute', top: 0, right: 0, width: '160px', height: '230px', zIndex: 2 }}
            />
          )}
          {stories[2] && (
            <FloatingCover
              story={stories[2]}
              onClick={() => navigate(`/story/${stories[2].id}`)}
              style={{ position: 'absolute', top: 70, right: 130, width: '140px', height: '200px', zIndex: 1 }}
            />
          )}
        </div>
      </section>

      {/* ============ SECTION 7 — SIGN UP CTA ============ */}
      {!user && (
        <section style={{
          padding: '80px 24px',
          textAlign: 'center',
          background: 'var(--color-cream)'
        }}>
          <h2 style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 800,
            fontSize: '34px',
            marginBottom: '12px',
            color: 'var(--color-text)'
          }}>
            Your next favorite story starts here
          </h2>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '26px' }}>
            Join Storiax — carry your favorite stories and community with you.
          </p>
          <button className="btn-primary" onClick={() => navigate('/register')} style={{ padding: '14px 36px', fontSize: '16px' }}>
            Join Storiax Free
          </button>
        </section>
      )}

      {/* ============ SECTION 8 — FOOTER ============ */}
      <footer style={{ background: '#1E1B2E', padding: '48px 24px 28px', color: '#fff' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: '28px',
          marginBottom: '20px',
          fontSize: '14px'
        }}>
          <Link to="/explore" style={{ color: '#B7B2C9', textDecoration: 'none' }}>Explore</Link>
          <Link to="/write" style={{ color: '#B7B2C9', textDecoration: 'none' }}>Write</Link>
          <Link to="/about" style={{ color: '#B7B2C9', textDecoration: 'none' }}>About</Link>
          <Link to="/login" style={{ color: '#B7B2C9', textDecoration: 'none' }}>Sign In</Link>
        </div>
        <p style={{ textAlign: 'center', fontSize: '12px', color: '#7A7488', margin: 0 }}>
          © 2026 Storiax. Built for passionate readers & writers.
        </p>
      </footer>
    </div>
  )
}

// ---- Helper components used only inside this file ----

function FloatingCover({ story, onClick, style }) {
  return (
    <div
      onClick={onClick}
      style={{ ...style, borderRadius: 'var(--radius-md)', overflow: 'hidden', boxShadow: '0 12px 30px rgba(0,0,0,0.15)', cursor: 'pointer', background: '#ddd' }}
    >
      <img
        src={story.cover_image || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=300'}
        alt={story.title}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
    </div>
  )
}

function CommentBubble({ author, text, likes, style }) {
  return (
    <div style={{
      ...style,
      background: 'var(--color-white)',
      borderRadius: 'var(--radius-md)',
      boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
      padding: '14px 16px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: '10px'
    }}>
      <div>
        <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-rose)', margin: '0 0 4px' }}>{author}</p>
        <p style={{ fontSize: '13px', color: 'var(--color-text)', margin: 0, lineHeight: 1.4 }}>{text}</p>
      </div>
      <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>♥ {likes}</span>
    </div>
  )
}

function StoryStripCard({ story, index, onClick }) {
  return (
    <div onClick={onClick} style={{ flex: '0 0 auto', width: '160px', cursor: 'pointer' }}>
      <div style={{
        width: '100%', height: '220px', borderRadius: 'var(--radius-md)',
        overflow: 'hidden', boxShadow: 'var(--shadow-card)', background: 'var(--color-rose-light)',
        position: 'relative'
      }}>
        <img
          src={story.cover_image || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=300'}
          alt={story.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{
          position: 'absolute', bottom: '8px', left: '8px', background: 'rgba(0,0,0,0.6)', color: '#fff',
          padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold'
        }}>
          #{index}
        </div>
      </div>
      <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--color-rose)', margin: '10px 0 2px', fontWeight: 700 }}>
        {story.genre || 'Fiction'}
      </p>
      <p style={{ fontFamily: 'var(--font-heading)', fontSize: '13px', margin: 0, color: 'var(--color-text)', lineHeight: 1.3, fontWeight: 600 }}>
        {story.title}
      </p>
    </div>
  )
}
