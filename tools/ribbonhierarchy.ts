type RawVector = {
    label: string;
    data: string;
    vector: number[];
    timestamp?: number;
};
type OutVector = {
    label: string;
    data: string;
    vector: number[];
    timestamp?: number;
    neighbors: {cosine_similarity: number, rank: number, vector: OutVector}[];
    cosine_similarity?: number;
    radius: number;
    theta: number;
}

function createRibbonHierarchy(target: number[] , vectors: RawVector[]) {
    
    // for each rawvector, compute the cosine similarity with the target vector
    const outVectors: OutVector[] = vectors.map((rawVector, index) => {
        const cosine_similarity = cosineSimilarity(target, rawVector.vector);
        return {
            ...rawVector,
            cosine_similarity,
            radius: (1 - cosine_similarity) * 90,
            theta: 0,
            neighbors: []
        }
    });

    // for each outvector, compute cosine similairty with all other outvectors, and take top 2 - those will be the neighbors
    for(let i = 0; i < outVectors.length; i++){
        const vector = outVectors[i];
        const neighbors = outVectors.map((v, j) => ({
            cosine_similarity: cosineSimilarity(vector.vector, v.vector),
            rank: j,
            vector: v
        })).sort((a, b) => b.cosine_similarity - a.cosine_similarity).slice(1, 3);
        vector.neighbors.push(...neighbors);
    }



    // find all chains of neighbors, making sure all vectors are included
    const chains = [];
    const allVectors = [...outVectors];
    while(allVectors.length > 0){
        let current: OutVector = allVectors.pop()!;
        chains.push(current);
        current.theta = 0;

        function traverse(prior: OutVector, vector: OutVector, cosine_similarity: number){
            // not in allvectors, stop
            if(!allVectors.includes(vector)){
                return;
            }
            // remove from allvectors
            const index = allVectors.indexOf(vector);
            allVectors.splice(index, 1);
            
            vector.theta = prior.theta + (1-cosine_similarity) * 90; // todo: div by radius? depth?

            // dig deeper
            vector.neighbors.forEach(n => {
                if(n.vector !== prior){
                    traverse(vector, n.vector, n.cosine_similarity);
                }
            });
        }

        current.neighbors.forEach(n => {
            traverse(current, n.vector, n.cosine_similarity);
        });
    }
    return chains;
}