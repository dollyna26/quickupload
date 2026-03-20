import { useState, useRef, useCallback } from "react";

const ACCEPTED = {
  "image/jpeg":   { ext:"JPG",  icon:"🖼️",  color:"#E86519" },
  "image/png":    { ext:"PNG",  icon:"🖼️",  color:"#E86519" },
  "image/gif":    { ext:"GIF",  icon:"🎞️",  color:"#E86519" },
  "application/pdf":{ ext:"PDF", icon:"📄", color:"#C44D0E" },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
                  { ext:"DOCX", icon:"📝",  color:"#7A5C45" },
  "video/mp4":    { ext:"MP4",  icon:"🎬",  color:"#b45309" },
  "video/webm":   { ext:"WEBM", icon:"🎬",  color:"#b45309" },
  "audio/mpeg":   { ext:"MP3",  icon:"🎵",  color:"#92400e" },
  "audio/wav":    { ext:"WAV",  icon:"🎵",  color:"#92400e" },
};
const ACCEPT_STR = Object.keys(ACCEPTED).join(",");
const fmtSize = b =>
  b < 1024 ? `${b} B` : b < 1048576 ? `${(b/1024).toFixed(1)} KB` : `${(b/1048576).toFixed(1)} MB`;

const API = "http://localhost:5000";

