"use client"

import { useState, useRef } from "react"
import { Upload, ChevronDown, Loader2, Check, FileAudio, FileVideo, FileImage } from "lucide-react"
import { FFmpeg } from "@ffmpeg/ffmpeg"
import { toBlobURL, fetchFile } from "@ffmpeg/util"

const formatCategories = {
  audio: { label: "אודיו", icon: FileAudio, formats: ["MP3", "WAV", "FLAC", "AAC", "OGG", "M4A", "WMA"] },
  video: { label: "וידאו", icon: FileVideo, formats: ["MP4", "MOV", "AVI", "MKV", "WEBM", "WMV", "FLV"] },
  image: { label: "תמונה", icon: FileImage, formats: ["JPG", "PNG", "WEBP", "GIF", "BMP", "TIFF", "SVG"] }
}

export default function FileConverterPage() {
  const [file, setFile] = useState<File | null>(null)
  const [selectedFormat, setSelectedFormat] = useState("")
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isConverting, setIsConverting] = useState(false)
  const [progressMsg, setProgressMsg] = useState("ממיר קובץ...")
  const ffmpegRef = useRef(new FFmpeg())

  const loadFFmpeg = async () => {
    const ffmpeg = ffmpegRef.current;
    if (ffmpeg.loaded) return ffmpeg;

    const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
    });
    return ffmpeg;
  };

  const handleConvert = async () => {
    if (!file || !selectedFormat) return
    setIsConverting(true)

    try {
      if (formatCategories.image.formats.includes(selectedFormat)) {
        setProgressMsg("ממיר תמונה בשרת...")
        const formData = new FormData()
        formData.append('file', file)
        formData.append('format', selectedFormat)
        const response = await fetch('/api/convert', { method: 'POST', body: formData })
        if (!response.ok) throw new Error()
        downloadFile(await response.blob(), selectedFormat)
      } else {
        setProgressMsg("טוען מנוע (חד פעמי)...")
        const ffmpeg = await loadFFmpeg();
        
        setProgressMsg("קורא קובץ...")
        await ffmpeg.writeFile(file.name, await fetchFile(file))
        
        setProgressMsg("מעבד מדיה...")
        const outputName = `output.${selectedFormat.toLowerCase()}`
        await ffmpeg.exec(['-i', file.name, outputName])
        
        setProgressMsg("מייצא...")
        const data = await ffmpeg.readFile(outputName)
        downloadFile(new Blob([data as any]), selectedFormat)
      }
    } catch (e) {
      console.error(e)
      alert("התרחשה שגיאה. נסה לרענן את הדף.")
    } finally {
      setIsConverting(false)
      setProgressMsg("ממיר קובץ...")
    }
  }

  const downloadFile = (blob: Blob, format: string) => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `deVee_${file!.name.split('.')[0]}.${format.toLowerCase()}`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-6 font-sans" dir="rtl">
      <div className="absolute inset-0 bg-devee-red/5 blur-[120px] pointer-events-none" />
      
      <header className="mb-12 flex flex-col items-center gap-4 relative z-10">
        <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/app_logo-aYPTnKATSOGLPTmF7VmPsJPmCkh6HF.png" alt="deVee" className="h-16" />
        <h1 className="text-xs tracking-[0.5em] text-white/40 uppercase">File Converter</h1>
      </header>

      <div className="w-full max-w-lg bg-white/[0.03] backdrop-blur-2xl rounded-[2.5rem] p-8 border border-white/5 shadow-2xl relative z-10">
        <div className="border-2 border-dashed border-white/10 rounded-2xl p-10 flex flex-col items-center gap-4 hover:border-devee-red/30 transition-all cursor-pointer relative">
          <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
            {file ? <Check className="text-devee-red" /> : <Upload className="text-white/20" />}
          </div>
          <p className="text-sm font-light text-white/60">{file ? file.name : "בחר קובץ להמרה"}</p>
        </div>

        <div className="mt-6 relative">
          <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="w-full bg-white/5 p-4 rounded-xl flex justify-between items-center text-sm">
            <ChevronDown size={16} className={isDropdownOpen ? "rotate-180" : ""} />
            {selectedFormat || "בחר פורמט"}
          </button>
          
          {isDropdownOpen && (
            <div className="absolute top-full mt-2 w-full bg-[#111] border border-white/10 rounded-xl overflow-hidden z-[100] max-h-60 overflow-y-auto">
              {Object.entries(formatCategories).map(([key, cat]) => (
                <div key={key}>
                  <div className="px-4 py-2 bg-white/5 text-[10px] text-white/30 uppercase tracking-widest">{cat.label}</div>
                  <div className="grid grid-cols-4 gap-1 p-2">
                    {cat.formats.map(f => (
                      <button key={f} onClick={() => { setSelectedFormat(f); setIsDropdownOpen(false); }} className={`p-2 text-[10px] rounded-md border ${selectedFormat === f ? 'bg-devee-red border-devee-red' : 'border-transparent bg-white/5'}`}>{f}</button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <button 
          onClick={handleConvert} 
          disabled={!file || !selectedFormat || isConverting}
          className={`w-full mt-8 py-4 rounded-xl font-bold tracking-widest transition-all ${(!file || !selectedFormat) ? 'bg-white/5 text-white/10' : 'bg-devee-red text-white'}`}
        >
          {isConverting ? <div className="flex items-center justify-center gap-2"><Loader2 className="animate-spin" size={18} /> {progressMsg}</div> : "בצע המרה"}
        </button>
      </div>

      <footer className="mt-12 flex flex-col items-center gap-4 text-[10px] tracking-[0.3em] text-white/20 uppercase">
        <p>Powered by deVee Boutique Label</p>
        <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/label_logo.jpg-vPg3UFlrczb9jCMrs4nyzOOJ7ozxYs.png" alt="deVee" className="h-12 w-12 rounded-full opacity-50" />
      </footer>
    </div>
  )
}