"use client"

import { useMemoContext } from "@/context/store/MemoStore"
import { useMemo } from "react"
import { useRouter } from "next/navigation"
import { Eye } from "lucide-react"

const ITEM_HEIGHT = 110 // px, adjust if your card height changes

const MemoWidget = () => {
  const { memos, loading } = useMemoContext()
  const router = useRouter()

  // Sort memos by latest memoDate
  const sortedMemos = useMemo(() => {
    return [...memos].sort((a, b) => new Date(b.memoDate).getTime() - new Date(a.memoDate).getTime())
  }, [memos])

  return (
    <div className="bg-card/80 border border-border rounded-xl shadow-xl p-4 w-full flex flex-col ">
      <h2 className="text-lg font-bold mb-4 text-foreground">Memos</h2>
      <div
        className="overflow-y-auto flex flex-col gap-3 scrollbar-hide"
        style={{
          maxHeight: `${ITEM_HEIGHT * 3 + 16}px`, // 3 items + gap
          scrollbarWidth: "none", // Firefox
          msOverflowStyle: "none", // IE/Edge
        }}
      >
        <style jsx>{`
          div::-webkit-scrollbar {
            display: none; /* Chrome, Safari, Opera */
          }
        `}</style>
        {loading ? (
          <div className="text-muted-foreground text-center py-8">Loading memos...</div>
        ) : sortedMemos.length === 0 ? (
          <div className="text-muted-foreground text-center py-8">No memos found.</div>
        ) : (
          sortedMemos.map((memo) => (
            <div
              key={memo.id}
              className="bg-background border border-border rounded-lg shadow p-4 flex flex-col gap-2 relative flex-shrink-0"
              style={{ minHeight: `${ITEM_HEIGHT}px` }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                    {memo.id.slice(0, 6)}
                  </span>
                </div>
                <button
                  className="p-1 rounded hover:bg-muted transition flex-shrink-0"
                  title="View Memo"
                  onClick={(e) => {
                    e.stopPropagation()
                    router.push(`/service/memo/${memo.id}`)
                  }}
                  style={{ display: "inline-flex", alignItems: "center" }}
                >
                  <Eye className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
              <div className="font-bold text-lg text-foreground truncate">{memo.name}</div>
              <div className="text-sm text-muted-foreground line-clamp-2">{memo.detail ?? "-"}</div>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span className="truncate">
                  <span className="font-semibold">Memo Type:</span> {memo.memoType ?? "-"}
                </span>
                <span className="truncate">
                  <span className="font-semibold">Date:</span>{" "}
                  {memo.memoDate ? new Date(memo.memoDate).toLocaleDateString() : "-"}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default MemoWidget
