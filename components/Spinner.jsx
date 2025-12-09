export default function Spinner({ size = 32 }) {
  return (
    <div
      className="animate-spin rounded-full border-2 border-slate-300 border-t-blue-600"
      style={{
        width: size,
        height: size,
      }}
    />
  );
}
