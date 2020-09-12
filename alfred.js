// utilities //
const W = 1200;
const H = 900;
let theseed = 1234;

function sqdist2(dx,dy) {
    return dx*dx+dy*dy;
}
function sqdist4(x1,y1,x2,y2) {
    return (x2-x1)*(x2-x1)+(y2-y1)*(y2-y1);
}

function inbounds(xy, rectobj) {
    const minx = Math.min(rectobj.x, rectobj.x+rectobj.w);
    const maxx = Math.max(rectobj.x, rectobj.x+rectobj.w);
    const miny = Math.min(rectobj.y, rectobj.y+rectobj.h);
    const maxy = Math.max(rectobj.y, rectobj.y+rectobj.h); 
    const xin = xy[0] >= minx 
        && xy[0] <= maxx;
    const yin = xy[1] >= miny 
        && xy[1] <= maxy;
    return xin && yin;
}