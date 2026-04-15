"use client"

import { useState } from "react"
import { Upload, ChevronDown, Loader2, Check, FileAudio, FileVideo, FileImage } from "lucide-react"

const formatCategories = {
  audio: { label: "אודיו", icon: FileAudio, formats: ["MP3", "WAV", "FLAC", "AAC", "OGG", "M4A", "WMA"] },
  video: { label: "וידאו", icon: FileVideo, formats: ["MP4", "MOV", "AVI", "MKV", "WEBM", "WMV", "FLV"] },
  image: { label: "תמונה", icon: FileImage, formats: ["JPG", "PNG", "WEBP", "GIF", "BMP", "TIFF", "SVG"] }
}

export default function FileConverterPage() {
  const [file, setFile] = useState<File | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [selectedFormat, setSelectedFormat] = useState("")
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isConverting, setIsConverting] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [progressMsg, setProgressMsg] = useState("ממיר קובץ...")

  const loadScript = (src: string) => {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) return resolve(true)
      const script = document.createElement('script')
      script.src = src
      script.crossOrigin = "anonymous" // קריטי לאבטחה החדשה
      script.onload = resolve
      script.onerror = reject
      document.body.appendChild(script)
    })
  }

  const handleConvert = async () => {
    if (!file || !selectedFormat) return
    setIsConverting(true)
    setIsComplete(false)

    try {
      if (formatCategories.image.formats.includes(selectedFormat)) {
        setProgressMsg("ממיר תמונה בשרת...")
        const formData = new FormData()
        formData.append('file', file)
        formData.append('format', selectedFormat)
        
        const response = await fetch('/api/convert', { method: 'POST', body: formData })
        if (response.ok) {
          const blob = await response.blob()
          downloadFile(blob, selectedFormat)
        } else {
          alert("שגיאה בהמרת התמונה")
        }
      } else {
        setProgressMsg("מוריד מנוע מדיה...")
        await loadScript('https://unpkg.com/@ffmpeg/ffmpeg@0.12.6/dist/umd/ffmpeg.js')
        await loadScript('https://unpkg.com/@ffmpeg/util@0.12.1/dist/umd/index.js')
        
        const win = window as any
        const { FFmpeg } = win.FFmpegWASM
        const { fetchFile, toBlobURL } = win.FFmpegUtil
        
        const ffmpeg = new FFmpeg()
        setProgressMsg("מאתחל מנוע...")
        
        await ffmpeg.load({
          coreURL: await toBlobURL(`https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.js`, 'text/javascript'),
          wasmURL: await toBlobURL(`https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.wasm`, 'application/wasm'),
        })

        await ffmpeg.writeFile(file.name, await fetchFile(file))
        setProgressMsg("מעבד מדיה...")
        const outputName = `devee_output.${selectedFormat.toLowerCase()}`
        await ffmpeg.exec(['-i', file.name, outputName])
        
        const data = await ffmpeg.readFile(outputName)
        const blob = new Blob([data as any])
        downloadFile(blob, selectedFormat)
      }
    } catch (e) { 
      console.error(e)
      alert("שגיאת אבטחה או עיבוד. נסה לרענן.")
    } finally { 
      setIsConverting(false)
    }
  }

  const downloadFile = (blob: Blob, format: string) => {
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `deVee_${file!.name.split('.')[0]}.${format.toLowerCase()}`
    a.click()
    setIsComplete(true)
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col relative overflow-hidden font-sans" dir="rtl">
      {/* Header */}
      <header className="relative z-10 pt-12 pb-4 flex flex-col items-center">
        <img 
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/app_logo-aYPTnKATSOGLPTmF7VmPsJPmCkh6HF.png" 
          alt="deVee" 
          crossOrigin="anonymous" // התיקון כאן
          className="h-20 w-auto"
        />
        <h1 className="mt-4 text-sm font-light tracking-[0.4em] text-white/50 uppercase">File Converter</h1>
      </header>

      <main className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-xl glass-module red-glow-ui rounded-[2.5rem] p-10 space-y-8 border border-white/5 relative z-20">
          {/* Dropzone */}
          <div className={`relative border-2 border-dashed rounded-2xl p-12 transition-all duration-500 flex flex-col items-center gap-4 cursor-pointer z-10 ${isDragOver ? 'border-devee-red bg-devee-red/10' : 'border-white/10'}`}>
            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer z-20" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            <div className="w-20 h-20 rounded-full flex items-center justify-center bg-white/5">
              {file ? <Check className="text-devee-red w-8 h-8" /> : <Upload className="text-white/30 w-8 h-8" />}
            </div>
            <p className="text-xl font-light">{file ? file.name : "גרור קובץ לכאן"}</p>
          </div>

          {/* Formats and Convert Button - (Keep same as before) */}
          <button 
            onClick={handleConvert}
            disabled={!file || !selectedFormat || isConverting}
            className="w-full py-5 rounded-2xl font-bold bg-devee-red text-white"
          >
            {isConverting ? progressMsg : "המר קובץ"}
          </button>
        </div>
      </main>

      <footer className="relative z-0 py-12 flex flex-col items-center gap-5">
        <img 
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/label_logo.jpg-vPg3UFlrczb9jCMrs4nyzOOJ7ozxYs.png" 
          alt="deVee Label" 
          crossOrigin="anonymous" // והתיקון כאן
          className="h-16 w-16 rounded-full"
        />
      </footer>
    </div>
  )
}