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
      if (typeof window === 'undefined') return resolve(true)
      if (document.querySelector(`script[src="${src}"]`)) return resolve(true)
      const script = document.createElement('script')
      script.src = src
      script.crossOrigin = "anonymous"
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
          throw new Error("Server conversion failed")
        }
      } else {
        setProgressMsg("טוען מנוע...")
        await loadScript('https://unpkg.com/@ffmpeg/ffmpeg@0.12.6/dist/umd/ffmpeg.js')
        await loadScript('https://unpkg.com/@ffmpeg/util@0.12.1/dist/umd/index.js')
        
        const win = window as any
        const { FFmpeg } = win.FFmpegWASM
        const { fetchFile, toBlobURL } = win.FFmpegUtil
        
        const ffmpeg = new FFmpeg()
        await ffmpeg.load({
          coreURL: await toBlobURL(`https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.js`, 'text/javascript'),
          wasmURL: await toBlobURL(`https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.wasm`, 'application/wasm'),
        })

        await ffmpeg.writeFile(file.name, await fetchFile(file))
        setProgressMsg("מעבד...")
        const outputName = `devee_output.${selectedFormat.toLowerCase()}`
        await ffmpeg.exec(['-i', file.name, outputName])
        
        const data = await ffmpeg.readFile(outputName)
        const blob = new Blob([data as any])
        downloadFile(blob, selectedFormat)
      }
    } catch (e) { 
      console.error(e)
      alert("שגיאה בעיבוד. נסה שוב או רענן.")
    } finally { 
      setIsConverting(false)
      setProgressMsg("ממיר קובץ...")
    }
  }

  const downloadFile = (blob: Blob, format: string) => {
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    const cleanName = file?.name.split('.')[0] || 'file'
    a.download = `deVee_${cleanName}.${format.toLowerCase()}`
    document.body.appendChild(a)
    a.click()
    a.remove()
    setIsComplete(true)
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col relative overflow-hidden font-sans" dir="rtl">
      
      {/* Background Glows */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-devee-red/10 rounded-full blur-[120px]" />
      </div>

      <header className="relative z-10 pt-12 pb-4 flex flex-col items-center">
        <img 
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/app_logo-aYPTnKATSOGLPTmF7VmPsJPmCkh6HF.png" 
          alt="deVee" 
          crossOrigin="anonymous"
          className="h-20 w-auto drop-shadow-[0_0_20px_rgba(178,34,34,0.3)]"
        />
        <h1 className="mt-4 text-sm font-light tracking-[0.4em] text-white/50 uppercase">File Converter</h1>
      </header>

      <main className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-xl bg-white/[0.03] backdrop-blur-xl rounded-[2.5rem] p-10 space-y-8 border border-white/5 shadow-2xl relative z-20">
          
          {/* Dropzone */}
          <div 
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setIsDragOver(false); setFile(e.dataTransfer.files[0]); }}
            className={`relative border-2 border-dashed rounded-2xl p-12 transition-all flex flex-col items-center gap-4 cursor-pointer
              ${isDragOver ? 'border-devee-red bg-devee-red/10' : 'border-white/10 hover:border-devee-red/40'}`}
          >
            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer z-30" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            <div className="w-20 h-20 rounded-full flex items-center justify-center bg-white/5 relative z-10">
              {file ? <Check className="text-devee-red w-8 h-8" /> : <Upload className="text-white/30 w-8 h-8" />}
            </div>
            <p className="text-xl font-light z-10 text-center">{file ? file.name : "גרור קובץ לכאן"}</p>
          </div>

          {/* Selector */}
          <div className="relative z-[100]">
            <button 
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full bg-white/[0.03] border border-white/10 p-5 rounded-2xl flex items-center justify-between text-white/70"
            >
              <ChevronDown className={`w-5 h-5 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              <span>{selectedFormat || "בחר פורמט יעד"}</span>
            </button>
            
            {isDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-3 bg-[#0f0f0f] border border-white/10 rounded-2xl z-[110] max-h-[250px] overflow-y-auto shadow-2xl">
                {Object.entries(formatCategories).map(([key, cat]) => (
                  <div key={key} className="border-b border-white/5">
                    <div className="px-5 py-2 bg-white/[0.02] text-[10px] text-white/30 uppercase flex items-center justify-between">
                      <cat.icon size={12} /> {cat.label}
                    </div>
                    <div className="grid grid-cols-4 gap-2 p-3">
                      {cat.formats.map(f => (
                        <button key={f} onClick={() => { setSelectedFormat(f); setIsDropdownOpen(false); }} className={`p-2 rounded-lg text-[10px] font-mono border ${selectedFormat === f ? 'bg-devee-red border-devee-red' : 'bg-white/5 border-transparent'}`}>
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Convert Button */}
          <button 
            type="button"
            onClick={(e) => { e.preventDefault(); handleConvert(); }}
            disabled={!file || !selectedFormat || isConverting}
            className={`w-full py-5 rounded-2xl font-bold uppercase transition-all relative z-10
              ${(!file || !selectedFormat) ? 'bg-white/5 text-white/10' : 'bg-devee-red text-white shadow-lg'}`}
          >
            {isConverting ? <div className="flex items-center justify-center gap-2"><Loader2 className="animate-spin" size={18} /> {progressMsg}</div> : "המר קובץ"}
          </button>
        </div>
      </main>

      <footer className="relative z-10 py-12 flex flex-col items-center gap-4">
        <p className="text-[11px] tracking-widest text-white/50">Powered by deVee Boutique Label</p>
        <img 
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/label_logo.jpg-vPg3UFlrczb9jCMrs4nyzOOJ7ozxYs.png" 
          alt="deVee Label" 
          crossOrigin="anonymous"
          className="h-16 w-16 rounded-full border border-white/10"
        />
      </footer>
    </div>
  )
}