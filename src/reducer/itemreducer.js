import { CHANGEEXAMS,UPDATEUSER } from "../action/type";
const initialstate = {
  regNo:"",
  exams:[]
};
export const itemreducer = (state = initialstate, action) => {
  switch (action.type) {
   case UPDATEUSER:
      return {
        ...state,
        regNo: action.payload,
      };
    case CHANGEEXAMS:
      return {
        ...state,
        exams: action.payload,
      };
    default:
      return state;
  }
};
