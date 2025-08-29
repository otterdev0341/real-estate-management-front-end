const correctFilePathUrl = (path: string): string => {
  // Extract filename from the path
  const parts = path.split("/")
  const filename = parts[parts.length - 1]
  // Inject NEXT_PUBLIC_DEV_FILE_URL from env
  const baseUrl = process.env.NEXT_PUBLIC_DEV_FILE_URL || ""
  // Return baseUrl/filename
  return `${baseUrl}/${filename}`
}

export default correctFilePathUrl
