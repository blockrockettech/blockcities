module.exports = {
    data: {
        city: {
            distribution: [0, 0, 1, 1, 1, 2, 3, 3, 3, 3],
            config: {
                // ATL
                0: [2, 2, 2, 2, 2, 5, 5, 15, 15, 20, 20, 22, 22, 23, 23, 23, 23, 23, 24, 24],

                // NYC
                1: [0, 4, 4, 4, 6, 6, 7, 7, 7, 8, 8, 14, 17, 18, 18, 25, 26, 26, 28, 28],

                // CHI
                2: [1, 1, 9, 10, 10, 11, 11, 16, 16, 19],

                // FIXME 21 removed on second pass due to svg issue
                // SF
                3: [12, 12, 12, 12, 13, 13, 13, 13, 13]
            }
        },
        buildings: {
            0: {
                base: [0, 1, 2, 3, 4, 5, 6, 7],
                body: [0, 1, 2, 3, 4, 5, 6, 7, 8],
                roof: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
            },
             1: {
                base: [0, 1, 2, 3, 4, 5, 6, 7],
                body: [0, 1, 2],
                roof: [0, 1, 2, 3, 4, 5, 6, 7, 8],
            },
             2: {
                base: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
                body: [0, 1, 2],
                roof: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
            },
             3: {
                base: [0],
                body: [0],
                roof: [0],
            },
             4: {
                base: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
                body: [0, 1, 2, 3, 4, 5],
                roof: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
            },
             5: {
                base: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
                body: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
                roof: [0, 1, 2, 3, 4, 5],
            },
             6: {
                base: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
                body: [0, 1, 2, 3, 4, 5],
                roof: [0, 1, 2, 3, 4],
            },
             7: {
                base: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
                body: [0, 1, 2, 3, 4, 5],
                roof: [0, 1, 2, 3],
            },
             8: {
                base: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
                body: [0, 1, 2, 3, 4, 5, 6, 7],
                roof: [0],
            },
             9: {
                base: [0, 1],
                body: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
                roof: [0, 1, 2, 3, 4],
            },
             10: {
                base: [0, 1, 2, 3, 4, 5, 6],
                body: [0, 1, 2, 3, 4, 5, 6, 7, 8],
                roof: [0, 1, 2, 3, 4, 5, 6],
            },
             11: {
                base: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
                body: [0, 1, 2],
                roof: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
            },
             12: {
                base: [0, 1, 2, 3, 4, 5, 6],
                body: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21],
                roof: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
            },
             13: {
                base: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
                body: [0, 1, 2, 3, 4, 5, 6, 7, 8],
                roof: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
            },
             14: {
                base: [0, 1, 2, 3, 4],
                body: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
                roof: [0, 1, 2, 3, 4],
            },
             15: {
                base: [0, 1, 2, 3, 4, 5, 6, 7, 8],
                body: [0, 1, 2, 3, 4],
                roof: [0, 1, 2, 3, 4, 5, 6, 7],
            },
             16: {
                base: [0, 1, 2, 3, 4],
                body: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27],
                roof: [0, 1, 2, 3, 4, 5, 6, 7],
            },
             17: {
                base: [0],
                body: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27],
                roof: [0],
            },
             18: {
                base: [0, 1, 2, 3],
                body: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
                roof: [0, 1, 2],
            },
             19: {
                base: [0, 1, 2, 3],
                body: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
                roof: [0, 1, 2, 3],
            },
             20: {
                base: [0, 1, 2],
                body: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
                roof: [0, 1, 2, 3, 4, 5],
            },
             21: {
                base: [0, 1, 2, 3, 4],
                body: [0],
                roof: [0, 1],
            },
            22: {
                base: [0, 1, 2],
                body: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
                roof: [0, 1, 2, 3, 4, 5],
            },
             23: {
                base: [0, 1, 2],
                body: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19],
                roof: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
            },
             24: {
                base: [0, 1, 2, 3],
                body: [0, 1, 2, 3, 4, 5, 6, 7],
                roof: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
            },
             25: {
                base: [0],
                body: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
                roof: [0, 1, 2, 3],
            },
             26: {
                base: [0, 1, 2, 3, 4],
                body: [0, 1, 2, 3, 4, 5, 6],
                roof: [0, 1, 2, 3, 4, 5, 6, 7, 8],
            },
             27: {
                base: [0],
                body: [0],
                roof: [0],
            },
             28: {
                base: [0, 1, 2],
                body: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41],
                roof: [0, 1, 2, 3, 4, 5],
            },
        },
        // change appropriately based on weightings/distribution
        specials: [13, 13, 14, 14, 15, 15, 16, 16, 17, 17, 18, 18, 19, 19, 20, 20, 21, 22, 30, 30], // reset
    }
};
