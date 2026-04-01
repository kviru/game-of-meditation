import Link from 'next/link'
import styles from './page.module.css'

export default function HomePage() {
  return (
    <main className={styles.main}>
      <section className={styles.hero}>
        <h1 className={styles.title}>Game of<br />Meditation</h1>
        <p className={styles.tagline}>
          Conquer Yourself.<br />
          One Breath At A Time.<br />
          <em>Let&apos;s Play.</em>
        </p>
        <div className={styles.actions}>
          <Link href="/play" className={styles.primaryButton}>
            Start Playing — It&apos;s Free
          </Link>
          <Link href="/about" className={styles.secondaryButton}>
            Learn More
          </Link>
        </div>
      </section>
    </main>
  )
}
