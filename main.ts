import{readFileSync as R,writeFileSync as W,mkdirSync as M,readdirSync as E}from"node:fs"
let I=process.env.MAKEFUN_INPUT_DIR||"/input",O=process.env.MAKEFUN_OUTPUT_DIR||"/output",L="udlr",U="UDLR"
for(let d of E(I).sort()){
let t=R(`${I}/${d}/level.txt`,"utf8").split("\n").filter(s=>s),w=Math.max(...t.map(s=>s.length)),n=w*t.length,j=t.map(s=>s.padEnd(w,"#")).join("")
let G=[],B=[],p=0,lv=new Uint8Array(n)
for(let i=0;i<n;i++){let c=j[i];".*+".includes(c)&&(G.push(i),lv[i]=1);"$*".includes(c)&&B.push(i);"@+".includes(c)&&(p=i)}
let D=[-w,w,-1,1],q=[...G],pr=new Int32Array(n),gs=[]
for(let i=0;i<q.length;i++)for(let e of D){let y=q[i]-e;j[y]!="#"&&j[y-e]!="#"&&!lv[y]&&(lv[y]=1,q.push(y))}
pr.fill(-1)
for(let s=0;s<n;s++)if(lv[s]&&pr[s]<0){q=[s];pr[s]=gs.length;for(let i=0;i<q.length;i++)for(let e of D){let y=q[i]+e;lv[y]&&pr[y]<0&&(pr[y]=gs.length,q.push(y))}gs.push([[],[]])}
for(let b of B)gs[pr[b]][0].push(b)
for(let g of G)gs[pr[g]][1].push(g)
let Z=new Uint8Array(n)
let Bf=s=>{pr.fill(-1);let qq=[s],lo=s;pr[s]=s;for(let i=0;i<qq.length;i++){let c=qq[i];if(c<lo)lo=c;for(let e of D){let y=c+e;j[y]!="#"&&!Z[y]&&pr[y]<0&&(pr[y]=c,qq.push(y))}}return lo}
let solve=(bs,gl,p0,base)=>{
let goal=new Set(gl),vis=new Set(),Q=[[bs,p0,""]]
Z.set(base);for(let b of bs)Z[b]=1
vis.add(`${bs},${Bf(p0)}`)
for(let b of bs)Z[b]=0
if(bs.every(b=>goal.has(b)))return""
for(let hd=0;hd<Q.length;hd++){
let[cb,pl,str]=Q[hd];for(let b of cb)Z[b]=1
Bf(pl);let here=pr.slice()
for(let bi=0;bi<cb.length;bi++){let b=cb[bi]
for(let k=0;k<4;k++){let e=D[k],t2=b+e
if(here[b-e]<0||j[t2]=="#"||Z[t2]||!lv[t2])continue
Z[b]=0;Z[t2]=1
let nx=cb.slice();nx[bi]=t2;nx.sort((x,y)=>x-y)
let kk=`${nx},${Bf(b)}`
Z[t2]=0;Z[b]=1
if(vis.has(kk))continue
vis.add(kk)
let w2="";for(let c=b-e;c!=pl;c=here[c])w2=L[D.indexOf(c-here[c])]+w2
let ns=str+w2+U[k]
if(nx.every(b=>goal.has(b)))return ns
Q.push([nx,b,ns])}}
for(let b of cb)Z[b]=0}
return null}
let base=new Uint8Array(n),out="",cur=p
for(let b of B)base[b]=1
for(let g of gs){
for(let b of g[0])base[b]=0
let s=solve(g[0],g[1],cur,base)
if(s==null)break
out+=s
for(let b of g[1])base[b]=1
for(let ch of s)cur+=D[L.indexOf(ch.toLowerCase())]}
M(`${O}/${d}`,{recursive:true})
W(`${O}/${d}/solution.txt`,out)
}
