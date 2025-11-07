import { CHANGEEXAMS,UPDATEUSER } from "./type";
export const updateUser=(regNo)=>{
    return{
        type:UPDATEUSER,
        payload:regNo
    }
}
export const changeExams=(exams)=>{
    console.log("updated exams:",exams)
    return{
        type:CHANGEEXAMS,
        payload:exams
    }
}