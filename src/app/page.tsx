"use client"

import { useState, useRef, useEffect } from "react"
import { Upload, ChevronDown, Loader2, Check, FileAudio, FileVideo, FileImage } from "lucide-react"

export default function FileConverterPage() {
  const [file, setFile] = useState<File | null>(null)
  const [selectedFormat, setSelectedFormat] = useState("")
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isConverting, setIsConverting] = useState(false)
  const [progressMsg, setProgressMsg] = useState("ממיר קובץ...")
  const [mounted, setMounted] = useState(false)
  
  const ffmpegRef = useRef<any>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  // פונקציית ההמרה - לא נגעתי בה, היא נשארת ב"Bypass" המנצח
  const loadFFmpeg = async () => {
    if (ffmpegRef.current && ffmpegRef.current.loaded) return ffmpegRef.current;
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
      // רשימת פורמטי תמונות כדי לדעת למי לשלוח לשרת הפייתון
      const imageFormats = ["JPG", "PNG", "WEBP", "GIF"];
      const isImage = imageFormats.includes(selectedFormat.toUpperCase());
      
      if (isImage) {
        setProgressMsg("ממיר תמונה בשרת...")
        const formData = new FormData()
        formData.append('file', file)
        formData.append('format', selectedFormat)
        const response = await fetch('/api/convert', { method: 'POST', body: formData })
        if (!response.ok) throw new Error("Server conversion failed")
        downloadFile(await response.blob(), selectedFormat)
      } else {
        // טעינת מנוע האודיו/וידאו רק ברגע האמת
        const { fetchFile } = await import("@ffmpeg/util")
        setProgressMsg("טוען מנוע מדיה...")
        const ffmpeg = await loadFFmpeg();
        
        setProgressMsg("קורא קובץ...")
        await ffmpeg.writeFile(file.name, await fetchFile(file))
        
        setProgressMsg("מעבד מדיה (זה יכול לקחת רגע)...")
        const outputName = `output.${selectedFormat.toLowerCase()}`
        await ffmpeg.exec(['-i', file.name, outputName])
        
        setProgressMsg("מייצא קובץ...")
        const data = await ffmpeg.readFile(outputName)
        downloadFile(new Blob([data as any]), selectedFormat)
      }
    } catch (e) {
      console.error(e)
      alert("התרחשה שגיאה במהלך ההמרה. נסה לרענן את הדף.")
    } finally {
      setIsConverting(false)
      setProgressMsg("ממיר קובץ...")
    }
  }

  const downloadFile = (blob: Blob, format: string) => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    // ניקוי שם הקובץ המקורי מסיומות
    const cleanName = file?.name.split('.').slice(0, -1).join('.') || 'file';
    a.download = `deVee_tools_${cleanName}.${format.toLowerCase()}`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  // מונע מהשרת לנסות להציג את הדף לפני שהוא מוכן בדפדפן
  if (!mounted) return <div className="min-h-screen bg-[#0a0a0a]" />

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col relative overflow-hidden font-sans" dir="rtl">
      
      {/* Background Glows (UI Only) */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#b22222]/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 left-1/3 w-[400px] h-[400px] bg-[#b22222]/5 rounded-full blur-[100px]" />
      </div>

      <header className="relative z-10 pt-12 pb-4 flex flex-col items-center">
        <div className="relative group">
          <div className="absolute inset-0 bg-[#b22222]/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700" />
          <img 
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/app_logo-aYPTnKATSOGLPTmF7VmPsJPmCkh6HF.png" 
            alt="deVee File Converter" 
            crossOrigin="anonymous" // התיקון כאן! מאשר לתמונה להיטען
            className="h-20 w-auto relative z-10 drop-shadow-[0_0_20px_rgba(178,34,34,0.3)]" 
          />
        </div>
        <h1 className="mt-4 text-[10px] font-light tracking-[0.4em] text-white/40 uppercase">File Converter</h1>
      </header>

      <main className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-xl bg-white/[0.03] backdrop-blur-3xl rounded-[2.5rem] p-10 space-y-8 border border-white/5 shadow-2xl relative z-20">
          
          {/* Dropzone */}
          <div 
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setIsDragOver(false); setFile(e.dataTransfer.files[0]); }}
            className={`relative border-2 border-dashed rounded-2xl p-12 transition-all duration-500 flex flex-col items-center gap-4 cursor-pointer z-10
              ${file ? 'border-[#b22222]/50 bg-[#b22222]/5 scale-[1.01]' : 'border-white/10 hover:border-[#b22222]/30 hover:bg-white/[0.02]'}`}
          >
            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer z-20" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${file ? 'bg-[#b22222]/20' : 'bg-white/5 shadow-inner'}`}>
              {file ? <Check className="text-[#b22222] w-8 h-8" /> : <Upload className="text-white/20 w-8 h-8" />}
            </div>
            <div className="text-center z-10">
              <p className="text-xl font-light tracking-wide">{file ? file.name : "גרור קובץ לכאן"}</p>
              <p className="text-xs text-white/30 mt-2 font-mono">{file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : "או לחץ לבחירה מהמחשב"}</p>
            </div>
          </div>

          {/* Format Selector */}
          <div className="relative z-[999]">
            <button 
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)} 
              className="w-full bg-white/[0.03] border border-white/10 p-5 rounded-2xl flex items-center justify-between hover:bg-white/5 transition-all groupursor-pointer relative z-[999]"
            >
              <ChevronDown className={`w-5 h-5 text-white/30 transition-transform duration-500 ${isDropdownOpen ? 'rotate-180 text-[#b22222]' : ''}`} />
              <span className={`tracking-wide ${selectedFormat ? "text-white" : "text-white/30"}`}>{selectedFormat || "בחר פורמט יעד"}</span>
            </button>
            
            {isDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-3 bg-[#0f0f0f] border border-white/10 rounded-2xl z-[999] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="p-3 grid grid-cols-4 gap-2" dir="ltr">
                  {["MP3", "WAV", "FLAC", "AAC", "OGG", "M4A", "MP4", "MOV", "AVI", "MKV", "WEBM", "PNG", "JPG", "WEBP", "GIF", "SVG"].map(f => (
                    <button 
                      key={f} 
                      type="button"
                      onClick={(e) => { 
                        e.preventDefault();
                        e.stopPropagation();
                        setSelectedFormat(f); 
                        setIsDropdownOpen(false); 
                      }} 
                      className={`p-3 rounded-xl text-[10px] font-mono border transition-all relative hover:scale-105 active:scale-95
                        ${selectedFormat === f ? 'bg-[#b22222] border-[#b22222] text-white shadow-[0_0_15px_rgba(178,34,34,0.3)]' : 'bg-white/5 border-transparent text-white/60 hover:border-white/20 hover:text-white hover:bg-white/10'}`}>
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Convert Button */}
          <button 
            type="button"
            onClick={handleConvert} 
            disabled={!file || !selectedFormat || isConverting}
            className={`w-full py-5 rounded-2xl font-bold tracking-[0.3em] uppercase transition-all duration-500 relative z-10
              ${(!file || !selectedFormat) ? 'bg-white/5 text-white/10 cursor-not-allowed' : 'bg-[#b22222] text-white hover:shadow-[0_0_40px_rgba(178,34,34,0.4)] hover:scale-[1.01] active:scale-[0.98]'}`}
          >
            {isConverting ? <div className="flex items-center justify-center gap-3"><Loader2 className="animate-spin" size={20} /> <span>{progressMsg}</span></div> : "בצע המרה"}
          </button>
        </div>
      </main>

      <footer className="relative z-10 py-12 flex flex-col items-center gap-4">
        <p className="text-[10px] tracking-[0.2em] text-white/30 uppercase">Powered by deVee Boutique Label</p>
        <div className="relative group">
           <div className="absolute inset-0 bg-[#b22222]/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-all duration-1000" />
           <img 
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/label_logo.jpg-vPg3UFlrczb9jCMrs4nyzOOJ7ozxYs.png" 
            alt="deVee Label Logo" 
            crossOrigin="anonymous" // התיקון גם כאן!
            className="h-14 w-14 rounded-full border border-white/10 opacity-70 transition-all duration-1000 group-hover:opacity-100 group-hover:border-white/20 object-cover cursor-pointer"
          />
        </div>
      </footer>
    </div>
  )
}