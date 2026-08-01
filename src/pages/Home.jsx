import "../styles/theme.css";
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getPublishedStories } from '../services/postService'
import { useAuth } from '../contexts/AuthContext'
import ebookImg from '../assets/Ebook-rafiki.svg'
import companyImg from '../assets/Company-pana.svg'
import literatureImg from '../assets/Literature-amico.svg'
import womanReadingImg from '../assets/Woman reading-pana.svg'

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

  const darkFloralBg = {
    backgroundImage: "linear-gradient(135deg, rgba(75,90,58,0.55), rgba(106,74,80,0.6), rgba(34,26,20,0.85)), url('/floral-bg.png')",
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  }

  return (
    <div style={{ background: '#221A14' }}>

      {/* ============ HERO ============ */}
     {/* ============ HERO ============ */}
<section style={{
  ...darkFloralBg,
  padding: '90px 24px',
  position: 'relative'
}}>
  <div style={{
    maxWidth: '1100px',
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    gap: '40px',
    flexWrap: 'wrap'
  }}>
    {/* Left: text */}
    <div style={{ flex: '1 1 420px', minWidth: '300px', textAlign: 'left' }}>
      <p style={{ fontSize: '12px', letterSpacing: '3px', textTransform: 'uppercase', color: '#DCD5C8', marginBottom: '16px' }}>
        Storiax books and stories
      </p>
      <h1 style={{
        fontFamily: 'var(--font-heading)',
        fontWeight: 700,
        fontSize: '48px',
        lineHeight: 1.1,
        margin: '0 0 20px',
        color: '#ffffff'
      }}>
        Come for the story.<br />Stay for the connection.
      </h1>
      <p style={{
        fontSize: '16px',
        color: '#E9E4DA',
        marginBottom: '32px',
        lineHeight: 1.6
      }}>
        Stories worth staying up for, and comments sections better than your group chat.
      </p>

      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', marginBottom: '20px', maxWidth: '460px' }}>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search stories, genres, writers..."
          style={{
            flex: 1,
            padding: '12px 18px',
            borderRadius: '999px',
            border: '1px solid rgba(255,255,255,0.25)',
            fontSize: '14px',
            background: 'rgba(255,255,255,0.1)',
            color: '#fff',
            outline: 'none'
          }}
        />
        <button type="submit" style={{
          background: '#6A4A50',
          color: '#fff',
          border: 'none',
          padding: '12px 24px',
          borderRadius: '999px',
          fontWeight: 600,
          fontSize: '14px',
          cursor: 'pointer'
        }}>
          Search
        </button>
      </form>

      {!user ? (
        <>
          <button
            onClick={() => navigate('/register')}
            style={{
              background: '#4B1F24',
              color: '#ffffff',
              border: 'none',
              padding: '14px 32px',
              borderRadius: '999px',
              fontWeight: 600,
              fontSize: '15px',
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(0,0,0,0.3)'
            }}
          >
            Get Started
          </button>
          <p style={{ marginTop: '14px', fontSize: '13px', color: '#B7B2C9' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#fff', fontWeight: 600 }}>Log in</Link>
          </p>
        </>
      ) : (
        <button
          onClick={() => navigate('/explore')}
          style={{
            background: '#4B1F24',
            color: '#ffffff',
            border: 'none',
            padding: '14px 32px',
            borderRadius: '999px',
            fontWeight: 600,
            fontSize: '15px',
            cursor: 'pointer'
          }}
        >
          Continue Exploring
        </button>
      )}
    </div>

    {/* Right: illustration */}
    <div style={{ flex: '1 1 320px', minWidth: '260px', textAlign: 'center' }}>
      <img
        src={companyImg}
        alt="Storiax community"
        style={{ width: '100%', maxWidth: '420px' }}
      />
    </div>
  </div>
</section>

      {/* ============ TRENDING NOW ============ */}
      <section style={{ padding: '64px 24px', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
          <h2 style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 700,
            fontSize: '28px',
            margin: 0,
            color: '#ffffff'
          }}>
            Trending Now 🔥
          </h2>
          <Link to="/explore" style={{ fontSize: '14px', fontWeight: 600, color: '#C9A0A6', textDecoration: 'none' }}>
            View all →
          </Link>
        </div>

        {loading ? (
          <p style={{ color: '#B7B2C9' }}>Loading stories...</p>
        ) : stories.length === 0 ? (
          <p style={{ color: '#B7B2C9' }}>No stories published yet — be the first to write one!</p>
        ) : (
          <div style={{ display: 'flex', gap: '18px', overflowX: 'auto', paddingBottom: '12px' }}>
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

      {/* ============ MUST-READ (dark floral band) ============ */}
      <section style={{
        ...darkFloralBg,
        padding: '70px 24px',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '32px'
      }}>
        <div style={{ flex: '0 0 260px' }}>
          <h2 style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 700,
            fontSize: '28px',
            color: '#ffffff',
            margin: '0 0 8px'
          }}>
            Must-read Stories
          </h2>
          <p style={{ fontSize: '13px', color: '#DCD5C8', margin: 0 }}>Handpicked community favorites you won't put down.</p>
        </div>

        <div style={{ display: 'flex', gap: '14px', overflowX: 'auto', flex: '1 1 400px', paddingBottom: '8px' }}>
          {stories.slice(2, 9).map(story => (
            <div
              key={story.id}
              onClick={() => navigate(`/story/${story.id}`)}
              style={{
                flex: '0 0 auto', width: '110px', height: '150px', borderRadius: '10px',
                overflow: 'hidden', cursor: 'pointer', boxShadow: '0 8px 24px rgba(0,0,0,0.35)', position: 'relative'
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

      {/* ============ ALL THE GENRES ============ */}
      <section style={{
        background: '#2C221E',
        padding: '80px 24px',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '40px'
      }}>
        <div style={{ flex: '1 1 380px', minWidth: '300px' }}>
          <h2 style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 700,
            fontSize: '34px',
            margin: '0 0 16px',
            color: '#ffffff',
            lineHeight: 1.15
          }}>
            All the genres.<br />All the moods. All you.
          </h2>
          <p style={{ color: '#B7B2C9', fontSize: '15px', marginBottom: '26px' }}>
            Find your next favorite read, no matter your mood or vibe.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {GENRES.map(genre => (
              <button
                key={genre}
                onClick={() => navigate(`/explore?category=${genre}`)}
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  padding: '8px 16px',
                  borderRadius: '999px',
                  fontSize: '13px',
                  cursor: 'pointer',
                  color: '#E9E4DA',
                  fontWeight: 500
                }}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>

        <div style={{
          flex: '1 1 260px',
          minWidth: '220px',
          height: '280px',
          borderRadius: '16px',
          background: '#3a2c22',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '20px',
          textAlign: 'center',
          overflow: 'hidden'
        }}>
          <img
            src={ebookImg}
            alt="Explore Unlimited Worlds"
            style={{ width: '80%', maxWidth: '220px', marginBottom: '12px' }}
          />
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '20px', color: '#fff', margin: '0 0 8px' }}>Explore Unlimited Worlds</h3>
          <p style={{ fontSize: '13px', color: '#DCD5C8', margin: 0 }}>Discover hidden gems written by passionate creators worldwide.</p>
        </div>
      </section>
      {/* ============ BOOK CLUB (illustration + floating comments) ============ */}
      <section style={{
        background: '#2C221E',
        padding: '80px 24px',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '48px'
      }}>
        <div style={{
          flex: '1 1 320px',
          minWidth: '260px',
          position: 'relative',
          display: 'flex',
          justifyContent: 'center'
        }}>
          <img
            src={literatureImg}
            alt="Book club discussion"
            style={{ width: '100%', maxWidth: '380px' }}
          />

          {/* Floating comment card 1 */}
          <div style={{
            position: 'absolute',
            top: '10%',
            left: '0',
            background: '#fff',
            borderRadius: '12px',
            padding: '14px 16px',
            width: '190px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.35)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#4B1F24' }}>@auqu33n</span>
              <span style={{ fontSize: '12px', color: '#C9A0A6' }}>▼ 105</span>
            </div>
            <p style={{ fontSize: '13px', color: '#2C221E', margin: 0, lineHeight: 1.4 }}>
              we're all collectively losing our minds over this chapter right? 😭
            </p>
          </div>

          {/* Floating comment card 2 */}
          <div style={{
            position: 'absolute',
            bottom: '5%',
            right: '0',
            background: '#fff',
            borderRadius: '12px',
            padding: '14px 16px',
            width: '190px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.35)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#4B1F24' }}>@slowburn_stan</span>
              <span style={{ fontSize: '12px', color: '#C9A0A6' }}>▼ 98</span>
            </div>
            <p style={{ fontSize: '13px', color: '#2C221E', margin: 0, lineHeight: 1.4 }}>
              someone pass the popcorn 🍿
            </p>
          </div>
        </div>

        <div style={{ flex: '1 1 380px', minWidth: '300px' }}>
          <h2 style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 700,
            fontSize: '32px',
            margin: '0 0 16px',
            color: '#ffffff',
            lineHeight: 1.15
          }}>
            Your book club, but bigger
          </h2>
          <p style={{ color: '#B7B2C9', fontSize: '15px', lineHeight: 1.6 }}>
            Read, react, and connect with writers and readers who live for the same stories you do. Drop inline comments right where the plot twists happen!
          </p>
        </div>
      </section>

      {/* ============ WHERE STORIES BECOME FAVORITES ============ */}
      <section style={{
        background: '#3a2c22',
        padding: '80px 24px',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '48px'
      }}>
        <div style={{ flex: '1 1 380px', minWidth: '300px' }}>
          <h2 style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 700,
            fontSize: '34px',
            margin: '0 0 16px',
            color: '#ffffff',
            lineHeight: 1.15
          }}>
            Where stories<br />become favorites.
          </h2>
          <p style={{ color: '#DCD5C8', fontSize: '15px', lineHeight: 1.6 }}>
            Start writing where creators grow together, and stories find their readers. Publish your chapters and build your own dedicated fanbase.
          </p>
        </div>

        <div style={{ flex: '1 1 320px', minWidth: '260px', textAlign: 'center' }}>
          <img
            src={womanReadingImg}
            alt="Woman reading a story"
            style={{ width: '100%', maxWidth: '400px' }}
          />
        </div>
      </section>

      {/* ============ SIGN UP CTA ============ */}
      {!user && (
        <section style={{
          ...darkFloralBg,
          padding: '80px 24px',
          textAlign: 'center'
        }}>
          <h2 style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 700,
            fontSize: '32px',
            marginBottom: '12px',
            color: '#ffffff'
          }}>
            Your next favorite story starts here
          </h2>
          <p style={{ color: '#DCD5C8', marginBottom: '26px' }}>
            Join Storiax — carry your favorite stories and community with you.
          </p>
          <button
            onClick={() => navigate('/register')}
            style={{
              background: '#4B1F24',
              color: '#fff',
              border: 'none',
              padding: '14px 36px',
              borderRadius: '999px',
              fontWeight: 600,
              fontSize: '16px',
              cursor: 'pointer'
            }}
          >
            Join Storiax Free
          </button>
        </section>
      )}

      {/* ============ FOOTER ============ */}
      <footer style={{ background: '#1A1310', padding: '48px 24px 28px', color: '#fff' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: '28px',
          marginBottom: '20px',
          fontSize: '14px'
        }}>
          <Link to="/explore" style={{ color: '#B7B2C9', textDecoration: 'none' }}>Explore</Link>
          <Link to="/editor" style={{ color: '#B7B2C9', textDecoration: 'none' }}>Write</Link>
          <Link to="/login" style={{ color: '#B7B2C9', textDecoration: 'none' }}>Sign In</Link>
        </div>
        <p style={{ textAlign: 'center', fontSize: '12px', color: '#7A7488', margin: 0 }}>
          © 2026 Storiax. Built for passionate readers & writers.
        </p>
      </footer>
    </div>
  )
}

// ---- Helper components ----

function StoryStripCard({ story, index, onClick }) {
  return (
    <div onClick={onClick} style={{ flex: '0 0 auto', width: '160px', cursor: 'pointer' }}>
      <div style={{
        width: '100%', height: '220px', borderRadius: '12px',
        overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.3)', background: '#3a2c22',
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
      <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#C9A0A6', margin: '10px 0 2px', fontWeight: 700 }}>
        {story.genre || 'Fiction'}
      </p>
      <p style={{ fontFamily: 'var(--font-heading)', fontSize: '13px', margin: 0, color: '#fff', lineHeight: 1.3, fontWeight: 600 }}>
        {story.title}
      </p>
    </div>
  )
}