import LevelShell from '../LevelShell';

export default function PlaceholderLevel({ level, title, subtitle }) {
  return (
    <LevelShell level={level} title={title} subtitle={subtitle}>
      <div className="text-center py-12 text-text-muted">
        <p className="text-lg">Coming in Session {level < 5 ? 2 : 3}...</p>
      </div>
    </LevelShell>
  );
}
