export const FILE_TYPES = {
  '.py':    { color:'#38bdf8', shape:'sphere',       tagClass:'tag-cyan',    label:'Python',     size:1.1 },
  '.js':    { color:'#facc15', shape:'octahedron',   tagClass:'tag-amber',   label:'JavaScript', size:1.0 },
  '.jsx':   { color:'#fbbf24', shape:'octahedron',   tagClass:'tag-amber',   label:'JSX',        size:1.0 },
  '.ts':    { color:'#3b82f6', shape:'box',          tagClass:'tag-blue',    label:'TypeScript', size:1.0 },
  '.tsx':   { color:'#60a5fa', shape:'box',          tagClass:'tag-blue',    label:'TSX',        size:1.0 },
  '.go':    { color:'#2dd4bf', shape:'tetrahedron',  tagClass:'tag-emerald', label:'Go',         size:1.1 },
  '.html':  { color:'#f97316', shape:'cone',         tagClass:'tag-orange',  label:'HTML',       size:0.9 },
  '.css':   { color:'#a855f7', shape:'torus',        tagClass:'tag-violet',  label:'CSS',        size:0.9 },
  '.scss':  { color:'#c084fc', shape:'torus',        tagClass:'tag-violet',  label:'SCSS',       size:0.9 },
  '.json':  { color:'#6b7280', shape:'icosahedron',  tagClass:'tag-cyan',    label:'JSON',       size:0.8 },
  '.yml':   { color:'#9ca3af', shape:'icosahedron',  tagClass:'tag-cyan',    label:'YAML',       size:0.8 },
  '.md':    { color:'#d1d5db', shape:'dodecahedron', tagClass:'tag-cyan',    label:'Markdown',   size:0.8 },
  'dead':       { color:'#2a1a3e', shape:'wireframe',    tagClass:'tag-rose',    label:'Dead Code',  size:0.7 },
  'bottleneck': { color:'#f43f5e', shape:'sphere',        tagClass:'tag-rose',    label:'Critical',   size:1.5 },
  'default':    { color:'#818cf8', shape:'sphere',        tagClass:'tag-violet',  label:'File',       size:1.0 },
};

export function getTypeKey(filename, isBottleneck, isDead) {
  if (isDead)       return 'dead';
  if (isBottleneck) return 'bottleneck';
  const ext = Object.keys(FILE_TYPES).find(e => filename.endsWith(e));
  return ext || 'default';
}
