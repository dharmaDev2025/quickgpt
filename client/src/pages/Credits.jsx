import React, { useEffect, useState } from "react";
import { dummyPlans } from "../assets/assets";
import Loading from "./Loading";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";

const Credits = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const{axios,token}=useAppContext();
  const fetchPlans=async()=>{
    try {
      const{data}=await axios.get('/api/credit/plan',{
      headers:{Authorization:token}  
      })
      if(data.success){
        setPlans(data.plans)
      }else{
        toast.error(data.message||'failedto fetch plans')
      }
      
    } catch (error) {
      toast.error(error.message)
      
    }
    setLoading(false)

  }
  const purchasePlan=async(planId)=>{
    try {
      const{data}=await axios.post('/api/credit/purchase',{planId},{headers:{Authorization:token}});
      if(data.success){
        window.location.href=data.url;
      }else{
        toast.error(data.message)
      }
      
    } catch (error) {
      toast.error(error.message);
      
    }
  }

  useEffect(() => {
    fetchPlans()
   
  }, []);

  if (loading) return <Loading />;

  return (
    <div
      className="
        min-h-screen mx-auto px-4 py-16
        bg-gray-50
        dark:bg-gradient-to-b dark:from-black dark:to-gray-900
      "
    >
      <h2 className="text-3xl font-semibold text-center mb-12 text-gray-800 dark:text-white">
        Credit Plans
      </h2>

      <div className="flex justify-center gap-8 flex-wrap">
        {plans.map((plan) => {
          const isPro = plan._id === "pro";

          return (
            <div
              key={plan._id}
              className={`
                w-[260px] rounded-xl p-6 text-center transition-all flex flex-col
                bg-white border border-gray-200 shadow-sm hover:shadow-md
                dark:bg-transparent dark:border-purple-700 dark:shadow-none
                ${isPro ? "dark:bg-purple-700" : ""}
              `}
            >
              {/* Plan Name */}
              <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                {plan.name}
              </h3>

              {/* Price + Credits */}
              <p className="font-semibold mb-4">
                <span className="text-lg text-purple-600 dark:text-purple-300">
                  ${plan.price}
                </span>
                <span className="text-sm text-gray-600 dark:text-purple-300">
                  {" "} / {plan.credits} credits
                </span>
              </p>

              {/* Features List */}
              <ul className="list-disc list-inside text-sm text-gray-700 dark:text-white space-y-2 text-left mb-6">
                {(plan.features || []).map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>

              {/* Add Now Button */}
              <button onClick={()=>toast.promise(purchasePlan(plan._id),{loading:'processing...'})}
                className="
                  mt-auto w-full py-2 rounded-lg font-semibold
                  bg-purple-600 text-white
                  hover:bg-purple-700 transition-colors
                  dark:bg-purple-500 dark:hover:bg-purple-600
                "
              >
                Buy Now
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Credits;
