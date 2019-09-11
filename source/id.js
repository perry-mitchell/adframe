let counter = 0;

const MAX_INT = 2147483647;

export function generateID() {
    return `${++counter}_${Math.floor(Math.random() * MAX_INT)}`;
}
