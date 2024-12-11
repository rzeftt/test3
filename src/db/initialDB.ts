// import { addUser } from "../services/serverServices"

import { runQuery } from "./dal"



const createTables = async () => {
    let q = `CREATE TABLE users (
        user_id INT AUTO_INCREMENT PRIMARY KEY,  
        first_name VARCHAR(50) NOT NULL,        
        last_name VARCHAR(50) NOT NULL,          
        email VARCHAR(100) NOT NULL UNIQUE,      
        password VARCHAR(255) NOT NULL CHECK (CHAR_LENGTH(password) >= 4),         
        is_admin BOOLEAN DEFAULT FALSE
    ); 
 `
    await runQuery(q)

    q =
        `CREATE TABLE followers (
        user_id INT,                            
        vacation_id INT,                          
        PRIMARY KEY (user_id, vacation_id),        
        FOREIGN KEY (user_id) REFERENCES users(user_id),  
        FOREIGN KEY (vacation_id) REFERENCES vacations(vacation_id) 
    );
    `
    await runQuery(q)

    q =
        `CREATE TABLE IF NOT EXISTS vacations (
        vacation_id INT AUTO_INCREMENT PRIMARY KEY,  
        destination VARCHAR(100) NOT NULL,           
        description TEXT,                           
        start_date DATE NOT NULL,                    
        end_date DATE NOT NULL,                     
        price DECIMAL(10, 2) NOT NULL,               
        image_file_name VARCHAR(255)                
    );
    `
    await runQuery(q)

    q =
        `CREATE TABLE followers (
        user_id INT,                            
        vacation_id INT,                          
        PRIMARY KEY (user_id, vacation_id),        
        FOREIGN KEY (user_id) REFERENCES users(user_id),  
        FOREIGN KEY (vacation_id) REFERENCES vacations(vacation_id) 
    );
    `
    await runQuery(q)

}
// createTables().then(() => {
//     console.log("Done creating tables");
// })
const insertData = async () => {
    // Insert 20 vacations without image
    const vacations = [
        ['Sydney', 'Visit the iconic Sydney Opera House and enjoy the stunning harbor views.', '2024-08-20', '2024-08-30', 1600.00],
        ['Paris', 'Explore the Eiffel Tower, Louvre, and more in the romantic city of Paris.', '2024-09-01', '2024-09-10', 2000.00],
        ['Tokyo', 'Experience the culture, technology, and history in Japan’s capital.', '2024-09-05', '2024-09-15', 1800.00],
        ['New York', 'Discover the Big Apple with its skyscrapers, Central Park, and Broadway.', '2024-09-10', '2024-09-20', 2200.00],
        ['Rome', 'Explore the ancient city with historical sites like the Colosseum and Vatican City.', '2024-09-12', '2024-09-22', 1500.00],
        ['London', 'Visit iconic landmarks such as the Big Ben, Buckingham Palace, and the British Museum.', '2024-09-15', '2024-09-25', 2100.00],
        ['Barcelona', 'Enjoy the beautiful beaches and architecture of the Mediterranean city.', '2024-09-18', '2024-09-28', 1900.00],
        ['Berlin', 'Immerse yourself in the history and culture of Germany’s capital.', '2024-09-20', '2024-09-30', 1700.00],
        ['Amsterdam', 'Experience the beautiful canals and museums in the Netherlands capital.', '2024-10-01', '2024-10-10', 1600.00],
        ['Dubai', 'Explore the luxury and modern wonders of the UAE, from the Burj Khalifa to desert safaris.', '2024-10-05', '2024-10-15', 2500.00],
        ['Cape Town', 'Enjoy the stunning views from Table Mountain and the beautiful beaches of South Africa.', '2024-10-07', '2024-10-17', 1800.00],
        ['Los Angeles', 'Visit the entertainment capital of the world, home to Hollywood and famous beaches.', '2024-10-10', '2024-10-20', 2000.00],
        ['Rio de Janeiro', 'Relax on the beautiful beaches of Rio and explore the iconic Christ the Redeemer statue.', '2024-10-12', '2024-10-22', 1700.00],
        ['Moscow', 'Explore Russia’s capital with its grand architecture and historical landmarks.', '2024-10-15', '2024-10-25', 2200.00],
        ['Seoul', 'Visit the vibrant city of Seoul with its mix of traditional and modern attractions.', '2024-10-18', '2024-10-28', 1900.00],
        ['Cairo', 'Discover the ancient pyramids, Sphinx, and Egypt’s fascinating history.', '2024-10-20', '2024-10-30', 1600.00],
        ['Bangkok', 'Explore the bustling capital of Thailand, known for its street food, temples, and vibrant nightlife.', '2024-10-22', '2024-11-01', 1500.00],
        ['Buenos Aires', 'Experience the culture, art, and food of Argentina’s capital.', '2024-10-25', '2024-11-04', 1800.00],
        ['Istanbul', 'Discover the rich history and culture of the city that bridges Europe and Asia.', '2024-10-28', '2024-11-07', 1700.00],
        ['Singapore', 'Enjoy the modern, clean, and diverse city-state with attractions like Gardens by the Bay and Marina Bay Sands.', '2024-11-01', '2024-11-10', 2000.00],
        ['Lisbon', 'Explore the historic streets and beautiful architecture of Portugal’s capital.', '2024-11-05', '2024-11-15', 1600.00]
    ];

    // Insert each vacation into the vacations table
    for (const vacation of vacations) {
        let q = `INSERT INTO vacations (destination, description, start_date, end_date, price) VALUES 
                ('${vacation[0]}', '${vacation[1]}', '${vacation[2]}', '${vacation[3]}', ${vacation[4]});`;
        await runQuery(q);
    }

    console.log("20 vacations inserted successfully.");
};

