const stamp=(seconds,ass=false)=>{
 const ms=Math.round(seconds*1000),h=Math.floor(ms/3600000),m=Math.floor(ms/60000)%60,s=Math.floor(ms/1000)%60;
 return ass?`${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}.${String(Math.floor(ms%1000/10)).padStart(2,'0')}`:`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')},${String(ms%1000).padStart(3,'0')}`;
};
export function srt(cues){return cues.map((c,i)=>`${i+1}\n${stamp(c.start)} --> ${stamp(c.end)}\n${c.text.replace(/\r/g,'')}\n`).join('\n');}
export function ass(cues,width,height,fontFamily='Arial'){
 if(typeof fontFamily!=='string'||!fontFamily.trim()||/[,\\{}\r\n]/.test(fontFamily))throw new Error('Invalid subtitle font family');
 const header=`[Script Info]\nScriptType: v4.00+\nPlayResX: ${width}\nPlayResY: ${height}\nWrapStyle: 0\n\n[V4+ Styles]\nFormat: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding\nStyle: Default,${fontFamily},${Math.round(height*.05)},&H00FFFFFF,&H00FFFFFF,&H00101010,&H80000000,0,0,0,0,100,100,0,0,1,2,1,2,20,20,${Math.round(height*.07)},1\n\n[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n`;
 // Remove ASS override delimiters; let libass shape complete Unicode runs (never reverse Arabic).
 return header+cues.map(c=>`Dialogue: 0,${stamp(c.start,true)},${stamp(c.end,true)},Default,,0,0,0,,${c.text.replace(/[{}\\]/g,'').replace(/\r?\n/g,'\\N')}`).join('\n')+'\n';
}
