import { useEffect, useState } from "react"
import { PaperClipIcon, DocumentIcon, PhotoIcon } from "@heroicons/react/24/outline"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import BaseFileRelatedDto from "@/domain/utility/BaseFetchFileRelatedDto"

interface FileItem {
  id: string
  fileName: string
  urlPath: string
  fileType: string
  fileSize: string
  createdBy: string
}


interface CommonAttachmentsProps {
   id: string
  fetchFiles: (dto: BaseFileRelatedDto) => Promise<FileItem[]>
  attachFile: (dto: { targetId: string, file: File }) => Promise<void>
  removeFile: (dto: { targetId: string, fileId: string }) => Promise<void>
}
// this will 4 thing as props
/**
 * 1: fetch all, it will handle fetch case by this tab
 * 2: attach file to target, to use with upload button
 * 3: delete file from target will use with delete button that parsing file id
 * 4: target id to fetch files
 */

const CommonAttachments = ({ id, fetchFiles }: CommonAttachmentsProps) => {
  const [files, setFiles] = useState<FileItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("all")

  useEffect(() => {
    setLoading(true)
    fetchFiles(id).then(f => {
      setFiles(f)
      setLoading(false)
    })
  }, [id, fetchFiles])

  const filteredFiles = files.filter(file =>
    file.fileName.toLowerCase().includes(searchTerm === "all" ? "" : searchTerm.toLowerCase())
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="font-semibold text-lg flex items-center gap-2">
          <PaperClipIcon className="w-5 h-5 text-muted-foreground" />
          Attachments
        </div>
        <button className="px-4 py-2 rounded-lg bg-violet-600 text-white hover:bg-violet-700 font-medium flex items-center gap-2">
          <PaperClipIcon className="w-4 h-4" />
          Upload File
        </button>
      </div>
      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { key: "all", label: `All (${files.length})` },
          { key: "image", label: `Images (${files.filter(f => f.fileType === "image").length})` },
          { key: "pdf", label: `PDFs (${files.filter(f => f.fileType === "pdf").length})` },
          { key: "other", label: `Others (${files.filter(f => f.fileType === "other").length})` }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setSearchTerm(tab.key)}
            className={`px-3 py-1 rounded-full font-medium text-sm ${
              searchTerm === tab.key
                ? "bg-violet-100 text-violet-700"
                : "bg-muted text-muted-foreground hover:bg-violet-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {/* Images */}
      {["all", "image"].includes(searchTerm) && files.filter(f => f.fileType === "image").length > 0 && (
        <div className="mb-6">
          <div className="font-semibold text-base mb-2 flex items-center gap-2">
            <PhotoIcon className="w-5 h-5 text-blue-500" />
            Images ({files.filter(f => f.fileType === "image").length})
          </div>
          {/* "all" tab: slideshow for desktop */}
          {searchTerm === "all" && (
            <div className="hidden sm:block">
              <Carousel opts={{ loop: false }}>
                <CarouselContent>
                  {files.filter(f => f.fileType === "image").map(file => (
                    <CarouselItem key={file.id} className="basis-1/2">
                      <div className="bg-white rounded-lg border border-border p-3 flex flex-col">
                        <img src={file.urlPath} alt={file.fileName} className="rounded-lg mb-2 object-cover h-32 w-full" />
                        <div className="font-medium text-sm">{file.fileName}</div>
                        <div className="text-xs text-muted-foreground mb-2">{file.fileSize}</div>
                        <div className="flex gap-2">
                          <button className="px-2 py-1 rounded bg-muted text-muted-foreground text-xs hover:bg-muted/70">View</button>
                          <button className="px-2 py-1 rounded bg-muted text-muted-foreground text-xs hover:bg-muted/70">Download</button>
                          <button className="px-2 py-1 rounded bg-red-50 text-red-600 text-xs hover:bg-red-100">Delete</button>
                        </div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
            </div>
          )}
          {/* "image" tab: grid for desktop */}
          {searchTerm === "image" && (
            <div className="hidden sm:grid grid-cols-2 md:grid-cols-3 gap-4">
              {files.filter(f => f.fileType === "image").map(file => (
                <div key={file.id} className="bg-white rounded-lg border border-border p-3 flex flex-col">
                  <img src={file.urlPath} alt={file.fileName} className="rounded-lg mb-2 object-cover h-32 w-full" />
                  <div className="font-medium text-sm">{file.fileName}</div>
                  <div className="text-xs text-muted-foreground mb-2">{file.fileSize}</div>
                  <div className="flex gap-2">
                    <button className="px-2 py-1 rounded bg-muted text-muted-foreground text-xs hover:bg-muted/70">View</button>
                    <button className="px-2 py-1 rounded bg-muted text-muted-foreground text-xs hover:bg-muted/70">Download</button>
                    <button className="px-2 py-1 rounded bg-red-50 text-red-600 text-xs hover:bg-red-100">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {/* Mobile view: always grid 2 columns */}
          <div className="grid grid-cols-2 gap-4 sm:hidden">
            {files.filter(f => f.fileType === "image").map(file => (
              <div key={file.id} className="bg-white rounded-lg border border-border p-3 flex flex-col">
                <img src={file.urlPath} alt={file.fileName} className="rounded-lg mb-2 object-cover h-32 w-full" />
                <div className="font-medium text-sm">{file.fileName}</div>
                <div className="text-xs text-muted-foreground mb-2">{file.fileSize}</div>
                <div className="flex gap-2">
                  <button className="px-2 py-1 rounded bg-muted text-muted-foreground text-xs hover:bg-muted/70">View</button>
                  <button className="px-2 py-1 rounded bg-muted text-muted-foreground text-xs hover:bg-muted/70">Download</button>
                  <button className="px-2 py-1 rounded bg-red-50 text-red-600 text-xs hover:bg-red-100">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* PDFs */}
      {["all", "pdf"].includes(searchTerm) && files.filter(f => f.fileType === "pdf").length > 0 && (
        <div className="mb-6">
          <div className="font-semibold text-base mb-2 flex items-center gap-2">
            <DocumentIcon className="w-5 h-5 text-red-500" />
            PDF Documents ({files.filter(f => f.fileType === "pdf").length})
          </div>
          {files.filter(f => f.fileType === "pdf").map(file => (
            <div key={file.id} className="bg-white rounded-lg border border-border p-3 flex items-center justify-between mb-2">
              <div>
                <div className="font-medium text-sm text-red-700">{file.fileName}</div>
                <div className="text-xs text-muted-foreground">{file.fileSize}</div>
              </div>
              <div className="flex gap-2">
                <button className="px-2 py-1 rounded bg-muted text-muted-foreground text-xs hover:bg-muted/70">View</button>
                <button className="px-2 py-1 rounded bg-muted text-muted-foreground text-xs hover:bg-muted/70">Download</button>
                <button className="px-2 py-1 rounded bg-red-50 text-red-600 text-xs hover:bg-red-100">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Others */}
      {["all", "other"].includes(searchTerm) && files.filter(f => f.fileType === "other").length > 0 && (
        <div>
          <div className="font-semibold text-base mb-2 flex items-center gap-2">
            <PaperClipIcon className="w-5 h-5 text-gray-500" />
            Other Files ({files.filter(f => f.fileType === "other").length})
          </div>
          {files.filter(f => f.fileType === "other").map(file => (
            <div key={file.id} className="bg-white rounded-lg border border-border p-3 flex items-center justify-between mb-2">
              <div>
                <div className="font-medium text-sm">{file.fileName}</div>
                <div className="text-xs text-muted-foreground">{file.fileSize}</div>
              </div>
              <div className="flex gap-2">
                <button className="px-2 py-1 rounded bg-muted text-muted-foreground text-xs hover:bg-muted/70">Download</button>
                <button className="px-2 py-1 rounded bg-red-50 text-red-600 text-xs hover:bg-red-100">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* No files */}
      {files.length === 0 && (
        <div className="text-muted-foreground mt-6">No attachments found.</div>
      )}
    </div>
  )
}

export default CommonAttachments