// קריאה לפונקציה
// insertData().then(() => {
//     console.log("Done inserting 20 vacations.");
// }).catch((error) => {
//     console.error("Error inserting vacations:", error);
// });

const deleteDataAndReset = async () => {
    try {
        // מחיקת כל המשתמשים
        let q = `DELETE FROM followers;`;
        await runQuery(q);
        console.log("All followers deleted.");

        q = `DELETE FROM vacations;`;
        await runQuery(q);
        console.log("All vacations deleted.");

        q = `DELETE FROM users;`;
        await runQuery(q);
        console.log("All users deleted.");

        // לאפס את ה-AUTO_INCREMENT עבור טבלאות vacations ו-users
        q = `ALTER TABLE vacations AUTO_INCREMENT = 1;`;
        await runQuery(q);
        console.log("Vacation table AUTO_INCREMENT reset to 1.");

        q = `ALTER TABLE users AUTO_INCREMENT = 1;`; // איפוס ה-AUTO_INCREMENT עבור users
        await runQuery(q);
        console.log("User table AUTO_INCREMENT reset to 1.");

        // הכנס מחדש את כל החופשות (אותן חופשות שהיו קודם)
        const vacations = [
            ['Sydney', 'Visit the iconic Sydney Opera House and enjoy the stunning harbor views.', '2024-08-20', '2024-08-30', 1600.00],
            ['Paris', 'Explore the Eiffel Tower, Louvre, and more in the romantic city of Paris.', '2024-09-01', '2024-09-10', 2000.00],
            ['Tokyo', 'Experience the culture, technology, and history in Japan’s capital.', '2024-09-05', '2024-09-15', 1800.00],
            ['New York', 'Discover the Big Apple with its skyscrapers, Central Park, and Broadway.', '2024-09-10', '2024-09-20', 2200.00],
            ['Rome', 'Explore the ancient city with historical sites like the Colosseum and Vatican City.', '2024-09-12', '2024-09-22', 1500.00],
            ['London', 'Visit iconic landmarks such as the Big Ben, Buckingham Palace, and the British Museum.', '2024-09-15', '2024-09-25', 2100.00],
            ['Barcelona', 'Enjoy the beautiful beaches and architecture of the Mediterranean city.', '2024-09-18', '2024-09-28', 1900.00],
            ['Berlin', 'Immerse yourself in the history and culture of Germany’s capital.', '2024-09-20', '2024-09-30', 1700.00],
            ['Amsterdam', 'Experience the beautiful canals and museums in the Netherlands capital.', '2024-10-01', '2024-10-10', 1600.00],
            ['Dubai', 'Explore the luxury and modern wonders of the UAE, from the Burj Khalifa to desert safaris.', '2024-10-05', '2024-10-15', 2500.00],
            ['Cape Town', 'Enjoy the stunning views from Table Mountain and the beautiful beaches of South Africa.', '2024-10-07', '2024-10-17', 1800.00],
            ['Los Angeles', 'Visit the entertainment capital of the world, home to Hollywood and famous beaches.', '2024-10-10', '2024-10-20', 2000.00],
            ['Rio de Janeiro', 'Relax on the beautiful beaches of Rio and explore the iconic Christ the Redeemer statue.', '2024-10-12', '2024-10-22', 1700.00],
            ['Moscow', 'Explore Russia’s capital with its grand architecture and historical landmarks.', '2024-10-15', '2024-10-25', 2200.00],
            ['Seoul', 'Visit the vibrant city of Seoul with its mix of traditional and modern attractions.', '2024-10-18', '2024-10-28', 1900.00],
            ['Cairo', 'Discover the ancient pyramids, Sphinx, and Egypt’s fascinating history.', '2024-10-20', '2024-10-30', 1600.00],
            ['Bangkok', 'Explore the bustling capital of Thailand, known for its street food, temples, and vibrant nightlife.', '2024-10-22', '2024-11-01', 1500.00],
            ['Buenos Aires', 'Experience the culture, art, and food of Argentina’s capital.', '2024-10-25', '2024-11-04', 1800.00],
            ['Istanbul', 'Discover the rich history and culture of the city that bridges Europe and Asia.', '2024-10-28', '2024-11-07', 1700.00],
            ['Singapore', 'Enjoy the modern, clean, and diverse city-state with attractions like Gardens by the Bay and Marina Bay Sands.', '2024-11-01', '2024-11-10', 2000.00],
            ['Lisbon', 'Explore the historic streets and beautiful architecture of Portugal’s capital.', '2024-11-05', '2024-11-15', 1600.00]
        ];

        for (const vacation of vacations) {
            let q = `INSERT INTO vacations (destination, description, start_date, end_date, price) VALUES 
                ('${vacation[0]}', '${vacation[1]}', '${vacation[2]}', '${vacation[3]}', ${vacation[4]});`;
            await runQuery(q);
        }
        console.log("Vacations reinserted successfully.");
    } catch (error) {
        console.error("Error resetting data:", error);
    }
};

// קריאה לפונקציה
deleteDataAndReset().then(() => {
    console.log("Done resetting data.");
}).catch((error) => {
    console.error("Error resetting data:", error);
});