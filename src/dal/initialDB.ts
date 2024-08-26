import runQuery from "./dal"

const createTables = async () => {
    let q = `CREATE TABLE IF NOT EXISTS street(
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL
) `
    await runQuery(q)


    q =
        `CREATE TABLE IF NOT EXISTS parking(
    id INT AUTO_INCREMENT PRIMARY KEY,
    street_id INT NOT NULL,
    is_occupied BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (street_id) REFERENCES street(id)
) `
    await runQuery(q)
}

// createTables().then(() => {
//     console.log("Done creating tables");
// })
const createColumns = async () => {
    let q = `INSERT INTO street (name) VALUES 
    ('Bergman'),
    ('Uziel'),
    ('Yosef Hachmi'),
    ('Hpisga'),
    ('Props'),
    ('Mintzberg'),
    ('Gideon'),
    ('Al_Hida'),
    ('Weisburg'),
    ('Kaddish Luz'),
    ('Holyland'),
    ('Htorim'),
    ('Amos'),
    ('Tsafania'),
    ('Yehezkel'),
    ('Jeremiah'), 
    ('Petah_Tikva'),
    ('Sorotskin'),
    ('Fanim_Meirat'),
    ('Yona'),
    ('Jaffa'),
    ('Yona'),
    ('Agrippa'),
    ('Medreh'),
    ('Yeshayahu'),
    ('Michelin'),
    ('Shahrai'),
    ('Kasuto'),
    ('Mozafi'),
    ('Shmuel_Hanavi'),
    ('Herzl')`;

    await runQuery(q);


   q = `INSERT INTO parking (street_id) VALUES 
    (1),
    (2), 
    (3),
    (4),
    (5),
    (6),
    (7),
    (8),
    (9), 
    (10),
    (11),
    (12),
    (13),
    (14),
    (15),
    (16),
    (17),
    (18),
    (19),
    (20),
    (21),
    (22),
    (23),
    (24),
    (25),
    (26),
    (27),
    (28),
    (29),
    (30)`;

    await runQuery(q);
}

createColumns().then(() => {
    console.log("Done creating columns");
})

