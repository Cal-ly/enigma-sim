import { historyContent } from '../../content/history';
import type { HistoryChapter } from '../../types';

function ChapterNav({ chapters }: { chapters: HistoryChapter[] }) {
  return (
    <nav
      className="flex gap-2 flex-wrap p-3 bg-surface rounded-default border border-border"
      aria-label="History sections"
    >
      {chapters.map((chapter) => (
        <a
          key={chapter.id}
          href={`#${chapter.id}`}
          className="text-muted no-underline text-[0.85rem] px-3 py-1 rounded-default transition-all duration-150 hover:text-foreground hover:bg-surface-alt"
        >
          {chapter.title}
        </a>
      ))}
    </nav>
  );
}

function Chapter({ chapter }: { chapter: HistoryChapter }) {
  return (
    <article id={chapter.id}>
      <h2 className="text-accent text-2xl m-0 mb-5 pb-2 border-b-2 border-border">
        {chapter.title}
      </h2>
      {chapter.sections.map((section) => (
        <section key={section.id} id={section.id} className="mb-6">
          <h3 className="text-foreground text-lg m-0 mb-3">{section.title}</h3>
          {section.paragraphs.map((p, i) => (
            <p key={i} className="leading-7 text-foreground m-0 mb-3 text-[0.95rem] last:mb-0">
              {p}
            </p>
          ))}
        </section>
      ))}
    </article>
  );
}

export function HistoryView() {
  return (
    <div className="flex flex-col gap-6 max-w-[720px] mx-auto">
      <div>
        <h2 className="m-0 mb-3 text-accent">The Story of the Enigma</h2>
        <p className="leading-7 text-foreground m-0 text-[1.05rem]">
          From its invention in the aftermath of World War I to its role in shaping the outcome
          of World War II, the Enigma machine stands at the intersection of engineering brilliance,
          wartime necessity, and the birth of modern computer science.
        </p>
      </div>
      <ChapterNav chapters={historyContent} />
      <div className="flex flex-col gap-10">
        {historyContent.map((chapter) => (
          <Chapter key={chapter.id} chapter={chapter} />
        ))}
      </div>
    </div>
  );
}
