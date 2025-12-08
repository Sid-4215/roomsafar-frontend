// components/UploadProgressBar.jsx
export default function UploadProgressBar({ progress }) {
  const safeProgress =
    typeof progress === "number" && progress >= 0 && progress <= 100
      ? progress
      : 0;

  return (
    <div className="w-full mt-2">
      <div className="w-full h-2.5 rounded-full bg-slate-200 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300"
          style={{ width: `${safeProgress}%` }}
        />
      </div>
      <p className="mt-1 text-[11px] text-slate-500 text-right">
        {safeProgress === 100 ? "Uploaded" : `${safeProgress}%`}
      </p>
    </div>
  );
}
