import { historyContent } from '../../content/history';
import type { HistoryChapter } from '../../content/history';

function ChapterNav({ chapters, activeId }: { chapters: HistoryChapter[]; activeId: string | null }) {
  return (
    <nav className="history-nav" aria-label="History sections">
      {chapters.map((chapter) => (
        <a
          key={chapter.id}
          href={`#${chapter.id}`}
          className={`history-nav-link ${activeId === chapter.id ? 'active' : ''}`}
        >
          {chapter.title}
        </a>
      ))}
    </nav>
  );
}

function Chapter({ chapter }: { chapter: HistoryChapter }) {
  return (
    <article className="history-chapter" id={chapter.id}>
      <h2>{chapter.title}</h2>
      {chapter.sections.map((section) => (
        <section key={section.id} id={section.id} className="history-section">
          <h3>{section.title}</h3>
          {section.paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </section>
      ))}
    </article>
  );
}

export function HistoryView() {
  return (
    <div className="history">
      <div className="history-intro">
        <h2>The Story of the Enigma</h2>
        <p>
          From its invention in the aftermath of World War I to its role in shaping the outcome
          of World War II, the Enigma machine stands at the intersection of engineering brilliance,
          wartime necessity, and the birth of modern computer science.
        </p>
      </div>
      <ChapterNav chapters={historyContent} activeId={null} />
      <div className="history-content">
        {historyContent.map((chapter) => (
          <Chapter key={chapter.id} chapter={chapter} />
        ))}
      </div>
    </div>
  );
}
