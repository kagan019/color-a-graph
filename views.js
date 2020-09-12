// HUD //
let ready = true;
const HUD = { //global HUD
    "solvebuttonarea": {
        x: 360,
        y: H-140,
        w: 160,
        h: 90,
        hover: false,
        clickRelease: function() {}
    },
    "solvebutton": {
        x: 400,
        y: H-90,
        w: 70,
        h: -23,
        used: false,
        hover: false,
        clickRelease: function() {
            if (vars.length > 0) {
                if (ready) {
                    ready = false;
                    this.used = true;
                    solve();
                    return;
                }
                if (failed) {

                }
            }
        }
    }
};

function greeting() {
    if (vars.length == 0)
        text("click to make points",10,12);
    if (Object.keys(edges).length == 0)
        text("click and drag to link points",10,30);
}

function solvebutton() {
    const me = HUD["solvebutton"];
    let x = me.x;
    let y = me.y;
    textSize(30);
    if (ready) {
        if (!me.hover) {
            stroke(0);
            fill(0);
        }
        else {
            stroke(100,100,100);
            fill(100,100,100);
        }
    }
    else {
        stroke(110,110,110);
        fill(110,110,110);
    }
    strokeWeight(2);
    const txt = (!me.used) ? "color" 
        : ((!ready) ? "coloring" : "recolor");
    text(txt, x,y);
}


// interactive graphics //

// should it look like a graph, sudoku, einstein riddle, etc 
//(though currently only graph is supported)
const views = {
    "Graph": { 
        varpos: [], 
        ispressed: false,
        varidxnear: -1,
        firstconstraint: -1,
        solvectr: 0,
        lastvartocolor: -1,
        press: function(xx,yy) {
            for (const key in HUD) {
                if (inbounds([mouseX, mouseY], HUD[key])) { 
                    return; //ignore mouse clicks in the view if they collide with HUD regions
                }
            }
            this.ispressed = true;
        },
        hover: function(xx,yy) { //TODO handle when 2 selectrads overlap more gracefully
            const selectrad = 10*3+6+23;
            this.varidxnear = -1;
            if (!this.ispressed)
                this.firstconstraint = -1;
            for (let i = 0; i < this.varpos.length; i++) {
                if (sqdist4(this.varpos[i][0],this.varpos[i][1],xx,yy) < selectrad*selectrad) {
                    this.varidxnear = i;
                    if (!this.ispressed)
                        this.firstconstraint = i;
                    return;
                }
            }
        },
        clickRelease: function(xx, yy) {
            this.firstconstraint = -1;
            if (!this.ispressed) return;
            this.ispressed = false;
            if (this.varidxnear != -1) return;
            if (this.varpos.length >= MAXvars) return;
            this.varpos.push([xx,yy]);
            addVar();
            this.hover(xx,yy);
        },
        dragRelease: function(xx,yy) {
            const fccpy = this.firstconstraint;
            this.firstconstraint = -1;
            if (!this.ispressed) return;
            this.ispressed = false;
            if (this.varidxnear == -1
                || fccpy == -1) return;
            if (this.varidxnear === fccpy) return;
            addConstraint(fccpy, this.varidxnear);
            this.hover(xx,yy);
        },
        testColors: function() {
            for (let i = 0; i < 20; i++) {
                this.varpos.push([i*60+30,400]);
                addVar();
                assignments[i] = i;
            }
        },
        colorofvalue: function(asnmt) {
            randomSeed(theseed * (asnmt+13) % 100007);
            let hashes = [
                random(0,254)+1,random(0,254)+1,0
            ];
            hashes[2] = Math.abs(255 - 2 * hashes[0] + hashes[1]) % 254 + 1;
            hashes.sort((a,b) => {return Math.random() < 0.5})
            return {r: hashes[0], g: hashes[1], b: hashes[2]};
        },
        drawVarPossibility: function(xx, yy, cnum) {
            noStroke();
            let c = this.colorofvalue(cnum);
            fill(c.r, c.g, c.b);
            circle(xx+5, yy, 10);
        },
        drawVar: function(vnum) {
            if (this.varidxnear == vnum)
                stroke(100,100,100);
            else
                stroke(0);
            strokeWeight(2.5);
            fill(0);
            circle(this.varpos[vnum][0], this.varpos[vnum][1], 10*3+6);
            noStroke()
            if (assignments[vnum] != -1) {
                let c = this.colorofvalue(assignments[vnum]);   
                fill(c.r,c.g,c.b);
                circle(this.varpos[vnum][0], this.varpos[vnum][1], animation("radial-grow",vnum));
            }
        },
        drawVarConstraint: function(pos1,pos2) { 
            //currently only support binary constraints; i.e. graph coloring, but not einstein riddles
            const bufferrad = 10*2+5;
            const dy = pos2[1]-pos1[1];
            const dx = pos2[0]-pos1[0];
            const sx = dx/Math.sqrt(sqdist2(dx,dy)) * bufferrad;
            const sy = dy/Math.sqrt(sqdist2(dx,dy)) * bufferrad;
            if (sqdist2(dx,dy) > sqdist2(sx,sy)) {
                stroke(0);
                strokeWeight(2);
                line(pos1[0] + sx, pos1[1] + sy, pos2[0]-sx, pos2[1]-sy);
                noStroke();
                fill(0);
                circle(pos1[0]+sx, pos1[1]+sy, 3);
                circle(pos2[0]-sx, pos2[1]-sy, 3);
            }
        },
        draw: function() {
            for (let i in edges) {
                for (let j in edges[i]) {
                    const c = [parseInt(i),parseInt(j)];
                    c.sort();
                    const pos1 = this.varpos[c[0]];
                    const pos2 = this.varpos[c[1]];
                    this.drawVarConstraint(pos1,pos2);
                }
            }
            for (let i = 0; i < vars.length; i++) {
                this.drawVar(i);
            } 
            if (this.ispressed && this.firstconstraint != -1) {
                //draw a special constraint to the mouse
                const pos1 = this.varpos[this.firstconstraint];
                const pos2 = [mouseX,mouseY];
                this.drawVarConstraint(pos1,pos2);
            }
            if (solved) {
                this.animate_solution();
            }
            if (finished_animations["radial-grow"].has(this.lastvartocolor)) {
                ready = true;
            }
        },
        animate_solution: function() {
            solved = false;
            let animq = create_animation_ifne("radial-grow-queue",this.solvectr);
            animq.start = depth_order();
            this.lastvartocolor = animq.start[animq.start.length-1][
                animq.start[animq.start.length-1].length-1
            ];
            start_animation("radial-grow-queue",this.solvectr,5);
            this.solvectr++;
        }
    }
    //sudoku, kakuro, maps, etc
};
let activeView = "Graph";