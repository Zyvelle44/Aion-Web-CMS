const levelExpTable = [
    { level: 1, exp: 0 },
    { level: 2, exp: 400 },
    { level: 3, exp: 1645 },
    { level: 4, exp: 4000 },
    { level: 5, exp: 8000 },
    { level: 10, exp: 65000 },
    { level: 20, exp: 950000 },
    { level: 30, exp: 7800000 },
    { level: 40, exp: 42000000 },
    { level: 50, exp: 185000000 },
    { level: 55, exp: 420000000 },
    { level: 60, exp: 850000000 },
    { level: 65, exp: 1500000000 }
];

const getLevelFromExp = (exp) => {
    const totalExp = Number(exp || 0);
    let level = 1;

    for (const row of levelExpTable) {
        if (totalExp >= row.exp) {
            level = row.level;
        } else {
            break;
        }
    }

    return level;
};

module.exports = {
    getLevelFromExp
};