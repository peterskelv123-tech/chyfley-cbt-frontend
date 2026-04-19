import { useState } from "react";
import "../components/top.css";
import { Top } from "../components/loginTop";
import { Textinput } from "../components/inputelement";
import { useNavigate } from "react-router-dom";
import { api } from "../api/baseAxious";
import { updateUser, changeExams } from "../action";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
export const LoginPage = () => {
  const navigation = useNavigate()
  const dispatch = useDispatch()
  const [loginDetail, setLoginDetails] = useState({
    "full Name": "",
    class: "",
  });

  const editLoginDetails = (part, value) => {
    setLoginDetails((prev) => ({
      ...prev,
      [part]: value,
    }));
  };
  const login = async () => {
    if (Object.values(loginDetail).some((item) => item === "")) {
      //alert("Please fill all fields");
      toast.error("Please fill all fields", { duration: 4000 });
      return;
    }
    if (loginDetail.class === "admin" && loginDetail["full Name"] === "admin") {
      navigation("/dashboard", { replace: true })
    } else {
      console.log("Making request to:", `/exams?className=${loginDetail.class}`);
      try {
        // 🔹 Call the API with className from password
        const response = await api.get(`/exams/take`, {
          params: { className: loginDetail.class, regNo: loginDetail["full Name"] },
        });
        console.log("API Response:", response.data); // 🔍 Debug log for API response
        if (response.data.statusCode === 200) {
          const { data } = response.data; // depends on how your ResponseService wraps output
          console.log("Fetched Exam Data:", response.data.data);
          dispatch(updateUser(loginDetail["full Name"]))
          if (data.length === 1) {
            dispatch(changeExams(data))
            navigation("/exam", { replace: true })
          }
          else {
            dispatch(changeExams(data))
            navigation("/exam-selection", { replace: true })
          }
        } else {
          console.error("Login failed with status code:", response.data);
          toast.error(response.data.message || "Failed to fetch exam data. Try again.", { duration: 4000 });
        }
      } catch (error) {
        console.error("Login failed:", error);
        const message =
          error.response?.data?.message || "Failed to fetch exam data. Try again.";
        toast.error(message, { duration: 4000 });
      }
    }
  };
  const leftHalfStyle = {
    height: "100vh",
    backgroundImage: `url(/img/exam5.jpg)`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    position: "relative",
  };

  const redHueStyle = {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100vh",
  };

  return (
    <div className="container-fluid h-100" style={{ overflowY: "auto" }}>
      <div className="row h-100">
        {/* Form section */}
        <div className="col-md-6 formholder d-flex flex-column align-items-stretch position-relative h-100 min-vh-100">
          <Top content="Log in" />
          <div
            className="container-fluid position-relative"
            style={{ marginTop: "4.5rem" }}
          >
            {Object.keys(loginDetail).map((item) => (
              <Textinput
                key={item}
                action={(e) => editLoginDetails(item, e.target.value)}
                inputType={item !== "password" ? "text" : "password"}
                placeholder={item === "full Name" ? `Enter your ${item}` : `Enter your ${item} (without space)`}
                variable={item.toUpperCase()}
                value={loginDetail[item]}
              />
            ))}
          </div>
          <button
            className="submit-button position-absolute bottom-0 start-50 translate-middle-x w-75 mb-3"
            onClick={() => {
              login();
            }}
          >
            Login
          </button>
        </div>

        {/* Image section */}
        <div
          className="col-md-6 d-none d-sm-block align-items-stretch"
          style={leftHalfStyle}
        >
          <div style={redHueStyle}></div>
          <div className="bottom-div-container">
            <div className="bottom-div">
              <h3>Welcome to CBT portal</h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
