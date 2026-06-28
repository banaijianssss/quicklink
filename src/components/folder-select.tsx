"use client";

type FolderOption = { id: string; name: string; color?: string };

export function FolderSelect({
  folders,
  defaultValue,
}: {
  folders: FolderOption[];
  defaultValue?: string | null;
}) {
  if (!folders.length) return null;

  return (
    <div>
      <label className="mb-1 block text-sm font-medium">文件夹（可选）</label>
      <select
        name="folderId"
        defaultValue={defaultValue ?? ""}
        className="w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm"
      >
        <option value="">未分类</option>
        {folders.map((f) => (
          <option key={f.id} value={f.id}>
            {f.name}
          </option>
        ))}
      </select>
    </div>
  );
}