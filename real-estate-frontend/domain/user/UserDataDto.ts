export interface UserData {
  id: string;          // UUID
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  dob: string;         // ISO date string: yyyy-MM-dd'T'HH:mm:ss
  gender: 'male' | 'female' | string; // or make it just string if not limited
  role: 'user' | 'admin' | string;    // or string if you have more roles
}