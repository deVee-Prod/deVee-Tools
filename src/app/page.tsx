"use client"

import { useState, useRef, useEffect } from "react"
import { Upload, ChevronDown, Loader2, Check, FileAudio, FileVideo, FileImage } from "lucide-react"

export default function FileConverterPage() {
  const [file, setFile] = useState<File | null>(null)
  const [selectedFormat, setSelectedFormat] = useState("")
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isConverting, setIsConverting] = useState(false)
  const [progressMsg, setProgressMsg] = useState("ממיר קובץ...")
  const [isLoaded, setIsLoaded] = useState(false) // מוודא שאנחנו בדפדפן
  
  const ffmpegRef = useRef<any>(null)

  // טוענים את הכל רק כשהדף עולה בדפדפן (לא בשרת של Vercel)
  useEffect(() => {
    setIsLoaded(true)
  }, [])

  const loadFFmpeg = async () => {
    if (ffmpegRef.current && ffmpegRef.current.loaded) return ffmpegRef.current;

    // ייבוא דינמי רק בזמן ריצה
    const { FFmpeg } = await import("@ffmpeg/ffmpeg")
    const { toBlobURL } = await import("@ffmpeg/util")
    
    const ffmpeg = new FFmpeg()
    const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
    
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
    });
    
    ffmpegRef.current = ffmpeg
    return ffmpeg;
  };

  const handleConvert = async () => {
    if (!file || !selectedFormat) return
    setIsConverting(true)

    try {
      const formatCategories = {
        image: ["JPG", "PNG", "WEBP", "GIF", "BMP", "TIFF", "SVG"]
      }

      if (formatCategories.image.includes(selectedFormat)) {
        setProgressMsg("ממיר תמונה...")
        const formData = new FormData()
        formData.append('file', file)
        formData.append('format', selectedFormat)
        const response = await fetch('/api/convert', { method: 'POST', body: formData })
        const blob = await response.blob()
        downloadFile(blob, selectedFormat)
      } else {
        const { fetchFile } = await import("@ffmpeg/util")
        setProgressMsg("טוען מנוע...")
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
      alert("התרחשה שגיאה. נסה לרענן.")
    } finally {
      setIsConverting(false)
      setProgressMsg("ממיר קובץ...")
    }
  }

  const downloadFile = (blob: Blob, format: string) => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `deVee_tools_${file?.name.split('.')[0]}.${format.toLowerCase()}`
    a.click()
  }

  // אם אנחנו בשרת, אל תציג כלום עדיין כדי למנוע את השגיאה
  if (!isLoaded) return <div className="min-h-screen bg-[#0a0a0a]" />

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-6" dir="rtl">
      <header className="mb-12 flex flex-col items-center gap-4">
        <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/app_logo-aYPTnKATSOGLPTmF7VmPsJPmCkh6HF.png" alt="deVee" className="h-16" />
        <h1 className="text-[10px] tracking-[0.5em] text-white/40 uppercase">File Converter</h1>
      </header>

      <div className="w-full max-w-lg bg-white/[0.03] backdrop-blur-2xl rounded-[2.5rem] p-8 border border-white/5 relative">
        <div className="border-2 border-dashed border-white/10 rounded-2xl p-10 flex flex-col items-center gap-4 relative">
          <input type="file" className="absolute inset-0 opacity-0 cursor-pointer z-20" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
            {file ? <Check className="text-devee-red" /> : <Upload className="text-white/20" />}
          </div>
          <p className="text-sm font-light text-white/60">{file ? file.name : "גרור קובץ לכאן"}</p>
        </div>

        <button 
          onClick={() => setIsDropdownOpen(!isDropdownOpen)} 
          className="w-full mt-6 bg-white/5 p-4 rounded-xl flex justify-between items-center text-sm"
        >
          <ChevronDown size={16} className={isDropdownOpen ? "rotate-180" : ""} />
          {selectedFormat || "בחר פורמט"}
        </button>
        
        {isDropdownOpen && (
          <div className="absolute left-8 right-8 mt-2 bg-[#111] border border-white/10 rounded-xl overflow-hidden z-[100] max-h-48 overflow-y-auto shadow-2xl">
            <div className="p-2 grid grid-cols-4 gap-1">
              {["MP3", "WAV", "MP4", "MOV", "PNG", "JPG", "WEBP"].map(f => (
                <button key={f} onClick={() => { setSelectedFormat(f); setIsDropdownOpen(false); }} className="p-2 text-[10px] bg-white/5 rounded hover:bg-devee-red transition-colors">{f}</button>
              ))}
            </div>
          </div>
        )}

        <button 
          onClick={handleConvert} 
          disabled={!file || !selectedFormat || isConverting}
          className={`w-full mt-8 py-4 rounded-xl font-bold tracking-widest ${(!file || !selectedFormat) ? 'bg-white/5 text-white/10' : 'bg-devee-red text-white'}`}
        >
          {isConverting ? <div className="flex items-center justify-center gap-2"><Loader2 className="animate-spin" size={18} /> {progressMsg}</div> : "המר קובץ"}
        </button>
      </div>

      <footer className="mt-12 opacity-30 text-[9px] tracking-[0.3em] uppercase flex flex-col items-center gap-4">
        <p>Powered by deVee Boutique Label</p>
        <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/label_logo.jpg-vPg3UFlrczb9jCMrs4nyzOOJ7ozxYs.png" className="h-10 w-10 rounded-full" />
      </footer>
    </div>
  )
}