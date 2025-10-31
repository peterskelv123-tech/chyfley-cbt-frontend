import { CHANGEEXAMS,UPDATEUSER } from "./type";
export const updateUser=(regNo)=>{
    return{
        type:UPDATEUSER,
        payload:regNo
    }
}
export const changeExams=(exams)=>{
    return{
        type:CHANGEEXAMS,
        payload:exams
    }
}