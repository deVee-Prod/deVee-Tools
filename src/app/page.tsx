"use client"

import { useState, useCallback } from "react"
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

  const handleConvert = async () => {
    if (!file || !selectedFormat) return
    setIsConverting(true)
    setIsComplete(false)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('format', selectedFormat)

    try {
      const response = await fetch('/api/convert', { method: 'POST', body: formData })
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        const cleanFileName = file.name.split('.').slice(0, -1).join('.');
        const newFileName = `deVee_${cleanFileName}.${selectedFormat.toLowerCase()}`;
        a.download = newFileName
        document.body.appendChild(a)
        a.click()
        a.remove()
        setIsComplete(true)
      } else {
        alert("שגיאת המרה: כרגע המנוע תומך בתמונות בלבד (JPG/PNG). שדרוג אודיו בדרך!")
      }
    } catch (e) { 
      console.error(e) 
    }
    finally { setIsConverting(false) }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col relative overflow-hidden font-sans" dir="rtl">
      
      {/* Background Glows for depth */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-devee-red/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 left-1/3 w-[400px] h-[400px] bg-devee-red/5 rounded-full blur-[100px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 pt-12 pb-4 flex flex-col items-center">
        <div className="relative group">
          <div className="absolute inset-0 bg-devee-red/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
          <img 
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/app_logo-aYPTnKATSOGLPTmF7VmPsJPmCkh6HF.png" 
            alt="deVee" 
            className="h-20 w-auto relative z-10 drop-shadow-[0_0_20px_rgba(178,34,34,0.3)]"
          />
        </div>
        <h1 className="mt-4 text-sm font-light tracking-[0.4em] text-white/50 uppercase">File Converter</h1>
      </header>

      {/* Main Module */}
      <main className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-xl glass-module red-glow-ui rounded-[2.5rem] p-10 space-y-8 border border-white/5 relative z-20">
          
          {/* Dropzone */}
          <div 
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setIsDragOver(false); setFile(e.dataTransfer.files[0]); setIsComplete(false); }}
            className={`relative border-2 border-dashed rounded-2xl p-12 transition-all duration-500 flex flex-col items-center gap-4 cursor-pointer z-10
              ${isDragOver ? 'border-devee-red bg-devee-red/10 scale-[1.01]' : 'border-white/10 hover:border-devee-red/40 hover:bg-white/[0.02]'}`}
          >
            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer z-20" onChange={(e) => { setFile(e.target.files?.[0] || null); setIsComplete(false); setIsDropdownOpen(false); }} />
            <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${file ? 'bg-devee-red/20 rotate-0' : 'bg-white/5 shadow-inner'}`}>
              {file ? <Check className="text-devee-red w-8 h-8" /> : <Upload className="text-white/30 w-8 h-8" />}
            </div>
            <div className="text-center">
              <p className="text-xl font-light tracking-wide">{file ? file.name : "גרור קובץ לכאן"}</p>
              <p className="text-xs text-white/30 mt-2 font-mono">{file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : "או לחץ לבחירה מהמחשב"}</p>
            </div>
          </div>

          {/* Format Selector - התיקון הגדול כאן */}
          <div className="relative z-[999]">
            <button 
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full bg-white/[0.03] border border-white/10 p-5 rounded-2xl flex items-center justify-between hover:bg-white/5 transition-all group cursor-pointer relative z-[999]"
            >
              <ChevronDown className={`w-5 h-5 text-white/30 transition-transform duration-500 ${isDropdownOpen ? 'rotate-180 text-devee-red' : ''}`} />
              <span className={`tracking-wide ${selectedFormat ? "text-white" : "text-white/30"}`}>{selectedFormat || "בחר פורמט יעד"}</span>
            </button>
            
            {isDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-3 bg-[#0f0f0f] border border-white/10 rounded-2xl z-[999] shadow-2xl animate-in fade-in slide-in-from-top-2 duration-300 max-h-[250px] overflow-y-auto scrollbar-thin scrollbar-thumb-devee-red/50 scrollbar-track-transparent">
                {Object.entries(formatCategories).map(([key, cat]) => (
                  <div key={key} className="border-b border-white/5 last:border-0 relative">
                    <div className="px-5 py-3 bg-white/[0.02] flex items-center justify-end gap-3 text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] sticky top-0 z-10 backdrop-blur-md">
                      {cat.label} <cat.icon size={14} className="text-devee-red/60" />
                    </div>
                    <div className="grid grid-cols-4 gap-2 p-3" dir="ltr">
                      {cat.formats.map(f => (
                        <button 
                          key={f} 
                          type="button"
                          onClick={(e) => { 
                            e.preventDefault();
                            e.stopPropagation();
                            setSelectedFormat(f); 
                            setIsDropdownOpen(false); 
                          }}
                          className={`p-2.5 rounded-xl text-[11px] font-mono transition-all border cursor-pointer relative hover:scale-105 active:scale-95 ${selectedFormat === f ? 'bg-devee-red border-devee-red text-white shadow-[0_0_15px_rgba(178,34,34,0.3)]' : 'bg-white/5 border-transparent text-white/60 hover:border-white/20 hover:text-white hover:bg-white/10'}`}>
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
            onClick={handleConvert}
            disabled={!file || !selectedFormat || isConverting}
            className={`w-full py-5 rounded-2xl font-bold tracking-[0.3em] uppercase transition-all duration-500 relative z-10
              ${(!file || !selectedFormat) 
                ? 'bg-white/5 text-white/10 cursor-not-allowed' 
                : 'bg-devee-red text-white hover:shadow-[0_0_40px_rgba(178,34,34,0.4)] hover:scale-[1.01] active:scale-[0.98]'}`}
          >
            {isConverting ? (
              <div className="flex items-center justify-center gap-3">
                <Loader2 className="animate-spin w-5 h-5" />
                <span className="text-sm">ממיר קובץ...</span>
              </div>
            ) : isComplete ? "המר קובץ" : "המר קובץ"}
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-0 py-12 flex flex-col items-center gap-5 pointer-events-none">
        <div className="flex flex-col items-center gap-2">
          <p className="text-[11px] tracking-widest text-white/50 font-medium">
            Powered by deVee Boutique Label
          </p>
        </div>
        <div className="relative group pointer-events-auto">
           <div className="absolute inset-0 bg-devee-red/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-all duration-1000" />
           <img 
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/label_logo.jpg-vPg3UFlrczb9jCMrs4nyzOOJ7ozxYs.png" 
            alt="deVee Label Logo" 
            className="h-16 w-16 rounded-full border border-white/10 transition-all duration-1000 object-cover cursor-pointer"
          />
        </div>
      </footer>
    </div>
  )
}