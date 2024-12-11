
 export interface Vacation {
    vacation_id: number;
    destination: string;
    description: string;
    start_date: string;
    end_date: string;
    price: number;
    followersCount: number;
    image_file_name: string;
}

// הגדרת הטיפוס עבור חופשה ומספר עוקבים
export interface VacationWithFollowers {
    vacation_id: number;
    followers_count: number;
}