// ── Real upload to Multer backend ──
function uploadToServer(stagedFile, onProgress) {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append("file", stagedFile.rawFile);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API}/api/upload`);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        const percent = Math.round((e.loaded / e.total) * 100);
        onProgress(percent);
      }
    };

    xhr.onload = () => {
      if (xhr.status === 200) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        reject(new Error("Upload failed"));
      }
    };

    xhr.onerror = () => reject(new Error("Network error — is server running?"));
    xhr.send(formData);
  });
}

/* ── Full-screen Preview Modal ── */
function PreviewModal({ file, onClose }) {
  if (!file) return null;
  const info = ACCEPTED[file.type] || { ext:"FILE", icon:"📁", color:"#7A5C45" };
  const isImage = file.type.startsWith("image/");
  const isAudio = file.type.startsWith("audio/");
  const isVideo = file.type.startsWith("video/");
  const isPDF   = file.type === "application/pdf";

  return (
    <div onClick={onClose} style={{
      position:"fixed",inset:0,zIndex:999,
      background:"rgba(20,10,4,0.82)",
      display:"flex",alignItems:"center",justifyContent:"center",
      padding:"24px",backdropFilter:"blur(6px)",
      animation:"fadeIn .2s ease",
    }}>
      <div onClick={e=>e.stopPropagation()} style={{
        background:"#FDFAF6",borderRadius:20,
        width:"100%",maxWidth:780,maxHeight:"90vh",overflow:"hidden",
        display:"flex",flexDirection:"column",
        boxShadow:"0 24px 80px rgba(20,10,4,.45)",
        animation:"popIn .25s ease",
      }}>
        {/* Header */}
        <div style={{
          display:"flex",alignItems:"center",justifyContent:"space-between",
          padding:"16px 20px",borderBottom:"1.5px solid #EDE7DC",flexShrink:0,
        }}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <span style={{
              fontSize:10,fontWeight:700,letterSpacing:".1em",
              color:info.color,background:`${info.color}18`,
              padding:"3px 8px",borderRadius:5,fontFamily:"monospace"
            }}>{info.ext}</span>
            <span style={{fontSize:14,fontWeight:600,color:"#2C1A0E",maxWidth:360,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
              {file.name}
            </span>
            <span style={{fontSize:11,color:"#C8B4A0"}}>{fmtSize(file.size)}</span>
          </div>
          <button onClick={onClose} style={{
            background:"#EFEAE2",border:"none",color:"#7A5C45",
            width:30,height:30,borderRadius:"50%",cursor:"pointer",
            fontSize:14,fontWeight:700,display:"flex",alignItems:"center",
            justifyContent:"center",transition:"background .15s,color .15s",flexShrink:0,
          }}
            onMouseEnter={e=>{ e.currentTarget.style.background="#E86519"; e.currentTarget.style.color="#fff"; }}
            onMouseLeave={e=>{ e.currentTarget.style.background="#EFEAE2"; e.currentTarget.style.color="#7A5C45"; }}
          >✕</button>
        </div>

        {/* Body */}
        <div style={{
          flex:1,overflow:"auto",display:"flex",alignItems:"center",
          justifyContent:"center",background:"#F4EFE8",padding:24,minHeight:0,
        }}>
          {isImage && file.preview && (
            <img src={file.preview} alt={file.name} style={{maxWidth:"100%",maxHeight:"65vh",borderRadius:10,objectFit:"contain",boxShadow:"0 8px 32px rgba(44,26,14,.18)"}}/>
          )}
          {isVideo && file.preview && (
            <video controls src={file.preview} style={{maxWidth:"100%",maxHeight:"65vh",borderRadius:10}}/>
          )}
          {isAudio && file.preview && (
            <div style={{background:"#FDFAF6",borderRadius:16,padding:"32px 40px",textAlign:"center",minWidth:300}}>
              <div style={{fontSize:56,marginBottom:16}}>{info.icon}</div>
              <p style={{fontSize:14,fontWeight:600,color:"#2C1A0E",marginBottom:4}}>{file.name}</p>
              <p style={{fontSize:12,color:"#C8B4A0",marginBottom:20}}>{fmtSize(file.size)}</p>
              <audio controls src={file.preview} style={{width:"100%",accentColor:"#E86519"}}/>
            </div>
          )}
          {isPDF && (
            <div style={{background:"#FDFAF6",borderRadius:16,padding:"40px",textAlign:"center"}}>
              <div style={{fontSize:64,marginBottom:16}}>📄</div>
              <p style={{fontSize:14,fontWeight:600,color:"#2C1A0E",marginBottom:6}}>{file.name}</p>
              <p style={{fontSize:12,color:"#C8B4A0"}}>{fmtSize(file.size)}</p>
            </div>
          )}
          {!isImage && !isVideo && !isAudio && !isPDF && (
            <div style={{textAlign:"center"}}>
              <div style={{fontSize:72,marginBottom:16}}>{info.icon}</div>
              <p style={{fontSize:14,fontWeight:600,color:"#2C1A0E"}}>{file.name}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Card Thumbnail ── */
function CardThumb({ file }) {
  const info = ACCEPTED[file.type] || { color:"#7A5C45", icon:"📁" };
  if (file.type.startsWith("image/") && file.preview)
    return <div style={{height:140,borderRadius:10,overflow:"hidden",background:"#EFEAE2"}}>
      <img src={file.preview} alt={file.name} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
    </div>;
  if (file.type.startsWith("video/") && file.preview)
    return <div style={{height:140,borderRadius:10,overflow:"hidden",background:"#1a1a1a",position:"relative"}}>
      <video src={file.preview} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
      <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,.35)"}}>
        <div style={{width:42,height:42,borderRadius:"50%",background:"rgba(255,255,255,.9)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>▶</div>
      </div>
    </div>;
  if (file.type.startsWith("audio/"))
    return <div style={{height:140,borderRadius:10,background:`linear-gradient(135deg,${info.color}22,${info.color}08)`,border:`1.5px solid ${info.color}25`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:8}}>
      <div style={{fontSize:44}}>{info.icon}</div>
      <span style={{fontSize:10,fontWeight:700,color:info.color,letterSpacing:".06em",fontFamily:"monospace"}}>AUDIO FILE</span>
    </div>;
  return <div style={{height:140,borderRadius:10,background:`linear-gradient(135deg,${info.color}22,${info.color}08)`,border:`1.5px solid ${info.color}25`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:8}}>
    <div style={{fontSize:48}}>{info.icon}</div>
    <span style={{fontSize:10,fontWeight:700,color:info.color,letterSpacing:".06em",fontFamily:"monospace"}}>{info.ext} FILE</span>
  </div>;
}

/* ── Staging Card ── */
function StagingCard({ file, onRemove, onPreview, onUploadOne }) {
  const info = ACCEPTED[file.type] || { ext:"FILE", color:"#7A5C45" };
  return (
    <div style={{background:"#FDFAF6",border:"1.5px solid #D4C4B0",borderRadius:16,overflow:"hidden",display:"flex",flexDirection:"column",boxShadow:"0 2px 10px rgba(44,26,14,.08)",animation:"popIn .25s ease",transition:"box-shadow .2s"}}
      onMouseEnter={e=>e.currentTarget.style.boxShadow="0 6px 20px rgba(44,26,14,.13)"}
      onMouseLeave={e=>e.currentTarget.style.boxShadow="0 2px 10px rgba(44,26,14,.08)"}
    >
      <div style={{position:"relative",padding:"12px 12px 0"}}>
        <CardThumb file={file}/>
        <button onClick={()=>onRemove(file.id)} style={{position:"absolute",top:18,right:18,width:26,height:26,borderRadius:"50%",background:"rgba(253,250,246,.9)",border:"none",color:"#7A5C45",cursor:"pointer",fontSize:12,display:"flex",alignItems:"center",justifyContent:"center",transition:"background .15s,color .15s",boxShadow:"0 1px 4px rgba(44,26,14,.15)"}}
          onMouseEnter={e=>{ e.currentTarget.style.background="#E86519"; e.currentTarget.style.color="#fff"; }}
          onMouseLeave={e=>{ e.currentTarget.style.background="rgba(253,250,246,.9)"; e.currentTarget.style.color="#7A5C45"; }}
        >✕</button>
      </div>
      <div style={{padding:"10px 14px 4px"}}>
        <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:2}}>
          <span style={{fontSize:9,fontWeight:700,letterSpacing:".1em",color:info.color,background:`${info.color}18`,padding:"2px 7px",borderRadius:4,fontFamily:"monospace",flexShrink:0}}>{info.ext}</span>
          <span style={{fontSize:12,fontWeight:500,color:"#2C1A0E",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{file.name}</span>
        </div>
        <span style={{fontSize:11,color:"#C8B4A0"}}>{fmtSize(file.size)}</span>
      </div>
      <div style={{display:"flex",gap:8,padding:"10px 14px 14px"}}>
        <button onClick={()=>onPreview(file)} style={{flex:1,padding:"8px 0",borderRadius:9,background:"#EFEAE2",border:"1.5px solid #D4C4B0",color:"#7A5C45",fontSize:12,fontWeight:600,cursor:"pointer",transition:"all .18s",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:5}}
          onMouseEnter={e=>{ e.currentTarget.style.background="#E8DDD0"; e.currentTarget.style.color="#2C1A0E"; }}
          onMouseLeave={e=>{ e.currentTarget.style.background="#EFEAE2"; e.currentTarget.style.color="#7A5C45"; }}
        ><span>👁</span> Preview</button>
        <button onClick={()=>onUploadOne(file)} style={{flex:1,padding:"8px 0",borderRadius:9,background:"linear-gradient(135deg,#E86519,#C44D0E)",border:"none",color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer",transition:"opacity .18s,transform .15s",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:5,boxShadow:"0 2px 8px #E8651935"}}
          onMouseEnter={e=>{ e.currentTarget.style.opacity=".88"; e.currentTarget.style.transform="translateY(-1px)"; }}
          onMouseLeave={e=>{ e.currentTarget.style.opacity="1";   e.currentTarget.style.transform="translateY(0)"; }}
        ><span>⚡</span> Upload</button>
      </div>
    </div>
  );
}

/* ── Uploaded Card ── */
function UploadedCard({ file, onRemove, onPreview }) {
  const info = ACCEPTED[file.type] || { ext:"FILE", color:"#7A5C45" };
  const done  = file.progress === 100;
  const error = file.error;
  return (
    <div style={{background:"#FDFAF6",border:`1.5px solid ${error?"#fca5a5":done?"#86efac":"#D4C4B0"}`,borderRadius:16,overflow:"hidden",display:"flex",flexDirection:"column",boxShadow:"0 2px 10px rgba(44,26,14,.08)",transition:"border-color .3s,box-shadow .2s",animation:"popIn .25s ease"}}
      onMouseEnter={e=>e.currentTarget.style.boxShadow="0 6px 20px rgba(44,26,14,.13)"}
      onMouseLeave={e=>e.currentTarget.style.boxShadow="0 2px 10px rgba(44,26,14,.08)"}
    >
      <div style={{position:"relative",padding:"12px 12px 0"}}>
        <CardThumb file={file}/>
        <button onClick={()=>onRemove(file.id)} style={{position:"absolute",top:18,right:18,width:26,height:26,borderRadius:"50%",background:"rgba(253,250,246,.9)",border:"none",color:"#7A5C45",cursor:"pointer",fontSize:12,display:"flex",alignItems:"center",justifyContent:"center",transition:"background .15s,color .15s",boxShadow:"0 1px 4px rgba(44,26,14,.15)"}}
          onMouseEnter={e=>{ e.currentTarget.style.background="#E86519"; e.currentTarget.style.color="#fff"; }}
          onMouseLeave={e=>{ e.currentTarget.style.background="rgba(253,250,246,.9)"; e.currentTarget.style.color="#7A5C45"; }}
        >✕</button>
      </div>
      <div style={{padding:"10px 14px 4px"}}>
        <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:2}}>
          <span style={{fontSize:9,fontWeight:700,letterSpacing:".1em",color:info.color,background:`${info.color}18`,padding:"2px 7px",borderRadius:4,fontFamily:"monospace",flexShrink:0}}>{info.ext}</span>
          <span style={{fontSize:12,fontWeight:500,color:"#2C1A0E",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{file.name}</span>
        </div>
        <span style={{fontSize:11,color:"#C8B4A0"}}>{fmtSize(file.size)}</span>
        {/* Server URL */}
        {done && file.serverUrl && (
          <a href={file.serverUrl} target="_blank" rel="noreferrer" style={{fontSize:10,color:"#E86519",display:"block",marginTop:4,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
            🔗 {file.serverUrl}
          </a>
        )}
      </div>
      {!error && (
        <div style={{padding:"6px 14px 0"}}>
          <div style={{height:4,background:"#EFEAE2",borderRadius:99,overflow:"hidden"}}>
            <div style={{height:"100%",borderRadius:99,background:done?"linear-gradient(90deg,#4ade80,#22c55e)":"linear-gradient(90deg,#E86519,#F97316)",width:`${file.progress}%`,transition:"width .1s linear,background .5s"}}/>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",marginTop:4}}>
            <span style={{fontSize:10,color:done?"#16a34a":"#C8B4A0",fontWeight:done?600:400}}>{done?"✓ Saved to server":"Uploading…"}</span>
            <span style={{fontSize:10,color:"#C8B4A0",fontFamily:"monospace"}}>{file.progress}%</span>
          </div>
        </div>
      )}
      {error && <div style={{margin:"6px 14px 0",fontSize:11,color:"#dc2626",background:"#fee2e2",borderRadius:6,padding:"4px 8px"}}>✗ {error}</div>}
      <div style={{padding:"10px 14px 14px"}}>
        <button onClick={()=>onPreview(file)} style={{width:"100%",padding:"8px 0",borderRadius:9,background:"#EFEAE2",border:"1.5px solid #D4C4B0",color:"#7A5C45",fontSize:12,fontWeight:600,cursor:"pointer",transition:"all .18s",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:5}}
          onMouseEnter={e=>{ e.currentTarget.style.background="#E8DDD0"; e.currentTarget.style.color="#2C1A0E"; }}
          onMouseLeave={e=>{ e.currentTarget.style.background="#EFEAE2"; e.currentTarget.style.color="#7A5C45"; }}
        ><span>👁</span> Preview</button>
      </div>
    </div>
  );
}

/* ── Server Files Panel ── */
function ServerFilesPanel({ files, onClose }) {
  return (
    <div style={{position:"fixed",inset:0,zIndex:998,background:"rgba(20,10,4,0.7)",display:"flex",alignItems:"center",justifyContent:"center",padding:24,backdropFilter:"blur(4px)"}} onClick={onClose}>
      <div style={{background:"#FDFAF6",borderRadius:20,width:"100%",maxWidth:640,maxHeight:"80vh",overflow:"hidden",display:"flex",flexDirection:"column",boxShadow:"0 24px 80px rgba(20,10,4,.4)",animation:"popIn .25s ease"}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"16px 20px",borderBottom:"1.5px solid #EDE7DC"}}>
          <span style={{fontSize:15,fontWeight:700,color:"#2C1A0E"}}>📁 Saved on Server ({files.length})</span>
          <button onClick={onClose} style={{background:"#EFEAE2",border:"none",color:"#7A5C45",width:30,height:30,borderRadius:"50%",cursor:"pointer",fontSize:14,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center"}}
            onMouseEnter={e=>{ e.currentTarget.style.background="#E86519"; e.currentTarget.style.color="#fff"; }}
            onMouseLeave={e=>{ e.currentTarget.style.background="#EFEAE2"; e.currentTarget.style.color="#7A5C45"; }}
          >✕</button>
        </div>
        <div style={{overflow:"auto",padding:16,display:"flex",flexDirection:"column",gap:8}}>
          {files.length === 0 && <p style={{textAlign:"center",color:"#C8B4A0",padding:32}}>No files saved yet</p>}
          {files.map((f,i) => (
            <div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 14px",background:"#F4EFE8",borderRadius:10,border:"1px solid #E8DDD0"}}>
              <div style={{overflow:"hidden"}}>
                <p style={{fontSize:13,fontWeight:500,color:"#2C1A0E",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{f.filename}</p>
                <p style={{fontSize:11,color:"#C8B4A0",marginTop:2}}>{fmtSize(f.size)}</p>
              </div>
              <a href={f.url} target="_blank" rel="noreferrer" style={{fontSize:11,color:"#E86519",fontWeight:600,textDecoration:"none",marginLeft:12,flexShrink:0}}>Open ↗</a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ══ MAIN ══ */
export default function QuickUpload() {
  const [staged,      setStaged]      = useState([]);
  const [files,       setFiles]       = useState([]);
  const [dragging,    setDragging]    = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [serverFiles, setServerFiles] = useState([]);
  const [showServer,  setShowServer]  = useState(false);
  const inputRef  = useRef();
  const dragCount = useRef(0);

  // Fetch all files from server
  const fetchServerFiles = async () => {
    try {
      const res  = await fetch(`${API}/api/files`);
      const data = await res.json();
      setServerFiles(data.files || []);
      setShowServer(true);
    } catch {
      alert("Server se connect nahi ho paya! Kya server chal raha hai?");
    }
  };

  const stageFiles = useCallback(rawFiles => {
    const next = Array.from(rawFiles).filter(f=>ACCEPTED[f.type]).map(f=>({
      id:`${Date.now()}-${Math.random()}`,
      name:f.name, size:f.size, type:f.type,
      rawFile: f,
      preview:(f.type.startsWith("image/")||f.type.startsWith("audio/")||f.type.startsWith("video/"))
        ? URL.createObjectURL(f) : null,
    }));
    if (!next.length) return;
    setStaged(p=>[...p,...next]);
  },[]);

  const uploadOne = useCallback(stagedFile => {
    const toUpload = { ...stagedFile, progress:0, error:null, serverUrl:null };
    setStaged(p=>p.filter(f=>f.id!==stagedFile.id));
    setFiles(p=>[...p,toUpload]);

    uploadToServer(toUpload, (progress) => {
      setFiles(p=>p.map(x=>x.id===toUpload.id?{...x,progress}:x));
    })
    .then(res => {
      setFiles(p=>p.map(x=>x.id===toUpload.id
        ? {...x, progress:100, serverUrl:res.file.url}
        : x
      ));
    })
    .catch(err => {
      setFiles(p=>p.map(x=>x.id===toUpload.id
        ? {...x, error:err.message}
        : x
      ));
    });
  },[]);

  const onDrop      = useCallback(e=>{ e.preventDefault(); dragCount.current=0; setDragging(false); stageFiles(e.dataTransfer.files); },[stageFiles]);
  const onDragEnter = e=>{ e.preventDefault(); dragCount.current++; setDragging(true); };
  const onDragLeave = e=>{ e.preventDefault(); dragCount.current--; if(!dragCount.current) setDragging(false); };
  const onDragOver  = e=> e.preventDefault();

  const removeStaged   = id => setStaged(p=>p.filter(f=>f.id!==id));
  const removeUploaded = id => setFiles(p=>p.filter(f=>f.id!==id));
  const allDone = files.length>0 && files.every(f=>f.progress===100);

  return (
    <div style={{minHeight:"100vh",background:"#F8F4EF",fontFamily:"'Plus Jakarta Sans','Helvetica Neue',sans-serif",color:"#2C1A0E"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Syne:wght@700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::selection{background:#E8651933}
        @keyframes popIn  { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes shimmer{ from{background-position:200% center} to{background-position:-200% center} }
      `}</style>

      {previewFile && <PreviewModal file={previewFile} onClose={()=>setPreviewFile(null)}/>}
      {showServer  && <ServerFilesPanel files={serverFiles} onClose={()=>setShowServer(false)}/>}

      {/* NAV */}
      <nav style={{background:"#FDFAF6",borderBottom:"1.5px solid #E8DDD0",padding:"0 clamp(16px,4vw,40px)",height:58,display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:50,boxShadow:"0 1px 8px rgba(44,26,14,.06)"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:34,height:34,borderRadius:9,background:"linear-gradient(135deg,#E86519,#C44D0E)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,boxShadow:"0 2px 8px #E8651944",flexShrink:0}}>⚡</div>
          <span style={{fontFamily:"'Syne',sans-serif",fontSize:20,fontWeight:800,letterSpacing:"-0.04em",background:"linear-gradient(100deg,#C44D0E 0%,#E86519 50%,#F97316 100%)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundSize:"200% auto",animation:"shimmer 4s linear infinite"}}>QUICKUPLOAD</span>
        </div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={fetchServerFiles} style={{background:"#EFEAE2",border:"1.5px solid #D4C4B0",color:"#7A5C45",fontSize:12,fontWeight:600,padding:"7px 14px",borderRadius:9,cursor:"pointer",transition:"all .18s",fontFamily:"inherit"}}
            onMouseEnter={e=>{ e.currentTarget.style.borderColor="#E86519"; e.currentTarget.style.color="#E86519"; }}
            onMouseLeave={e=>{ e.currentTarget.style.borderColor="#D4C4B0"; e.currentTarget.style.color="#7A5C45"; }}
          >📁 Saved Files</button>
          <button onClick={()=>inputRef.current?.click()} style={{background:"linear-gradient(135deg,#E86519,#C44D0E)",color:"#fff",border:"none",fontSize:12,fontWeight:700,padding:"8px 16px",borderRadius:9,cursor:"pointer",boxShadow:"0 2px 8px #E8651944",transition:"opacity .2s,transform .15s"}}
            onMouseEnter={e=>{ e.currentTarget.style.opacity=".88"; e.currentTarget.style.transform="translateY(-1px)"; }}
            onMouseLeave={e=>{ e.currentTarget.style.opacity="1";   e.currentTarget.style.transform="translateY(0)"; }}
          >+ Add Files</button>
        </div>
      </nav>

      <main style={{maxWidth:800,margin:"0 auto",padding:"clamp(28px,5vw,52px) clamp(16px,4vw,28px)"}}>

        {/* Hero */}
        <div style={{marginBottom:32,animation:"popIn .4s ease"}}>
          <p style={{fontSize:12,fontWeight:700,color:"#E86519",letterSpacing:".1em",textTransform:"uppercase",marginBottom:10}}>Fast · Simple · Beautiful</p>
          <h1 style={{fontFamily:"'Syne',sans-serif",fontSize:"clamp(30px,6vw,48px)",fontWeight:800,letterSpacing:"-0.04em",color:"#2C1A0E",lineHeight:1.1,marginBottom:12}}>
            Upload anything,<br/><span style={{color:"#E86519"}}>instantly.</span>
          </h1>
          <p style={{fontSize:14,color:"#7A5C45",lineHeight:1.65,maxWidth:480}}>
            Drop files to preview — then hit <strong style={{color:"#E86519"}}>Upload</strong> to save them to the server.
          </p>
        </div>

        {/* Drop Zone */}
        <div onDrop={onDrop} onDragOver={onDragOver} onDragEnter={onDragEnter} onDragLeave={onDragLeave} onClick={()=>inputRef.current?.click()} style={{border:`2px dashed ${dragging?"#E86519":"#D4C4B0"}`,borderRadius:20,padding:"clamp(32px,6vw,50px) 24px",textAlign:"center",cursor:"pointer",background:dragging?"#E8651908":"#FDFAF6",transition:"all .22s ease",marginBottom:36,position:"relative",boxShadow:dragging?"0 0 0 5px #E8651915,0 4px 24px rgba(232,101,25,.12)":"0 2px 12px rgba(44,26,14,.06)"}}>
          {[{t:12,l:12,bt:"borderTop",bb:"borderLeft"},{t:12,r:12,bt:"borderTop",bb:"borderRight"},{b:12,l:12,bt:"borderBottom",bb:"borderLeft"},{b:12,r:12,bt:"borderBottom",bb:"borderRight"}].map((s,i)=>(
            <div key={i} style={{position:"absolute",top:s.t,bottom:s.b,left:s.l,right:s.r,width:18,height:18,[s.bt]:`2px solid ${dragging?"#E86519":"#C8B4A0"}`,[s.bb]:`2px solid ${dragging?"#E86519":"#C8B4A0"}`,borderRadius:2,transition:"border-color .22s",pointerEvents:"none"}}/>
          ))}
          <div style={{width:68,height:68,borderRadius:"50%",background:dragging?"linear-gradient(135deg,#E8651922,#F9731622)":"#EFEAE2",border:`2px solid ${dragging?"#E8651944":"#D4C4B0"}`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 18px",fontSize:28,transition:"all .22s",transform:dragging?"scale(1.1)":"scale(1)",boxShadow:dragging?"0 4px 16px #E8651928":"none"}}>{dragging?"📂":"☁️"}</div>
          <p style={{fontSize:17,fontWeight:700,color:dragging?"#E86519":"#2C1A0E",marginBottom:6,transition:"color .2s"}}>{dragging?"Release to add files":"Drop files to preview"}</p>
          <p style={{fontSize:13,color:"#7A5C45",marginBottom:22}}>or <span style={{color:"#E86519",fontWeight:600,borderBottom:"1.5px solid #E8651966",paddingBottom:1}}>browse from device</span></p>
          <div style={{display:"flex",justifyContent:"center",gap:6,flexWrap:"wrap"}}>
            {[["JPG","PNG","GIF","#E86519"],["PDF","DOCX","#C44D0E"],["MP4","MP3","WAV","#92400e"]].flatMap(row=>{
              const color=row[row.length-1];
              return row.slice(0,-1).map(ext=>(<span key={ext} style={{fontSize:10,fontWeight:700,letterSpacing:".07em",color,background:`${color}14`,border:`1px solid ${color}30`,padding:"3px 9px",borderRadius:6,fontFamily:"monospace"}}>{ext}</span>));
            })}
          </div>
          <input ref={inputRef} type="file" multiple accept={ACCEPT_STR} onChange={e=>stageFiles(e.target.files)} style={{display:"none"}}/>
        </div>

        {/* Staging Area */}
        {staged.length > 0 && (
          <div style={{marginBottom:40,animation:"popIn .3s ease"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
              <span style={{fontSize:11,fontWeight:700,color:"#C8B4A0",letterSpacing:".1em",textTransform:"uppercase",fontFamily:"monospace"}}>Pending — {staged.length} file{staged.length>1?"s":""}</span>
              <button onClick={()=>setStaged([])} style={{background:"none",border:"1.5px solid #D4C4B0",color:"#7A5C45",fontSize:11,fontWeight:600,padding:"5px 12px",borderRadius:8,cursor:"pointer",transition:"all .18s",fontFamily:"inherit"}}
                onMouseEnter={e=>{ e.currentTarget.style.borderColor="#E86519"; e.currentTarget.style.color="#E86519"; e.currentTarget.style.background="#E8651908"; }}
                onMouseLeave={e=>{ e.currentTarget.style.borderColor="#D4C4B0"; e.currentTarget.style.color="#7A5C45";  e.currentTarget.style.background="none"; }}
              >Discard all</button>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(min(100%,210px),1fr))",gap:16}}>
              {staged.map(f=><StagingCard key={f.id} file={f} onRemove={removeStaged} onPreview={setPreviewFile} onUploadOne={uploadOne}/>)}
            </div>
          </div>
        )}

        {/* Uploaded Files */}
        {files.length > 0 && (
          <div style={{animation:"popIn .3s ease"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:11,fontWeight:700,color:"#C8B4A0",letterSpacing:".1em",textTransform:"uppercase",fontFamily:"monospace"}}>Uploads — {files.length}</span>
                {allDone && <span style={{fontSize:10,fontWeight:700,color:"#16a34a",background:"#dcfce7",border:"1px solid #86efac",borderRadius:99,padding:"2px 8px",animation:"fadeIn .3s ease"}}>✓ All done</span>}
              </div>
              <button onClick={()=>setFiles([])} style={{background:"none",border:"1.5px solid #D4C4B0",color:"#7A5C45",fontSize:11,fontWeight:600,padding:"5px 12px",borderRadius:8,cursor:"pointer",transition:"all .18s",fontFamily:"inherit"}}
                onMouseEnter={e=>{ e.currentTarget.style.borderColor="#E86519"; e.currentTarget.style.color="#E86519"; e.currentTarget.style.background="#E8651908"; }}
                onMouseLeave={e=>{ e.currentTarget.style.borderColor="#D4C4B0"; e.currentTarget.style.color="#7A5C45";  e.currentTarget.style.background="none"; }}
              >Clear all</button>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(min(100%,210px),1fr))",gap:16}}>
              {files.map(f=><UploadedCard key={f.id} file={f} onRemove={removeUploaded} onPreview={setPreviewFile}/>)}
            </div>
            {allDone && (
              <div style={{marginTop:24,padding:"14px 18px",background:"#f0fdf4",border:"1.5px solid #86efac",borderRadius:14,display:"flex",alignItems:"center",gap:12,animation:"popIn .3s ease"}}>
                <div style={{width:36,height:36,borderRadius:"50%",background:"#dcfce7",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>✅</div>
                <div>
                  <p style={{fontSize:13,fontWeight:700,color:"#15803d"}}>All {files.length} file{files.length>1?"s":""} saved to server!</p>
                  <p style={{fontSize:11,color:"#4ade80",marginTop:2}}>Check server/uploads folder or click "Saved Files" in navbar</p>
                </div>
              </div>
            )}
          </div>
        )}

        {files.length===0 && staged.length===0 && (
          <div style={{textAlign:"center",padding:"4px 0 24px",animation:"fadeIn .5s ease .2s both"}}>
            <p style={{fontSize:12,color:"#C8B4A0"}}>Files saved to server/uploads folder · 50MB limit per file</p>
          </div>
        )}
      </main>
    </div>
  );
}
