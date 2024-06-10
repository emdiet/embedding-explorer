"use strict";
function dotProduct(v1, v2) {
    return v1.reduce((acc, _, i) => acc + v1[i] * v2[i], 0);
}
function magnitude(v) {
    return Math.sqrt(v.reduce((acc, val) => acc + val * val, 0));
}
function cosineSimilarity(v1, v2) {
    return dotProduct(v1, v2) / (magnitude(v1) * magnitude(v2));
}
function computeCosineSimilarity(rootVector, vector, theta) {
    const v = vector.vector;
    const rv = rootVector.vector;
    return cosineSimilarity(rv, v);
}
function normalize(v) {
    const mag = magnitude(v);
    return v.map(val => val / mag);
}
function interpolate_halves(vector1, vector2, depth = 2) {
    const average = vector1.map((val, i) => (val + vector2[i]) / 2);
    const normalized_average = normalize(average);
    if (depth == 0) {
        return [normalized_average];
    }
    else {
        return [
            ...interpolate_halves(vector1, normalized_average, depth - 1),
            normalized_average,
            ...interpolate_halves(normalized_average, vector2, depth - 1)
        ];
    }
}
function interpolate_linear(vector1, vector2, depth = 2) {
    const interpolated_vectors = [];
    for (let i = 0; i < depth; i++) {
        const interpolated_vector = vector1.map((val, j) => val + (vector2[j] - val) * i / depth);
        interpolated_vectors.push(normalize(interpolated_vector));
    }
    return interpolated_vectors;
}
function buildHierarchyCorrectedAndSorted3(rootVector, vectors, theta, maxdepth = 2) {
    let vectorData = vectors.map(vec => (Object.assign(Object.assign({}, vec), { cosine_similarity: computeCosineSimilarity(rootVector, vec, theta), children: [] })));
    vectorData.sort((a, b) => b.cosine_similarity - a.cosine_similarity);
    let finalStructure = [rootVector];
    rootVector.children = [];
    function insert(parent, vector, depth = 0) {
        vector.children = [];
        // if parent is vector, throw error
        if (parent.label == vector.label) {
            return; //???
            //throw new Error("Parent and vector are the same");
        }
        const radius = 180 * Math.acos(vector.cosine_similarity) / Math.PI;
        vector.radius = radius;
        vector.theta =
            (depth == 0) ? 0 :
                (depth == 1) ? radius :
                    (depth == 2) ? parent.theta + radius :
                        parent.theta - parent.radius + radius;
        if (!parent.children || parent.children.length == 0) {
            parent.children = [vector];
            return;
        }
        else {
            let parent_cosine_similarity = computeCosineSimilarity(parent, vector, theta);
            // find a child where the cosine similarity is greater than the current vector
            let childFound = false;
            parent.children.forEach(child => {
                const child_cosine_similarity = computeCosineSimilarity(child, vector, theta);
                if (child_cosine_similarity > parent_cosine_similarity) {
                    const childTheta = 180 * Math.acos(child_cosine_similarity) / Math.PI;
                    vector.theta = childTheta;
                    insert(child, vector, depth + 1);
                    childFound = true;
                }
            });
            if (!childFound) {
                parent.children.push(vector);
            }
        }
    }
    vectorData.forEach(vec => {
        insert(rootVector, vec);
    });
    finalStructure = rootVector.children;
    const numParents = finalStructure.length;
    finalStructure.forEach((parent, index) => {
        parent.theta = (360 / numParents) * index;
        if (index > 0) {
            const prevParent = finalStructure[index - 1];
            const thetaSimilarity = computeCosineSimilarity(prevParent, parent, theta);
            parent.theta = prevParent.theta + (180 * Math.acos(thetaSimilarity) / Math.PI);
        }
    });
    return finalStructure;
}
// Example Usage
const rootVector = { label: "Root", vector: [1.0, 0.0] };
const vectors = [
    { label: "A", vector: [0.6, 0.1], timestamp: 1 },
    { label: "B", vector: [0.0, 1.0], timestamp: 2 },
    { label: "C", vector: [0.707, 0.707], timestamp: 3 }
];
const hierarchySorted = buildHierarchyCorrectedAndSorted(rootVector, vectors, 0);
console.log(hierarchySorted);
function buildHierarchyCorrectedAndSorted(rootVector, vectors, theta) {
    let vectorData = vectors.map(vec => (Object.assign(Object.assign({}, vec), { cosine_similarity: computeCosineSimilarity(rootVector, vec, theta) })));
    vectorData.sort((a, b) => b.cosine_similarity - a.cosine_similarity);
    let finalStructure = [];
    vectorData.forEach(vec => {
        if (vec.cosine_similarity > 1 || vec.cosine_similarity < -1) {
            console.log(`arccos out of range: ${vec.cosine_similarity}, elem: ${vec.label}`);
            // check if we're very close to one or negative one, then set it to one or negative one
            const sigma = 0.00001;
            if (vec.cosine_similarity > 1 - sigma) {
                vec.cosine_similarity = 1;
            }
            else if (vec.cosine_similarity < -1 + sigma) {
                vec.cosine_similarity = -1;
            }
            else {
                throw new Error(`arccos still out of range: ${vec.cosine_similarity}, elem: ${vec.label}`);
            }
        }
        const radius = 180 * Math.acos(vec.cosine_similarity) / Math.PI;
        let node = Object.assign(Object.assign({}, vec), { radius, theta: 0, children: [] });
        let parentFound = false;
        finalStructure.forEach(parentNode => {
            const parentCosineSim = computeCosineSimilarity(parentNode, vec, theta);
            if (parentCosineSim > vec.cosine_similarity) {
                const childTheta = 180 * Math.acos(parentCosineSim) / Math.PI;
                node.theta = childTheta;
                parentNode.children.push(node);
                parentFound = true;
            }
        });
        if (!parentFound) {
            finalStructure.push(node);
        }
    });
    const numParents = finalStructure.length;
    finalStructure.forEach((parent, index) => {
        parent.theta = (360 / numParents) * index;
        if (index > 0) {
            const prevParent = finalStructure[index - 1];
            const thetaSimilarity = computeCosineSimilarity(prevParent, parent, theta);
            parent.theta = prevParent.theta + (180 * Math.acos(thetaSimilarity) / Math.PI);
        }
    });
    return finalStructure;
}
//# sourceMappingURL=hierarchy.js.map