// event loop //

function setup() {
    createCanvas(W, H);   
    theseed = Date.now();
    randomSeed(theseed);
}
function draw() {
    background(255);

    //bounding box
    fill(0);
    stroke(0);
    textSize(15);
    strokeWeight(1);
    line(0,0,W, 0);
    line(0,0, 0, H);
    line(W, H, W, 0);
    line(W,H,0,H);
    
    //HUD
    greeting();
    solvebutton();

    //view content
    step_animations();
    views[activeView].draw();
}


// click //

const clickdtthresh = 200; //millis
const clickdxthresh = 40; //px
let pressedevnt = undefined;
let releasedevnt = undefined;
function classifyandactonclick() {
    const indtthresh = releasedevnt.t-pressedevnt.t < clickdtthresh;
    const indxthresh = sqdist4(pressedevnt.x,pressedevnt.y,releasedevnt.x,releasedevnt.y)
        < clickdxthresh*clickdxthresh;
    if (indtthresh && indxthresh) {
        views[activeView].clickRelease(pressedevnt.x,pressedevnt.y);
        for (const key in HUD) {
            if (inbounds([mouseX,mouseY],HUD[key]))
                HUD[key].clickRelease(pressedevnt.x,pressedevnt.y);
        }
    } else{
        views[activeView].dragRelease(releasedevnt.x,releasedevnt.y);
        //HUDs don't generally drag
    }
    pressedevnt = undefined;    
}


function mousePressed(event) {
    views[activeView].press();
    pressedevnt = {
        x: mouseX,
        y: mouseY,
        t: millis()
    };
}

function mouseMoved(event) {
    views[activeView].hover(mouseX,mouseY);
    for (const key in HUD) {
        if (inbounds([mouseX,mouseY], HUD[key])) {
            HUD[key].hover = true;
        } else
            HUD[key].hover = false;
    }
}
function mouseDragged(event) {
    views[activeView].hover(mouseX,mouseY);
}

function mouseReleased(event) {
    if (pressedevnt === undefined) return;
    releasedevnt = {
        x: mouseX,
        y: mouseY,
        t: millis()
    };
    classifyandactonclick();
}