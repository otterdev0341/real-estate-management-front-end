export interface ReqCreateUserDto {
    email: string;
    password: string;
    username: string;
    firstName: string;
    lastName: string;
    gender: string;
    dob: string; // ISO date string @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss", shape = JsonFormat.Shape.STRING)
}