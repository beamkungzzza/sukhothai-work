export function ownersOf(value: string | null | undefined): string[] {
 return [...new Set((value||'').split(/[,，;\n]+/).map(name=>name.trim()).filter(name=>name&&name!=='-'))];
}
export function matchesOwner(value:string|null|undefined,selected:string):boolean {
 const names=ownersOf(value);
 return selected==='all'||(selected==='unassigned'?names.length===0:names.includes(selected.slice(7)));
}
