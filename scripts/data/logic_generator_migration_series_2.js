module.exports = {
    data: {
        city: {
            distribution: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 3, 2, 2, 2, 2, 2, 2],
            config: {
                // ATL
                0: [2, 2, 2, 2, 2, 5, 5, 5, 15, 15],

                // NYC
                1: [0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 4, 4, 4, 6, 7, 8, 8, 8, 8, 14],

                // CHI
                2: [1, 1, 1, 1, 1, 1, 1, 1, 3, 9, 9, 10, 10, 10, 10, 10, 10, 11, 11, 11],

                // SF
                3: [12, 13]
            }
        },
        buildings: {
            16: {
                base: [],
                body: [],
                roof: [],
            },
            17: {
                base: [],
                body: [],
                roof: [],
            },
            18: {
                base: [],
                body: [],
                roof: [],
            },
            19: {
                base: [],
                body: [],
                roof: [],
            },
            20: {
                base: [],
                body: [],
                roof: [],
            },
        },
        // change appropriately based on weightings/distribution
        specials: [12, 13, 14, 15, 16, 17, 18, 19, 20],
    }
};
