// טיפוס למידע של משתמש שנשמר בבסיס הנתונים
export type UserData = {
    firstName: string;  
    lastName: string;   
    email: string;
    password?: string;
    isAdmin: boolean;   
    userId?: number;   
};

export interface UserPayload {
    id: number;        
    email: string;
    isAdmin: boolean;
    firstName: string;  
    lastName: string;  
    token: string;
}
