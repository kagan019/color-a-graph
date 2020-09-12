// application state //

// every number from 0 (inc) to domainsize (exc) is an abstract 
// element of the 'domain' (a sudoku number, a house, etc)
let solved = false;
let failed = false;
let domainsize = 40;   
const MINdsize = 3;
const MAXdsize = 9;
//vars is a list of sets, one set for each variable. 
//the inner set holds the elements of the domain that are known to
//NOT equal the variable (not so its easier to add new colors and vars)
let vars = [];      
const MAXvars = 35;
//list of pairs of indices of `var`s  that can't be equal.
//indexed by the pair of indices ascending.
//holds a boolean for whether the constraint 
//is active in the algorithm
let edges = {}; 
let edges_inverse = {}; // because i strictly < j in edges, the two together have no overlap of access
//varidx -> color
let assignments = [];
let maxasgmt = 0; //should always equal one greater than the max of `assignments`
//at what indx (inc) do the vars created after the last solve start?
let varssolved = [0,0];

function fail() {
    failed = true;
}
function finish() {
    solved = true;
}


// algorithm // 

function edge_traverse() {
    let depths = {};
    let q = [];
    let mex_ = varssolved[0]
    while(mex_ < varssolved[1]) {
        q.push([mex_,0]);
        while(q.length > 0) {
            let x = q.shift();
            let v = x[0]; let depth = x[1]; 
            if (v in depths)
                continue;
            depths[v] = depth;
            for (let i in edges[v])
                q.push([parseInt(i),depth+1]);
            for (let i in edges_inverse[v])
                q.push([parseInt(i),depth+1]);
        }
        while(mex_ in depths)
            mex_++;
    }
    return depths;
}

function depth_order() {
    //returns a list of groups of vars in order of depth
    let depths = edge_traverse();
    let breadthfirst = [];
    for (x in depths) {
        while(depths[x] >= breadthfirst.length) {
            breadthfirst.push([]);
        }
        breadthfirst[depths[x]].push(parseInt(x)); 
    }
    return breadthfirst;
}

function mex(v) {
    let i = 0;
    while(i < domainsize && (vars[v].has(i))) {
        i++;
    }
    return i;
}

function solve() {
    if (vars.length == 0) {
        fail();
        return;
    }
    failed = false;
    varssolved = [varssolved[1], vars.length];
    function helper(v) {
        let m = mex(v);
        assignments[v] = m;
        if (m >= maxasgmt)
            maxasgmt = m+1;
        for (newv in edges[v]) {
            vars[newv].add(m);
        }
        for (newv in edges_inverse[v]) {
            vars[newv].add(m);
        }
    }
    for(let i = varssolved[0]; i < varssolved[1]; i++) {
        helper(i);
    }
    finish();
    return;    
}

function addConstraint(var1, var2) {
    let k = [var1,var2];
    k.sort();
    if (assignments[k[0]] == assignments[k[1]])
        if (assignments[k[1]] != -1)
            return;
    if (!(k[0] in edges))
        edges[k[0]] = {};
    if (!(k[1] in edges[k[0]]))
        edges[k[0]][k[1]] = true;
    if (!(k[1] in edges_inverse))
        edges_inverse[k[1]] = {};
    if (!(k[0] in edges_inverse[k[1]]))
        edges_inverse[k[1]][k[0]] = true;
    if (assignments[k[0]] != -1) {
        vars[k[1]].add(assignments[k[0]]);
    }
    if (assignments[k[1]] != -1) {
        vars[k[0]].add(assignments[k[1]]);
    }
}

function addVar() {
    vars.push(new Set());
    assignments.push(-1);
}

function reset() {
    for (let i = 0; i < vars.length; i++) {
        vars[i] = new Set();
        for (let j = 0; j < domainsize; j++) {
            vars[i].add(j);
        }
    }
    for (let i = 0; i < vars.length; i++) 
        assignments[i] = -1;
}

