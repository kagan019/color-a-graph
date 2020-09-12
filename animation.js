// animation //
//an animation is basically a kind of stateful function. like a view/widget but simpler and
//usually dependent on time.

const BEFORE = 0;
const DURING = 1;
const AFTER = 2;
let animations = {}; //table of tables of states
let active_animations = {}; //table of sets
let finished_animations = {}; //table of sets
const animation_kinds = {
    // an animation is nothing but a stateful function that depends on time
    "radial-grow": {
        before: 0,
        start:  5,
        after: 10*3+6-2.5,
        step: function() {
            const dt = (millis() - this.lastTime) / 1000;
            return this.value + this.speed*dt*Math.pow(this.after-this.value + 4,2)/(this.after);
         },
        finished: function() {
            return this.value >= this.after;
        }
    },
    "radial-grow-queue": { //for a neat fanning effect
        //future work: make an animation that truly operates generically on another
        //see views["Graph"].animate_solution for details
        before: [],
        start: [[]], //assign in view
        after: [],
        lastFan: -1,
        step: function() {
            if (this.frame == 0 || millis()-this.lastFan >= 1000/this.speed) {
                const qofvarstoanimatenext = this.value.shift();
                for (let i = 0; i < qofvarstoanimatenext.length; i++) {
                    start_animation("radial-grow",qofvarstoanimatenext[i], 8);
                }
                this.lastFan = millis();
            }
            return this.value;
        },
        finished: function() {
            return this.value.length == 0;
        }
    }
};
for (const animtype in animation_kinds) {
    animations[animtype] = {}; //holds the state of all the animations in the program
    active_animations[animtype] = new Set();
    finished_animations[animtype] = new Set();
}
const animation_template = {
    kind: "template", //set automatically
    // a multiplier that may be used for the pace of change
    speed: 0, //parameterized
    key: -1, // parameterized

    // the number of step()s since started 
    frames: 0, //set automatically. dont modify in step()
    state: BEFORE, //set automatically
    startTime: -1, //set automatically. 
    lastTime: -1, // you can use millis() in step to get time delta
    //value is the output of the animation right now
    value: -1, //set automatically. initialized to start

    // animations should implement all the below, but not the above
    before: 0, //should be selected by each animation
    start: 0,  //should be selected by each animation
    after: 0,  //should be selected by each animation
    //function of the current value, 
    //the number of frames that have passed since start,
    //and the change in time since step was last called
    step: function() {
        //dont mutate any of the above parameters.
        //just use them to return the next value
        assert(this.state == DURING);
        assert(active_animations[this.kind].has(this.key));
        return 0;
    }, 
    finished: function() {
        //return true if the animation reached a state that it should stop
        //if not, return false
        return true;
    }, 
};

function create_animation_ifne(anim, key) {  
    if (!(anim in animation_kinds)){
        console.error(`${anim} is not a kind of animation`);
    }
    if (!(key in animations[anim])) {
        animations[anim][key] = {};
        const me = animations[anim][key];
        Object.assign(me, animation_template);
        Object.assign(me,animation_kinds[anim]);
        Object.assign(me, {
            kind: anim,
            key: key,
        });
    }
    return animations[anim][key];
}

//literally just call this function wherever you want with the chosen key
//and itll return the right value
function animation(anim,key) {
    const me = create_animation_ifne(anim,key);
    if (me.state == BEFORE)
        return me.before;
    if (me.state == DURING)
        return me.value;
    if (me.state == AFTER)
        return me.after;
    console.error(`animation ${anim}: ${key} in illegal state ${me.state}`);
}


function step_animation(kind,key) {
    const me = animations[kind][key];
    Object.assign(me, {
        frames: me.frames + 1,
        lastTime: millis(),
        value: me.step(),
    });
}
function prune_animation(kind,key) {
    const me = animations[kind][key];
    if (me.state == DURING && me.finished()) {
        Object.assign(me, {
            state: AFTER,
        });   
        active_animations[kind].delete(key);
        finished_animations[kind].add(key);
    }
}
function step_animations() {
    //advance animations
    for (kind in active_animations) {
        for (let x of active_animations[kind]) {
            step_animation(kind,x);
            prune_animation(kind,x);
        }
    }
}
function start_animation(anim,key,speed) {
    const me = create_animation_ifne(anim,key);
    //animations must be reset before they are started again
    if (me.state != BEFORE) return;
    Object.assign(me, {
        state: DURING,
        startTime: millis(),
        lastTime: millis(),
        frames: 0,
        speed: speed,
        value: me.start,
    });
    active_animations[anim].add(key);
    prune_animation(anim,key); // in case its starting value fails its finished() invariant
    return animations[anim][key];
}
function reset_animation(anim,key) {
    active_animations[animtype].delete(key);
    delete animations(anim,key);
    const me = create_animation_ifne(anim,key);
}